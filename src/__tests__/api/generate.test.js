// @vitest-environment node
/**
 * API tests — api/generate.js
 *
 * Tests every branching path in the serverless handler without making real
 * network requests.  Global `fetch` is stubbed per-test.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import handler from '../../../api/generate.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Build a minimal req object for the handler signature */
const req = (method, body = {}) => ({ method, body });

/** Create a mock `res` object that captures status/body like Express/Vercel */
const mockRes = () => {
  const r = { _status: null, _body: null, _headers: {} };
  r.status    = (code)      => { r._status = code; return r; };
  r.json      = (body)      => { r._body   = body; return r; };
  r.end       = ()          => r;                           // for 204 / OPTIONS
  r.setHeader = (key, val)  => { r._headers[key] = val; }; // for CORS headers
  return r;
};

/**
 * Build a fake Groq API response.
 * @param {boolean} ok       - whether res.ok is true
 * @param {number}  status   - HTTP status code
 * @param {object}  body     - the JSON body returned by res.json()
 */
const groqResp = (ok, status, body) => ({
  ok,
  status,
  json: vi.fn().mockResolvedValue(body),
});

/** Build the minimal valid Groq response payload containing one card */
const validGroqPayload = (cards = undefined) => {
  const c = cards ?? [
    { id: 'c1', order: 1, title: 'The Title', body: 'The body text.', context: 'Deeper context.', tags: ['foundational'], difficulty: 1 },
  ];
  return {
    choices: [{ message: { content: JSON.stringify({ id: 'topic-1', title: 'Test Topic', type: 'topic', path: [], cards: c }) } }],
  };
};

// ── Setup / teardown ──────────────────────────────────────────────────────────

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
  delete process.env.GROQ_API_KEY;
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.GROQ_API_KEY;
});

// ── Method guard ──────────────────────────────────────────────────────────────

describe('method guard', () => {
  it('returns 204 for OPTIONS requests (CORS preflight)', async () => {
    const res = mockRes();
    await handler(req('OPTIONS'), res);
    expect(res._status).toBe(204);
  });

  it('sets CORS headers on every response', async () => {
    const res = mockRes();
    await handler(req('OPTIONS'), res);
    expect(res._headers['Access-Control-Allow-Origin']).toBeDefined();
    expect(res._headers['Access-Control-Allow-Methods']).toMatch(/POST/);
  });

  it('returns 405 for GET requests', async () => {
    const res = mockRes();
    await handler(req('GET'), res);
    expect(res._status).toBe(405);
    expect(res._body.error).toMatch(/not allowed/i);
  });

  it('returns 405 for PUT requests', async () => {
    const res = mockRes();
    await handler(req('PUT'), res);
    expect(res._status).toBe(405);
  });

  it('returns 405 for DELETE requests', async () => {
    const res = mockRes();
    await handler(req('DELETE'), res);
    expect(res._status).toBe(405);
  });
});

// ── Input validation ──────────────────────────────────────────────────────────

describe('input validation', () => {
  it('returns 400 when body is empty (no prompt key)', async () => {
    const res = mockRes();
    await handler(req('POST', {}), res);
    expect(res._status).toBe(400);
    expect(res._body.error).toMatch(/prompt is required/i);
  });

  it('returns 400 when prompt is an empty string', async () => {
    const res = mockRes();
    await handler(req('POST', { prompt: '' }), res);
    expect(res._status).toBe(400);
    expect(res._body.error).toMatch(/prompt is required/i);
  });

  it('returns 400 when prompt is whitespace only', async () => {
    const res = mockRes();
    await handler(req('POST', { prompt: '   \t\n  ' }), res);
    expect(res._status).toBe(400);
    expect(res._body.error).toMatch(/prompt is required/i);
  });
});

// ── API key guard ─────────────────────────────────────────────────────────────

describe('API key guard', () => {
  it('returns 503 when GROQ_API_KEY is not set', async () => {
    const res = mockRes();
    await handler(req('POST', { prompt: 'Stoicism' }), res);
    expect(res._status).toBe(503);
    expect(res._body.error).toMatch(/not available/i);
  });

  it('does not call fetch when GROQ_API_KEY is missing', async () => {
    const res = mockRes();
    await handler(req('POST', { prompt: 'test' }), res);
    expect(fetch).not.toHaveBeenCalled();
  });
});

// ── Groq API error handling ───────────────────────────────────────────────────

describe('Groq API error responses (GROQ_API_KEY set)', () => {
  beforeEach(() => { process.env.GROQ_API_KEY = 'gsk_test_key'; });

  it('returns 401 when Groq responds with 401', async () => {
    fetch.mockResolvedValue(groqResp(false, 401, { error: { message: 'Unauthorized' } }));
    const res = mockRes();
    await handler(req('POST', { prompt: 'test' }), res);
    expect(res._status).toBe(401);
    expect(res._body.error).toMatch(/invalid api key/i);
  });

  it('returns 429 when Groq responds with 429', async () => {
    fetch.mockResolvedValue(groqResp(false, 429, { error: { message: 'Rate limited' } }));
    const res = mockRes();
    await handler(req('POST', { prompt: 'test' }), res);
    expect(res._status).toBe(429);
    expect(res._body.error).toMatch(/rate limit/i);
  });

  it('includes the Groq rate-limit message in the 429 response', async () => {
    fetch.mockResolvedValue(groqResp(false, 429, { error: { message: 'please wait 42s' } }));
    const res = mockRes();
    await handler(req('POST', { prompt: 'test' }), res);
    expect(res._body.error).toContain('please wait 42s');
  });

  it('returns 400 when Groq responds with 400', async () => {
    fetch.mockResolvedValue(groqResp(false, 400, { error: { message: 'invalid param' } }));
    const res = mockRes();
    await handler(req('POST', { prompt: 'test' }), res);
    expect(res._status).toBe(400);
    expect(res._body.error).toMatch(/rephras/i);
  });

  it('returns 502 for unrecognised 5xx Groq errors', async () => {
    fetch.mockResolvedValue(groqResp(false, 503, { error: { message: 'Service unavailable' } }));
    const res = mockRes();
    await handler(req('POST', { prompt: 'test' }), res);
    expect(res._status).toBe(502);
  });

  it('returns 502 for unrecognised 4xx Groq errors', async () => {
    fetch.mockResolvedValue(groqResp(false, 422, { error: { message: 'Unprocessable' } }));
    const res = mockRes();
    await handler(req('POST', { prompt: 'test' }), res);
    expect(res._status).toBe(502);
  });

  it('returns 500 when fetch itself throws (network failure)', async () => {
    fetch.mockRejectedValue(new Error('ECONNREFUSED'));
    const res = mockRes();
    await handler(req('POST', { prompt: 'test' }), res);
    expect(res._status).toBe(500);
    expect(res._body.error).toMatch(/failed/i);
  });
});

// ── Successful Groq response parsing ─────────────────────────────────────────

describe('Groq response parsing (GROQ_API_KEY set)', () => {
  beforeEach(() => { process.env.GROQ_API_KEY = 'gsk_test_key'; });

  it('returns 502 when content field is empty string', async () => {
    fetch.mockResolvedValue(groqResp(true, 200, {
      choices: [{ message: { content: '' } }],
    }));
    const res = mockRes();
    await handler(req('POST', { prompt: 'test' }), res);
    expect(res._status).toBe(502);
    expect(res._body.error).toMatch(/empty response/i);
  });

  it('returns 502 when choices array is empty', async () => {
    fetch.mockResolvedValue(groqResp(true, 200, { choices: [] }));
    const res = mockRes();
    await handler(req('POST', { prompt: 'test' }), res);
    expect(res._status).toBe(502);
  });

  it('returns 502 when choices is missing entirely', async () => {
    fetch.mockResolvedValue(groqResp(true, 200, {}));
    const res = mockRes();
    await handler(req('POST', { prompt: 'test' }), res);
    expect(res._status).toBe(502);
  });

  it('returns 502 when content is malformed JSON', async () => {
    fetch.mockResolvedValue(groqResp(true, 200, {
      choices: [{ message: { content: '{ not valid json' } }],
    }));
    const res = mockRes();
    await handler(req('POST', { prompt: 'test' }), res);
    expect(res._status).toBe(502);
    expect(res._body.error).toMatch(/malformed json/i);
  });

  it('returns 502 when parsed JSON has no "cards" key', async () => {
    fetch.mockResolvedValue(groqResp(true, 200, {
      choices: [{ message: { content: JSON.stringify({ title: 'No cards here' }) } }],
    }));
    const res = mockRes();
    await handler(req('POST', { prompt: 'test' }), res);
    expect(res._status).toBe(502);
    expect(res._body.error).toMatch(/no cards/i);
  });

  it('returns 502 when "cards" is an empty array', async () => {
    fetch.mockResolvedValue(groqResp(true, 200, {
      choices: [{ message: { content: JSON.stringify({ cards: [] }) } }],
    }));
    const res = mockRes();
    await handler(req('POST', { prompt: 'test' }), res);
    expect(res._status).toBe(502);
    expect(res._body.error).toMatch(/no cards/i);
  });

  it('returns 502 when "cards" is not an array', async () => {
    fetch.mockResolvedValue(groqResp(true, 200, {
      choices: [{ message: { content: JSON.stringify({ cards: 'oops' }) } }],
    }));
    const res = mockRes();
    await handler(req('POST', { prompt: 'test' }), res);
    expect(res._status).toBe(502);
  });

  it('returns 200 with the full parsed result on success', async () => {
    fetch.mockResolvedValue(groqResp(true, 200, validGroqPayload()));
    const res = mockRes();
    await handler(req('POST', { prompt: 'Stoic philosophy' }), res);
    expect(res._status).toBe(200);
    expect(res._body.cards).toHaveLength(1);
    expect(res._body.title).toBe('Test Topic');
  });

  it('handles multiple cards returned by the model', async () => {
    const cards = [
      { id: 'c1', order: 1, title: 'One',   body: 'B1', context: '', tags: [], difficulty: 1 },
      { id: 'c2', order: 2, title: 'Two',   body: 'B2', context: '', tags: [], difficulty: 1 },
      { id: 'c3', order: 3, title: 'Three', body: 'B3', context: '', tags: [], difficulty: 2 },
    ];
    fetch.mockResolvedValue(groqResp(true, 200, validGroqPayload(cards)));
    const res = mockRes();
    await handler(req('POST', { prompt: 'history' }), res);
    expect(res._status).toBe(200);
    expect(res._body.cards).toHaveLength(3);
  });

  it('sends POST to the correct Groq endpoint', async () => {
    fetch.mockResolvedValue(groqResp(true, 200, validGroqPayload()));
    const res = mockRes();
    await handler(req('POST', { prompt: 'test' }), res);
    const [url] = fetch.mock.calls[0];
    expect(url).toBe('https://api.groq.com/openai/v1/chat/completions');
  });

  it('sends the correct model name to Groq', async () => {
    fetch.mockResolvedValue(groqResp(true, 200, validGroqPayload()));
    const res = mockRes();
    await handler(req('POST', { prompt: 'test' }), res);
    const options = fetch.mock.calls[0][1];
    const body = JSON.parse(options.body);
    expect(body.model).toBe('llama-3.3-70b-versatile');
  });

  it('forwards the API key in the Authorization header', async () => {
    fetch.mockResolvedValue(groqResp(true, 200, validGroqPayload()));
    const res = mockRes();
    await handler(req('POST', { prompt: 'test' }), res);
    const options = fetch.mock.calls[0][1];
    expect(options.headers['Authorization']).toBe('Bearer gsk_test_key');
  });

  it('requests JSON object response format from Groq', async () => {
    fetch.mockResolvedValue(groqResp(true, 200, validGroqPayload()));
    const res = mockRes();
    await handler(req('POST', { prompt: 'test' }), res);
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.response_format).toEqual({ type: 'json_object' });
  });

  it('passes the prompt as the user message content', async () => {
    fetch.mockResolvedValue(groqResp(true, 200, validGroqPayload()));
    const res = mockRes();
    await handler(req('POST', { prompt: 'Quantum mechanics explained simply' }), res);
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.messages[0].content).toBe('Quantum mechanics explained simply');
  });
});
