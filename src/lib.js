// Pure utility functions — extracted from App.jsx for testability.
// These functions have no side-effects and no UI dependencies.

// ── IDs ──────────────────────────────────────────────────────────────────────
export const uid = () => Math.random().toString(36).slice(2, 9);

// ── TREE TRAVERSAL ────────────────────────────────────────────────────────────

/** Recursively collects all topic nodes into a flat array, building path as we descend. */
export function flattenTopics(node, path = []) {
  const out = [];
  if (node.type === "topic") {
    out.push({ ...node, path: node.path || path });
  } else if (node.children) {
    node.children.forEach(c => out.push(...flattenTopics(c, [...path, node.title])));
  }
  return out;
}

/** Reconstructs path arrays for all topic nodes after a structural edit. */
export function rebuildPaths(node, path = []) {
  if (node.type === "topic") return { ...node, path };
  return { ...node, children: (node.children || []).map(c => rebuildPaths(c, [...path, node.title])) };
}

/** Immutably updates the node whose id matches; returns the tree unchanged if not found. */
export function findAndUpdate(node, id, upd) {
  if (node.id === id) return upd(node);
  if (!node.children) return node;
  return { ...node, children: node.children.map(c => findAndUpdate(c, id, upd)) };
}

/** Immutably removes the node whose id matches anywhere in the tree. */
export function findAndDelete(node, id) {
  if (!node.children) return node;
  return {
    ...node,
    children: node.children
      .filter(c => c.id !== id)
      .map(c => findAndDelete(c, id)),
  };
}

/** Immutably appends child to the children of the node whose id === pid. */
export function insertInto(node, pid, child) {
  if (node.id === pid) return { ...node, children: [...(node.children || []), child] };
  if (!node.children) return node;
  return { ...node, children: node.children.map(c => insertInto(c, pid, child)) };
}

// ── STORAGE KEYS ──────────────────────────────────────────────────────────────
export const KEYS = {
  completion: "sl-comp",
  revisit:    "sl-rev",
  confused:   "sl-conf",
  starred:    "sl-star",
  progress:   "sl-prog",
  library:    "sl-lib",
  aiUsage:    "sl-ai-usage",
  highlights: "sl-hl",
};

// ── JSON IMPORT VALIDATION & NORMALISATION ────────────────────────────────────

/**
 * Validates the shape of a raw parsed JSON value intended as a topic import.
 * Returns null when valid, or a human-readable error string when not.
 */
export function validateTopicImport(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data))
    return 'Root must be a JSON object — not an array or primitive.';
  if (!data.title || typeof data.title !== 'string' || !data.title.trim())
    return 'Missing required "title" (non-empty string).';
  if (!Array.isArray(data.cards))
    return 'Missing required "cards" (must be an array).';
  if (data.cards.length === 0)
    return '"cards" must contain at least one card.';
  for (let i = 0; i < data.cards.length; i++) {
    const c = data.cards[i];
    if (!c || typeof c !== 'object' || Array.isArray(c))
      return `Card at position ${i + 1} is not an object.`;
    if (typeof c.title !== 'string' || !c.title.trim())
      return `Card ${i + 1}: missing "title" (non-empty string).`;
    if (typeof c.body !== 'string' || !c.body.trim())
      return `Card ${i + 1}: missing "body" (non-empty string).`;
  }
  return null;
}

/**
 * Normalises a raw (already-validated) import object into the exact shape
 * that the library tree expects — trimming whitespace, filling in defaults,
 * and stripping unexpected types from optional fields.
 */
export function normalizeTopicImport(data) {
  return {
    id:    (typeof data.id === 'string' && data.id) ? data.id : `topic-${uid()}`,
    title: data.title.trim(),
    type:  'topic',
    path:  [],
    cards: data.cards.map((c, i) => ({
      id:         (typeof c.id === 'string' && c.id) ? c.id : `card-${uid()}`,
      order:      i + 1,
      title:      c.title.trim(),
      body:       c.body.trim(),
      context:    typeof c.context === 'string' ? c.context.trim() : '',
      tags:       Array.isArray(c.tags)
                    ? c.tags.filter(t => typeof t === 'string').map(t => t.trim()).filter(Boolean)
                    : [],
      difficulty: [1, 2, 3].includes(c.difficulty) ? c.difficulty : 1,
    })),
  };
}

// ── LOCALSTORAGE HELPERS ──────────────────────────────────────────────────────

/** Load and JSON-parse a localStorage key; return fb on any failure. */
export function lsLoad(k, fb) {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : fb;
  } catch {
    return fb;
  }
}

/** JSON-stringify v and store it; silently swallows quota / parse errors. */
export function lsSave(k, v) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
}
