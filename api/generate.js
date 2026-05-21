export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body || {};
  if (!prompt?.trim()) {
    return res.status(400).json({ error: 'prompt is required' });
  }

  const key = process.env.GROQ_API_KEY;
  if (!key) {
    return res.status(503).json({ error: 'AI generation is not available right now.' });
  }

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

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      return res.status(502).json({ error: 'AI returned malformed JSON. Please try again.' });
    }

    if (!Array.isArray(result.cards) || result.cards.length === 0) {
      return res.status(502).json({ error: 'No cards returned. Try a more specific topic.' });
    }

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Generation failed. Please try again.' });
  }
}
