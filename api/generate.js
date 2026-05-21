export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body || {};
  if (!prompt?.trim()) {
    return res.status(400).json({ error: 'prompt is required' });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return res.status(503).json({ error: 'AI generation is not available right now.' });
  }

  try {
    const geminiRes = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      let msg = '';
      try { const e = await geminiRes.json(); msg = e.error?.message || ''; } catch {}
      if (geminiRes.status === 400) return res.status(400).json({ error: 'Invalid request — try rephrasing your topic.' });
      if (geminiRes.status === 429) return res.status(429).json({ error: `Rate limit reached — try again in a minute.${msg ? ' (' + msg + ')' : ''}` });
      return res.status(502).json({ error: `Generation failed${msg ? ': ' + msg : ''}` });
    }

    const data = await geminiRes.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      const reason = data.candidates?.[0]?.finishReason;
      if (reason === 'SAFETY') {
        return res.status(400).json({ error: 'This topic was flagged for safety. Try rephrasing.' });
      }
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
