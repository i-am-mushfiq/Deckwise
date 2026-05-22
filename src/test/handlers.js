/**
 * MSW request handlers — shared across the full test suite.
 *
 * The default handler returns a minimal, deterministic topic so every test
 * that exercises the AI generate flow gets a predictable payload without
 * having to wire up its own network mock.
 *
 * Individual tests can override with:
 *   server.use(http.post('http://localhost:3000/api/generate', () => ...))
 */
import { http, HttpResponse } from 'msw';

/** Canonical AI-generated topic returned by the default handler */
export const GENERATED_TOPIC = {
  id: 'topic-gen-1',
  title: 'Stoicism',
  type: 'topic',
  path: [],
  cards: [
    {
      id: 'sg-1', order: 1,
      title: 'What Is Stoicism?',
      body: 'Ancient philosophy of resilience founded by Zeno.',
      context: 'Founded in Athens around 300 BC.',
      tags: ['foundational'], difficulty: 1,
    },
    {
      id: 'sg-2', order: 2,
      title: 'Dichotomy of Control',
      body: 'Focus only on what you can control.',
      context: 'The bedrock of Stoic practice, from Epictetus.',
      tags: ['foundational'], difficulty: 1,
    },
  ],
};

export const handlers = [
  // The app calls a relative URL; jsdom resolves it against
  // the configured base URL (http://localhost:3000).
  http.post('http://localhost:3000/api/generate', () =>
    HttpResponse.json(GENERATED_TOPIC)
  ),
];
