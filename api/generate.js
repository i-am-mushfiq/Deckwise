import { createClient } from '@supabase/supabase-js';

// ── Tier config — add pro/enterprise here when subscriptions are added ────────
const AI_TIERS = {
  free: { dailyLimit: 1000, label: 'Free' },
  // pro:  { dailyLimit: Infinity, label: 'Pro' },
};

function getTodayGMT() {
  return new Date().toISOString().slice(0, 10);
}

// Admin Supabase client — uses service role key (bypasses RLS).
// Only initialised when both env vars are present; gracefully absent otherwise.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = (supabaseUrl && serviceKey)
  ? createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body || {};
  if (!prompt?.trim()) {
    return res.status(400).json({ error: 'prompt is required' });
  }
  if (prompt.length > 5000) {
    return res.status(400).json({ error: 'Prompt too long (max 5000 characters).' });
  }

  // ── Auth + usage check ────────────────────────────────────────────────────
  let userId = null;
  let currentCount = 0;
  const tier = AI_TIERS.free; // TODO: look up user tier when subscriptions added

  const authHeader = req.headers?.['authorization'];
  const jwt = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (jwt && supabaseAdmin) {
    try {
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(jwt);
      if (!error && user) {
        userId = user.id;
        const today = getTodayGMT();
        const { data: usage } = await supabaseAdmin
          .from('ai_usage')
          .select('cards_count')
          .eq('user_id', userId)
          .eq('usage_date', today)
          .maybeSingle();
        currentCount = usage?.cards_count ?? 0;

        if (currentCount >= tier.dailyLimit) {
          return res.status(429).json({
            error: `Daily limit of ${tier.dailyLimit} AI cards reached. Resets at 00:00 GMT.`,
            usage: {
              used: currentCount,
              limit: tier.dailyLimit,
              remaining: 0,
            },
          });
        }
      }
    } catch (e) {
      // Non-fatal: if auth check fails, continue without tracking
      console.error('Auth/usage check error:', e.message);
    }
  }

  // ── Groq call ─────────────────────────────────────────────────────────────
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    return res.status(503).json({ error: 'AI generation is not available right now.' });
  }

  let result;
  try {
    const groqRes = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0.7,
          max_tokens: 8192,
        }),
      }
    );

    if (!groqRes.ok) {
      let msg = '';
      try { const e = await groqRes.json(); msg = e.error?.message || ''; } catch {}
      if (groqRes.status === 401) return res.status(401).json({ error: 'Invalid API key.' });
      if (groqRes.status === 429) return res.status(429).json({ error: `Rate limit reached — try again in a minute.${msg ? ' (' + msg + ')' : ''}` });
      if (groqRes.status === 400) return res.status(400).json({ error: 'Invalid request — try rephrasing your topic.' });
      return res.status(502).json({ error: `Generation failed${msg ? ': ' + msg : ''}` });
    }

    const data = await groqRes.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      return res.status(502).json({ error: 'Empty response from AI. Please try again.' });
    }

    try {
      result = JSON.parse(text);
    } catch {
      return res.status(502).json({ error: 'AI returned malformed JSON. Please try again.' });
    }

    if (!Array.isArray(result.cards) || result.cards.length === 0) {
      return res.status(502).json({ error: 'No cards returned. Try a more specific topic.' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Generation failed. Please try again.' });
  }

  // ── Track usage after successful generation ───────────────────────────────
  const newCount = currentCount + result.cards.length;
  if (userId && supabaseAdmin) {
    try {
      await supabaseAdmin.from('ai_usage').upsert(
        {
          user_id:     userId,
          usage_date:  getTodayGMT(),
          cards_count: newCount,
          updated_at:  new Date().toISOString(),
        },
        { onConflict: 'user_id,usage_date' }
      );
    } catch (e) {
      // Non-fatal: generation succeeded; don't fail the request over tracking
      console.error('Usage tracking error:', e.message);
    }
  }

  return res.status(200).json({
    ...result,
    _usage: {
      used:      userId ? newCount : null,
      limit:     tier.dailyLimit,
      remaining: userId ? Math.max(0, tier.dailyLimit - newCount) : null,
    },
  });
}
