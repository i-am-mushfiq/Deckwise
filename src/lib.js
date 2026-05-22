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
};

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
