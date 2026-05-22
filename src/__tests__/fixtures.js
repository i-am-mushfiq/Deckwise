/**
 * Shared test fixtures
 *
 * TINY_LIBRARY is the minimal library seeded for integration tests.
 * It has exactly 2 cards in one topic so tests can reason about exact
 * card positions, progress counts, and completion states.
 *
 * Card ids 't1' / 't2' match what the localStorage keys store — tests can
 * assert `JSON.parse(localStorage.getItem('sl-conf'))` contains 't1' etc.
 */

export const TINY_LIBRARY = {
  id: 'root',
  title: 'My Library',
  type: 'directory',
  children: [
    {
      id: 'topic-tiny',
      title: 'Tiny Topic',
      type: 'topic',
      path: [],
      cards: [
        {
          id: 't1', order: 1,
          title: 'First Card',
          body: 'Body of first card.',
          context: 'Deep dive of first card.',
          tags: ['foundational'],
          difficulty: 1,
        },
        {
          id: 't2', order: 2,
          title: 'Second Card',
          body: 'Body of second card.',
          context: 'Deep dive of second card.',
          tags: ['foundational'],
          difficulty: 1,
        },
      ],
    },
  ],
};
