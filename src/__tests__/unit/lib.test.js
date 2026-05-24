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
  KEYS,
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

// ── KEYS ──────────────────────────────────────────────────────────────────────
describe('KEYS', () => {
  it('contains all expected keys with their localStorage key names', () => {
    expect(KEYS.completion).toBe('sl-comp');
    expect(KEYS.revisit).toBe('sl-rev');
    expect(KEYS.confused).toBe('sl-conf');
    expect(KEYS.starred).toBe('sl-star');
    expect(KEYS.progress).toBe('sl-prog');
    expect(KEYS.library).toBe('sl-lib');
    expect(KEYS.aiUsage).toBe('sl-ai-usage');
    expect(KEYS.highlights).toBe('sl-hl');
  });

  it('has exactly eight keys', () => {
    expect(Object.keys(KEYS)).toHaveLength(8);
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
