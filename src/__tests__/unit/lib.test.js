/**
 * Unit tests — src/lib.js
 *
 * Pure functions only; no React, no DOM beyond localStorage.
 * All tests are synchronous.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  uid,
  flattenTopics,
  rebuildPaths,
  findAndUpdate,
  findAndDelete,
  insertInto,
  validateTopicImport,
  normalizeTopicImport,
  pruneOrphanedIds,
  KEYS,
  SCHEMA_VERSION,
  migrateLocalStorage,
  lsLoad,
  lsSave,
} from '../../lib.js';

// ── Test fixtures ─────────────────────────────────────────────────────────────
const card1 = { id: 'c1', order: 1, title: 'Card 1', body: 'b1', context: '', tags: [], difficulty: 1 };
const card2 = { id: 'c2', order: 2, title: 'Card 2', body: 'b2', context: '', tags: [], difficulty: 2 };
const card3 = { id: 'c3', order: 1, title: 'Card 3', body: 'b3', context: '', tags: [], difficulty: 1 };

// NOTE: topics have NO `path` property intentionally.
// flattenTopics uses `node.path || accumulatedPath`. An empty array `[]` is
// truthy, so fixtures with `path: []` would always suppress path accumulation.
// Omitting the property (undefined → falsy) lets the function accumulate paths.
const topicA = { id: 'tA', title: 'Topic A', type: 'topic', cards: [card1, card2] };
const topicB = { id: 'tB', title: 'Topic B', type: 'topic', cards: [card3] };
const folderA = { id: 'fA', title: 'Folder A', type: 'directory', children: [topicA] };
const root = {
  id: 'root',
  title: 'Library',
  type: 'directory',
  children: [folderA, topicB],
};

// ── uid ───────────────────────────────────────────────────────────────────────
describe('uid', () => {
  it('returns a non-empty string', () => {
    expect(typeof uid()).toBe('string');
    expect(uid().length).toBeGreaterThan(0);
  });

  it('is base-36 alphanumeric', () => {
    expect(uid()).toMatch(/^[0-9a-z]+$/);
  });

  it('generates distinct values on repeated calls', () => {
    const ids = new Set(Array.from({ length: 200 }, uid));
    expect(ids.size).toBe(200);
  });
});

// ── flattenTopics ─────────────────────────────────────────────────────────────
describe('flattenTopics', () => {
  it('returns a flat list of all topics', () => {
    const result = flattenTopics(root);
    expect(result).toHaveLength(2);
    const ids = result.map(t => t.id);
    expect(ids).toContain('tA');
    expect(ids).toContain('tB');
  });

  it('builds correct path for a nested topic', () => {
    const result = flattenTopics(root);
    const a = result.find(t => t.id === 'tA');
    expect(a.path).toEqual(['Library', 'Folder A']);
  });

  it('builds correct path for a root-level topic', () => {
    const result = flattenTopics(root);
    const b = result.find(t => t.id === 'tB');
    expect(b.path).toEqual(['Library']);
  });

  it('returns the topic itself when called directly on a topic node', () => {
    const result = flattenTopics(topicA);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('tA');
  });

  it('preserves the existing path when the topic already has one', () => {
    const withPath = { ...topicA, path: ['Pre', 'Set'] };
    const result = flattenTopics(withPath);
    expect(result[0].path).toEqual(['Pre', 'Set']);
  });

  it('returns empty array for a directory with no children', () => {
    const emptyDir = { id: 'x', title: 'Empty', type: 'directory', children: [] };
    expect(flattenTopics(emptyDir)).toHaveLength(0);
  });

  it('handles three levels of nesting', () => {
    const deep = {
      id: 'r', title: 'R', type: 'directory',
      children: [{
        id: 'd1', title: 'D1', type: 'directory',
        children: [{
          id: 'd2', title: 'D2', type: 'directory',
          children: [topicA],
        }],
      }],
    };
    const result = flattenTopics(deep);
    expect(result).toHaveLength(1);
    expect(result[0].path).toEqual(['R', 'D1', 'D2']);
  });

  it('does not mutate the original node', () => {
    const before = JSON.stringify(root);
    flattenTopics(root);
    expect(JSON.stringify(root)).toBe(before);
  });
});

// ── rebuildPaths ──────────────────────────────────────────────────────────────
describe('rebuildPaths', () => {
  it('assigns correct paths to nested topics', () => {
    const rebuilt = rebuildPaths(root);
    const topics = flattenTopics(rebuilt);
    const a = topics.find(t => t.id === 'tA');
    expect(a.path).toEqual(['Library', 'Folder A']);
  });

  it('assigns correct paths to root-level topics', () => {
    const rebuilt = rebuildPaths(root);
    const topics = flattenTopics(rebuilt);
    const b = topics.find(t => t.id === 'tB');
    expect(b.path).toEqual(['Library']);
  });

  it('preserves the root node id and structure', () => {
    const rebuilt = rebuildPaths(root);
    expect(rebuilt.id).toBe('root');
    expect(rebuilt.children).toHaveLength(2);
  });

  it('returns a topic node with the path arg when called directly', () => {
    const result = rebuildPaths(topicA, ['A', 'B']);
    expect(result.path).toEqual(['A', 'B']);
    expect(result.id).toBe('tA');
  });

  it('does not mutate the original tree', () => {
    const before = JSON.stringify(root);
    rebuildPaths(root);
    expect(JSON.stringify(root)).toBe(before);
  });
});

// ── findAndUpdate ─────────────────────────────────────────────────────────────
describe('findAndUpdate', () => {
  it('updates the node matching the given id', () => {
    const updated = findAndUpdate(root, 'tA', n => ({ ...n, title: 'Updated A' }));
    const topics = flattenTopics(updated);
    expect(topics.find(t => t.id === 'tA').title).toBe('Updated A');
  });

  it('leaves all other nodes unchanged', () => {
    const updated = findAndUpdate(root, 'tA', n => ({ ...n, title: 'X' }));
    const topics = flattenTopics(updated);
    expect(topics.find(t => t.id === 'tB').title).toBe('Topic B');
  });

  it('updates the root node itself when ids match', () => {
    const updated = findAndUpdate(root, 'root', n => ({ ...n, title: 'New Root' }));
    expect(updated.title).toBe('New Root');
  });

  it('updates a deeply nested node', () => {
    const updated = findAndUpdate(root, 'fA', n => ({ ...n, title: 'Renamed Folder' }));
    const folder = updated.children.find(c => c.id === 'fA');
    expect(folder.title).toBe('Renamed Folder');
  });

  it('returns the tree unchanged when id is not found', () => {
    const updated = findAndUpdate(root, 'does-not-exist', n => ({ ...n, title: 'X' }));
    expect(JSON.stringify(updated)).toBe(JSON.stringify(root));
  });

  it('returns a topic node unchanged when it has no children and id differs', () => {
    const result = findAndUpdate(topicA, 'tB', n => ({ ...n, title: 'X' }));
    expect(result).toEqual(topicA);
  });

  it('does not mutate the original tree', () => {
    const before = JSON.stringify(root);
    findAndUpdate(root, 'tA', n => ({ ...n, title: 'Changed' }));
    expect(JSON.stringify(root)).toBe(before);
  });
});

// ── findAndDelete ─────────────────────────────────────────────────────────────
describe('findAndDelete', () => {
  it('removes the direct child matching the id', () => {
    const updated = findAndDelete(root, 'tB');
    expect(updated.children.find(c => c.id === 'tB')).toBeUndefined();
  });

  it('keeps all other nodes intact after deleting a top-level child', () => {
    const updated = findAndDelete(root, 'tB');
    const topics = flattenTopics(updated);
    expect(topics.find(t => t.id === 'tA')).toBeDefined();
  });

  it('removes a deeply nested topic', () => {
    const updated = findAndDelete(root, 'tA');
    const topics = flattenTopics(updated);
    expect(topics.find(t => t.id === 'tA')).toBeUndefined();
  });

  it('keeps sibling nodes when a nested node is deleted', () => {
    const updated = findAndDelete(root, 'tA');
    const topics = flattenTopics(updated);
    expect(topics.find(t => t.id === 'tB')).toBeDefined();
  });

  it('removes a directory folder', () => {
    const updated = findAndDelete(root, 'fA');
    expect(updated.children.find(c => c.id === 'fA')).toBeUndefined();
  });

  it('returns the node unchanged when it has no children', () => {
    const result = findAndDelete(topicA, 'c1');
    expect(result).toEqual(topicA);
  });

  it('returns tree unchanged when id is not found', () => {
    const result = findAndDelete(root, 'nonexistent');
    expect(JSON.stringify(result)).toBe(JSON.stringify(root));
  });

  it('does not mutate the original tree', () => {
    const before = JSON.stringify(root);
    findAndDelete(root, 'tB');
    expect(JSON.stringify(root)).toBe(before);
  });
});

// ── insertInto ────────────────────────────────────────────────────────────────
describe('insertInto', () => {
  const newTopic = { id: 'tC', title: 'Topic C', type: 'topic', path: [], cards: [] };

  it('appends child into the matching parent', () => {
    const updated = insertInto(root, 'root', newTopic);
    expect(updated.children).toHaveLength(3);
    expect(updated.children.find(c => c.id === 'tC')).toBeDefined();
  });

  it('inserts into a nested folder', () => {
    const updated = insertInto(root, 'fA', newTopic);
    const folder = updated.children.find(c => c.id === 'fA');
    expect(folder.children).toHaveLength(2);
    expect(folder.children.find(c => c.id === 'tC')).toBeDefined();
  });

  it('does not modify existing children of the target', () => {
    const updated = insertInto(root, 'fA', newTopic);
    const folder = updated.children.find(c => c.id === 'fA');
    expect(folder.children.find(c => c.id === 'tA')).toBeDefined();
  });

  it('returns tree unchanged when pid is not found', () => {
    const result = insertInto(root, 'nonexistent', newTopic);
    expect(JSON.stringify(result)).toBe(JSON.stringify(root));
  });

  it('returns topic node unchanged when no children and pid does not match', () => {
    // topicA.id is 'tA'; use a pid that doesn't exist anywhere in the tree
    const result = insertInto(topicA, 'nonexistent-pid', newTopic);
    expect(result).toEqual(topicA);
  });

  it('creates a children array when the parent has none', () => {
    const parentWithNoChildren = { id: 'p', title: 'P', type: 'directory', children: [] };
    const updated = insertInto(parentWithNoChildren, 'p', newTopic);
    expect(updated.children).toHaveLength(1);
    expect(updated.children[0].id).toBe('tC');
  });

  it('does not mutate the original tree', () => {
    const before = JSON.stringify(root);
    insertInto(root, 'root', newTopic);
    expect(JSON.stringify(root)).toBe(before);
  });
});

// ── validateTopicImport ───────────────────────────────────────────────────────
describe('validateTopicImport', () => {
  const good = {
    title: 'Biology',
    cards: [
      { title: 'Cell', body: 'The basic unit of life.' },
      { title: 'DNA',  body: 'Deoxyribonucleic acid.' },
    ],
  };

  it('returns null for a minimal valid topic', () => {
    expect(validateTopicImport(good)).toBeNull();
  });

  it('accepts optional fields being present without issue', () => {
    const withExtras = { ...good, cards: [{ ...good.cards[0], context: 'ctx', tags: ['a'], difficulty: 2 }] };
    expect(validateTopicImport(withExtras)).toBeNull();
  });

  it('returns an error string for null', () => {
    expect(validateTopicImport(null)).toBeTypeOf('string');
  });

  it('returns an error for an array at root', () => {
    expect(validateTopicImport([good])).toBeTypeOf('string');
  });

  it('returns an error for a plain string', () => {
    expect(validateTopicImport('Biology')).toBeTypeOf('string');
  });

  it('returns an error when title is missing', () => {
    expect(validateTopicImport({ cards: good.cards })).toBeTypeOf('string');
  });

  it('returns an error when title is only whitespace', () => {
    expect(validateTopicImport({ ...good, title: '   ' })).toBeTypeOf('string');
  });

  it('returns an error when cards is an object (not array)', () => {
    expect(validateTopicImport({ title: 'T', cards: {} })).toBeTypeOf('string');
  });

  it('returns an error for an empty cards array', () => {
    expect(validateTopicImport({ title: 'T', cards: [] })).toBeTypeOf('string');
  });

  it('returns an error when a card is missing title', () => {
    expect(validateTopicImport({ title: 'T', cards: [{ body: 'x' }] })).toBeTypeOf('string');
  });

  it('returns an error when a card has an empty title', () => {
    expect(validateTopicImport({ title: 'T', cards: [{ title: '', body: 'x' }] })).toBeTypeOf('string');
  });

  it('returns an error when a card is missing body', () => {
    expect(validateTopicImport({ title: 'T', cards: [{ title: 'X' }] })).toBeTypeOf('string');
  });

  it('returns an error when a card body is empty', () => {
    expect(validateTopicImport({ title: 'T', cards: [{ title: 'X', body: '' }] })).toBeTypeOf('string');
  });

  it('returns an error when a card is not an object', () => {
    expect(validateTopicImport({ title: 'T', cards: ['oops'] })).toBeTypeOf('string');
  });
});

// ── normalizeTopicImport ──────────────────────────────────────────────────────
describe('normalizeTopicImport', () => {
  const raw = {
    title: '  Physics  ',
    cards: [
      { title: '  Force  ', body: '  F = ma  ', difficulty: 2, tags: ['mechanics', 123, ''], context: ' deep ' },
      { title: 'Energy', body: 'Capacity to do work.' },
    ],
  };

  it('trims whitespace from topic title', () => {
    expect(normalizeTopicImport(raw).title).toBe('Physics');
  });

  it('sets type to "topic"', () => {
    expect(normalizeTopicImport(raw).type).toBe('topic');
  });

  it('sets path to an empty array', () => {
    expect(normalizeTopicImport(raw).path).toEqual([]);
  });

  it('trims card title and body', () => {
    const c = normalizeTopicImport(raw).cards[0];
    expect(c.title).toBe('Force');
    expect(c.body).toBe('F = ma');
  });

  it('trims card context', () => {
    expect(normalizeTopicImport(raw).cards[0].context).toBe('deep');
  });

  it('assigns sequential 1-based order values', () => {
    const cards = normalizeTopicImport(raw).cards;
    expect(cards[0].order).toBe(1);
    expect(cards[1].order).toBe(2);
  });

  it('preserves a valid difficulty value', () => {
    expect(normalizeTopicImport(raw).cards[0].difficulty).toBe(2);
  });

  it('defaults invalid/missing difficulty to 1', () => {
    expect(normalizeTopicImport(raw).cards[1].difficulty).toBe(1);
  });

  it('keeps only non-empty string tags and drops other types', () => {
    expect(normalizeTopicImport(raw).cards[0].tags).toEqual(['mechanics']);
  });

  it('defaults context to empty string when absent', () => {
    expect(normalizeTopicImport(raw).cards[1].context).toBe('');
  });

  it('defaults tags to empty array when absent', () => {
    expect(normalizeTopicImport(raw).cards[1].tags).toEqual([]);
  });

  it('generates a string id when none is provided', () => {
    const result = normalizeTopicImport(raw);
    expect(typeof result.id).toBe('string');
    expect(result.id.length).toBeGreaterThan(0);
  });

  it('preserves an explicit topic id', () => {
    expect(normalizeTopicImport({ ...raw, id: 'my-id' }).id).toBe('my-id');
  });

  it('generates unique card ids when cards have none', () => {
    const { cards } = normalizeTopicImport(raw);
    expect(cards[0].id).not.toBe(cards[1].id);
  });

  it('preserves explicit card ids', () => {
    const withId = { ...raw, cards: [{ ...raw.cards[0], id: 'c-fixed' }, raw.cards[1]] };
    expect(normalizeTopicImport(withId).cards[0].id).toBe('c-fixed');
  });
});

// ── KEYS ──────────────────────────────────────────────────────────────────────
describe('KEYS', () => {
  it('contains all expected keys with their localStorage key names', () => {
    expect(KEYS.version).toBe('sl-v');
    expect(KEYS.completion).toBe('sl-comp');
    expect(KEYS.revisit).toBe('sl-rev');
    expect(KEYS.confused).toBe('sl-conf');
    expect(KEYS.starred).toBe('sl-star');
    expect(KEYS.progress).toBe('sl-prog');
    expect(KEYS.library).toBe('sl-lib');
    expect(KEYS.aiUsage).toBe('sl-ai-usage');
    expect(KEYS.highlights).toBe('sl-hl');
  });

  it('has exactly nine keys', () => {
    expect(Object.keys(KEYS)).toHaveLength(9);
  });
});

// ── SCHEMA_VERSION / migrateLocalStorage ─────────────────────────────────────
describe('SCHEMA_VERSION', () => {
  it('is 2', () => {
    expect(SCHEMA_VERSION).toBe(2);
  });
});

describe('migrateLocalStorage', () => {
  beforeEach(() => localStorage.clear());

  it('writes SCHEMA_VERSION to localStorage on first boot (no version stored)', () => {
    migrateLocalStorage();
    expect(lsLoad(KEYS.version, 0)).toBe(SCHEMA_VERSION);
  });

  it('returns 0 when no version was previously stored', () => {
    expect(migrateLocalStorage()).toBe(0);
  });

  it('is idempotent — calling twice does not change the stored version', () => {
    migrateLocalStorage();
    migrateLocalStorage();
    expect(lsLoad(KEYS.version, 0)).toBe(SCHEMA_VERSION);
  });

  it('is a no-op (returns stored value) when already up to date', () => {
    lsSave(KEYS.version, SCHEMA_VERSION);
    const returned = migrateLocalStorage();
    expect(returned).toBe(SCHEMA_VERSION);
    expect(lsLoad(KEYS.version, 0)).toBe(SCHEMA_VERSION);
  });

  it('is a no-op when stored version is higher than SCHEMA_VERSION', () => {
    lsSave(KEYS.version, SCHEMA_VERSION + 99);
    migrateLocalStorage();
    // version should not be downgraded
    expect(lsLoad(KEYS.version, 0)).toBe(SCHEMA_VERSION + 99);
  });

  // v1 → v2: de-duplicate card IDs
  it('v2 migration: regenerates duplicate card IDs across topics', () => {
    // Library with two topics that both contain card id 'shared-id'
    const lib = {
      id: 'root', type: 'directory', title: 'Root', children: [
        { id: 'topic-a', type: 'topic', title: 'A', path: [], cards: [{ id: 'shared-id', title: 't', body: 'b' }] },
        { id: 'topic-b', type: 'topic', title: 'B', path: [], cards: [{ id: 'shared-id', title: 't', body: 'b' }] },
      ],
    };
    lsSave(KEYS.library, lib);
    lsSave(KEYS.version, 1); // trigger v2 migration
    migrateLocalStorage();
    const migrated = lsLoad(KEYS.library, null);
    const idA = migrated.children[0].cards[0].id;
    const idB = migrated.children[1].cards[0].id;
    // First occurrence keeps original; second gets a fresh ID
    expect(idA).toBe('shared-id');
    expect(idB).not.toBe('shared-id');
    expect(idB).toMatch(/^card-/);
  });

  it('v2 migration: leaves library unchanged when all card IDs are unique', () => {
    const lib = {
      id: 'root', type: 'directory', title: 'Root', children: [
        { id: 'topic-a', type: 'topic', title: 'A', path: [], cards: [{ id: 'card-1', title: 't', body: 'b' }] },
        { id: 'topic-b', type: 'topic', title: 'B', path: [], cards: [{ id: 'card-2', title: 't', body: 'b' }] },
      ],
    };
    lsSave(KEYS.library, lib);
    lsSave(KEYS.version, 1);
    migrateLocalStorage();
    const migrated = lsLoad(KEYS.library, null);
    expect(migrated.children[0].cards[0].id).toBe('card-1');
    expect(migrated.children[1].cards[0].id).toBe('card-2');
  });

  it('v2 migration: skips library modification when no library is stored', () => {
    // No library in localStorage — migration should not throw
    lsSave(KEYS.version, 1);
    expect(() => migrateLocalStorage()).not.toThrow();
  });
});

// ── pruneOrphanedIds ──────────────────────────────────────────────────────────
describe('pruneOrphanedIds', () => {
  const lib = {
    id: 'root', type: 'directory', title: 'Root', children: [
      {
        id: 'topic-1', type: 'topic', title: 'T1', path: [], cards: [
          { id: 'c1', title: 't', body: 'b' },
          { id: 'c2', title: 't', body: 'b' },
        ],
      },
    ],
  };

  it('returns all state unchanged when no orphaned IDs exist', () => {
    const state = {
      completionMap: { c1: true },
      starredIds: ['c2'],
      confusedIds: ['c1'],
      revisitIds: ['c2'],
      progressMap: { 'topic-1': 1 },
    };
    const pruned = pruneOrphanedIds(lib, state);
    expect(pruned.completionMap).toEqual({ c1: true });
    expect(pruned.starredIds).toEqual(['c2']);
    expect(pruned.confusedIds).toEqual(['c1']);
    expect(pruned.revisitIds).toEqual(['c2']);
    expect(pruned.progressMap).toEqual({ 'topic-1': 1 });
  });

  it('removes card IDs absent from the library from completionMap', () => {
    const pruned = pruneOrphanedIds(lib, {
      completionMap: { c1: true, 'stale-id': true },
      starredIds: [], confusedIds: [], revisitIds: [], progressMap: {},
    });
    expect(pruned.completionMap).toEqual({ c1: true });
    expect(Object.keys(pruned.completionMap)).not.toContain('stale-id');
  });

  it('removes orphaned IDs from starredIds', () => {
    const pruned = pruneOrphanedIds(lib, {
      completionMap: {}, starredIds: ['c1', 'ghost-card'],
      confusedIds: [], revisitIds: [], progressMap: {},
    });
    expect(pruned.starredIds).toEqual(['c1']);
  });

  it('removes orphaned IDs from confusedIds', () => {
    const pruned = pruneOrphanedIds(lib, {
      completionMap: {}, starredIds: [], confusedIds: ['c2', 'ghost-card'],
      revisitIds: [], progressMap: {},
    });
    expect(pruned.confusedIds).toEqual(['c2']);
  });

  it('removes orphaned IDs from revisitIds', () => {
    const pruned = pruneOrphanedIds(lib, {
      completionMap: {}, starredIds: [], confusedIds: [],
      revisitIds: ['c1', 'dead-card'], progressMap: {},
    });
    expect(pruned.revisitIds).toEqual(['c1']);
  });

  it('removes orphaned topic IDs from progressMap', () => {
    const pruned = pruneOrphanedIds(lib, {
      completionMap: {}, starredIds: [], confusedIds: [], revisitIds: [],
      progressMap: { 'topic-1': 3, 'dead-topic': 7 },
    });
    expect(pruned.progressMap).toEqual({ 'topic-1': 3 });
  });

  it('returns empty structures when all IDs are orphaned', () => {
    const pruned = pruneOrphanedIds(lib, {
      completionMap: { ghost: true },
      starredIds: ['ghost'],
      confusedIds: ['ghost'],
      revisitIds: ['ghost'],
      progressMap: { 'dead-topic': 5 },
    });
    expect(pruned.completionMap).toEqual({});
    expect(pruned.starredIds).toEqual([]);
    expect(pruned.confusedIds).toEqual([]);
    expect(pruned.revisitIds).toEqual([]);
    expect(pruned.progressMap).toEqual({});
  });

  it('does not mutate the original state objects', () => {
    const state = {
      completionMap: { ghost: true },
      starredIds: ['ghost'],
      confusedIds: [],
      revisitIds: [],
      progressMap: {},
    };
    pruneOrphanedIds(lib, state);
    expect(state.completionMap).toEqual({ ghost: true });
    expect(state.starredIds).toEqual(['ghost']);
  });
});

// ── lsLoad / lsSave ───────────────────────────────────────────────────────────
describe('lsLoad', () => {
  beforeEach(() => localStorage.clear());

  it('returns the fallback when the key is absent', () => {
    expect(lsLoad('missing-key', 'default')).toBe('default');
  });

  it('returns a fallback object when the key is absent', () => {
    expect(lsLoad('missing-key', {})).toEqual({});
  });

  it('returns a fallback array when the key is absent', () => {
    expect(lsLoad('missing-key', [])).toEqual([]);
  });

  it('loads and parses a stored object', () => {
    localStorage.setItem('sl-test', JSON.stringify({ a: 1, b: 'two' }));
    expect(lsLoad('sl-test', null)).toEqual({ a: 1, b: 'two' });
  });

  it('loads and parses a stored array', () => {
    localStorage.setItem('sl-arr', JSON.stringify([10, 20, 30]));
    expect(lsLoad('sl-arr', [])).toEqual([10, 20, 30]);
  });

  it('loads a stored string', () => {
    localStorage.setItem('sl-str', JSON.stringify('hello'));
    expect(lsLoad('sl-str', '')).toBe('hello');
  });

  it('loads a stored boolean', () => {
    localStorage.setItem('sl-bool', JSON.stringify(true));
    expect(lsLoad('sl-bool', false)).toBe(true);
  });

  it('returns fallback when stored value is invalid JSON', () => {
    localStorage.setItem('sl-bad', 'not valid json {{{');
    expect(lsLoad('sl-bad', 'fallback')).toBe('fallback');
  });

  it('returns fallback (not throws) when localStorage.getItem throws', () => {
    const orig = Storage.prototype.getItem;
    Storage.prototype.getItem = () => { throw new Error('SecurityError'); };
    expect(lsLoad('sl-k', 42)).toBe(42);
    Storage.prototype.getItem = orig;
  });
});

describe('lsSave', () => {
  beforeEach(() => localStorage.clear());

  it('saves an object that can be loaded back', () => {
    lsSave('sl-obj', { x: 99 });
    expect(lsLoad('sl-obj', null)).toEqual({ x: 99 });
  });

  it('saves an array that can be loaded back', () => {
    lsSave('sl-arr', ['a', 'b']);
    expect(lsLoad('sl-arr', [])).toEqual(['a', 'b']);
  });

  it('overwrites a previously saved value', () => {
    lsSave('sl-k', 1);
    lsSave('sl-k', 2);
    expect(lsLoad('sl-k', 0)).toBe(2);
  });

  it('does not throw when localStorage.setItem throws (e.g. quota exceeded)', () => {
    const orig = Storage.prototype.setItem;
    Storage.prototype.setItem = () => { throw new Error('QuotaExceededError'); };
    expect(() => lsSave('sl-k', { big: true })).not.toThrow();
    Storage.prototype.setItem = orig;
  });
});
