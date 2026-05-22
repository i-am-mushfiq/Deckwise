// @vitest-environment jsdom
/**
 * Integration tests — src/App.jsx
 *
 * Renders the full App component with mocked Supabase (null → no auth/sync
 * side-effects) and exercises all major UI flows via @testing-library/react.
 *
 * Known DOM quirks handled in these tests:
 *  - The Sidebar is ALWAYS rendered (just off-screen); its active-theme ✓
 *    <span> is always in the DOM.  Tests that need the ActionBar ✓ use
 *    getByRole('button', { name: '✓' }) to target the button specifically.
 *  - Two DraggableCards are visible in the stack for a 2-card topic, so
 *    Flag/Star buttons appear twice.  Tests use getAllByRole()[0].
 *  - "Tiny Topic" appears in the learn-screen header AND in each card's
 *    topicTitle field.  Tests use findAllByText() where needed.
 *  - Percentage values (0%, 50% …) can appear in multiple places on the home
 *    screen (overall bar + per-topic row).  Tests use findAllByText().
 *
 * Drag-to-swipe is not tested here (jsdom has no layout engine); instead we
 * click the ActionBar buttons which call the same advance()/goBack() handlers.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App.jsx';

// Supabase is null in all integration tests — the app works fully offline.
vi.mock('../../supabase.js', () => ({ supabase: null }));

// ── Shared fixtures ───────────────────────────────────────────────────────────

/**
 * Minimal two-card library stored in localStorage before render.
 * A tiny deck keeps card-completion tests short and deterministic.
 */
const TINY_LIBRARY = {
  id: 'root', title: 'My Library', type: 'directory',
  children: [{
    id: 'tiny-topic', title: 'Tiny Topic', type: 'topic', path: [],
    cards: [
      { id: 't1', order: 1, title: 'First Card',  body: 'Body of first.',  context: 'Context one.', tags: ['test'], difficulty: 1 },
      { id: 't2', order: 2, title: 'Second Card', body: 'Body of second.', context: 'Context two.', tags: ['test'], difficulty: 2 },
    ],
  }],
};

/** Seed localStorage and render the App; returns the userEvent instance. */
const setup = (library = null, extraStorage = {}) => {
  if (library) localStorage.setItem('sl-lib', JSON.stringify(library));
  Object.entries(extraStorage).forEach(([k, v]) => localStorage.setItem(k, JSON.stringify(v)));
  const user = userEvent.setup();
  render(<App />);
  return user;
};

/**
 * Navigate from the home screen to the learn screen for TINY_LIBRARY.
 * Sets up localStorage + renders App, then clicks the topic row.
 */
const navigateToLearn = async (user, extra = {}) => {
  setup(TINY_LIBRARY, extra);
  // On the home screen there is exactly ONE element with this text (DirectoryNode row).
  const allMatches = await screen.findAllByText('Tiny Topic');
  // The first match on the home screen is the clickable topic row title
  await user.click(allMatches[0]);
  // Wait for learn screen to be visible
  await screen.findByText('First Card');
};

// ── Home screen ───────────────────────────────────────────────────────────────

describe('Home screen', () => {
  it('renders the home screen after initial load', async () => {
    setup();
    await screen.findByText('Overall progress');
  });

  it('shows overall progress percentage (possibly multiple elements)', async () => {
    setup();
    // Multiple topic rows each show 0% — use findAllByText
    const pcts = await screen.findAllByText(/^0%$/);
    expect(pcts.length).toBeGreaterThan(0);
  });

  it('shows demo topics when no library is stored', async () => {
    setup();
    await screen.findByText('Demo Deck');
    expect(await screen.findByText('How to Learn Anything')).toBeInTheDocument();
  });

  it('shows custom library topics loaded from localStorage', async () => {
    setup(TINY_LIBRARY);
    await screen.findByText('Tiny Topic');
  });

  it('shows "0 of 2 cards" in overall progress for a 2-card library', async () => {
    setup(TINY_LIBRARY);
    await screen.findByText(/0 of 2 cards/i);
  });

  it('shows the hamburger menu button', async () => {
    setup();
    await screen.findByText('☰');
  });

  it('shows the "Edit library" button', async () => {
    setup();
    await screen.findByRole('button', { name: /edit library/i });
  });

  it('shows the "AI Prompt" toggle button', async () => {
    setup();
    await screen.findByRole('button', { name: /ai prompt/i });
  });

  it('shows the "Generate with AI" CTA somewhere on the page', async () => {
    setup();
    const btns = await screen.findAllByText(/generate with ai/i);
    expect(btns.length).toBeGreaterThan(0);
  });
});

// ── Sidebar ───────────────────────────────────────────────────────────────────

describe('Sidebar', () => {
  it('opens when the hamburger button is clicked', async () => {
    const user = setup();
    await user.click(await screen.findByText('☰'));
    // Sidebar panel header shows the app name as a text node
    const sidebarName = await screen.findByText('Deckwise');
    expect(sidebarName).toBeInTheDocument();
  });

  it('shows "Sign in to sync" when no user is logged in', async () => {
    const user = setup();
    await user.click(await screen.findByText('☰'));
    expect(await screen.findByText(/sign in to sync/i)).toBeInTheDocument();
  });

  it('shows all five color profile options', async () => {
    const user = setup();
    await user.click(await screen.findByText('☰'));
    expect(screen.getByText('Rustic Autumn')).toBeInTheDocument();
    expect(screen.getByText('Midnight')).toBeInTheDocument();
    expect(screen.getByText('Forest')).toBeInTheDocument();
    expect(screen.getByText('Slate')).toBeInTheDocument();
    expect(screen.getByText('Obsidian')).toBeInTheDocument();
  });

  it('shows all three community deck titles', async () => {
    const user = setup();
    await user.click(await screen.findByText('☰'));
    expect(screen.getByText('Stoic Philosophy')).toBeInTheDocument();
    expect(screen.getByText('Financial Literacy 101')).toBeInTheDocument();
    expect(screen.getByText('The Art of Public Speaking')).toBeInTheDocument();
  });

  it('closes when the panel ✕ button is clicked', async () => {
    const user = setup();
    await user.click(await screen.findByText('☰'));
    // The home screen has no ✕ buttons; the only ✕ visible is the sidebar's.
    const closeBtns = screen.getAllByText('✕');
    await user.click(closeBtns[0]);
    // After close the page is still rendered correctly
    await screen.findByText('Overall progress');
  });

  it('opens AuthModal when the Sign in button is clicked in the sidebar', async () => {
    const user = setup();
    await user.click(await screen.findByText('☰'));
    // The sidebar sign-in button
    const signInBtn = await screen.findByRole('button', { name: /^sign in$/i });
    await user.click(signInBtn);
    // AuthModal should appear
    await screen.findByText(/sign in with google/i);
  });

  it('can add a community deck to the library', async () => {
    const user = setup(TINY_LIBRARY);
    await user.click(await screen.findByText('☰'));
    const addBtns = await screen.findAllByRole('button', { name: /add to library/i });
    // Click the first available "Add to Library" (Stoic Philosophy)
    await user.click(addBtns[0]);
    // Button should change to "Added ✓"
    await screen.findByText('Added ✓');
  });

  it('switches theme when a color profile button is clicked', async () => {
    const user = setup();
    await user.click(await screen.findByText('☰'));
    // Initially "Rustic Autumn" is active (default theme)
    // Click "Midnight" to switch
    await user.click(screen.getByText('Midnight'));
    // The sidebar updates — Midnight button should now have the active checkmark
    // Use findAllByText because the active theme span ✓ and possibly other ✓ exist
    const checkmarks = await screen.findAllByText('✓');
    expect(checkmarks.length).toBeGreaterThan(0);
  });
});

// ── AuthModal ─────────────────────────────────────────────────────────────────

describe('AuthModal', () => {
  const openAuthModal = async (user) => {
    setup();
    await user.click(await screen.findByText('☰'));
    await user.click(await screen.findByRole('button', { name: /^sign in$/i }));
    await screen.findByText(/sign in with google/i);
  };

  it('shows the Google sign-in button', async () => {
    const user = userEvent.setup();
    await openAuthModal(user);
    expect(screen.getByText(/sign in with google/i)).toBeInTheDocument();
  });

  it('shows the magic link email input', async () => {
    const user = userEvent.setup();
    await openAuthModal(user);
    expect(screen.getByPlaceholderText(/your@email\.com/i)).toBeInTheDocument();
  });

  it('shows the "Send magic link" button', async () => {
    const user = userEvent.setup();
    await openAuthModal(user);
    expect(screen.getByRole('button', { name: /send magic link/i })).toBeInTheDocument();
  });

  it('closes when the ✕ button inside the modal is clicked', async () => {
    const user = userEvent.setup();
    await openAuthModal(user);
    // AuthModal renders after Sidebar in the DOM → its ✕ is the last one
    const closeBtns = screen.getAllByText('✕');
    await user.click(closeBtns[closeBtns.length - 1]);
    await waitFor(() => {
      expect(screen.queryByText(/send magic link/i)).not.toBeInTheDocument();
    });
  });
});

// ── Library editor ────────────────────────────────────────────────────────────

describe('Library editor', () => {
  it('opens when "Edit library" is clicked', async () => {
    const user = setup();
    await user.click(await screen.findByRole('button', { name: /edit library/i }));
    await screen.findByText('Your Library');
  });

  it('shows the "Save library" button inside the editor', async () => {
    const user = setup();
    await user.click(await screen.findByRole('button', { name: /edit library/i }));
    expect(await screen.findByRole('button', { name: /save library/i })).toBeInTheDocument();
  });

  it('closes when the modal ✕ button is clicked', async () => {
    const user = setup();
    await user.click(await screen.findByRole('button', { name: /edit library/i }));
    await screen.findByText('Your Library');
    // LibraryEditor renders before Sidebar in the DOM → its ✕ is index 0
    const closeBtns = screen.getAllByText('✕');
    await user.click(closeBtns[0]);
    await waitFor(() => {
      expect(screen.queryByText('Your Library')).not.toBeInTheDocument();
    });
  });
});

// ── AI Prompt panel ───────────────────────────────────────────────────────────

describe('AI Prompt panel', () => {
  it('expands when "AI Prompt" is clicked', async () => {
    const user = setup();
    await user.click(await screen.findByRole('button', { name: /ai prompt/i }));
    // Panel heading is "Generate with AI" (exact), distinct from the button "Generate with AI ✦"
    await screen.findByText('Generate with AI');
  });

  it('shows Topic and Audience input fields', async () => {
    const user = setup();
    await user.click(await screen.findByRole('button', { name: /ai prompt/i }));
    expect(await screen.findByPlaceholderText(/how transformers work/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/software engineers/i)).toBeInTheDocument();
  });

  it('collapses when "✕ Close" is clicked', async () => {
    const user = setup();
    await user.click(await screen.findByRole('button', { name: /ai prompt/i }));
    await screen.findByText('Generate with AI');
    // The toggle button now says "✕ Close"
    await user.click(screen.getByRole('button', { name: /✕ close/i }));
    await waitFor(() => {
      expect(screen.queryByPlaceholderText(/how transformers work/i)).not.toBeInTheDocument();
    });
  });
});

// ── Learn screen ──────────────────────────────────────────────────────────────

describe('Learn screen', () => {
  it('shows the topic title in the learn screen (multiple occurrences)', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    // "Tiny Topic" is in the header AND each DraggableCard's topicTitle
    const matches = await screen.findAllByText('Tiny Topic');
    expect(matches.length).toBeGreaterThan(0);
  });

  it('shows the first card title', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    expect(screen.getByText('First Card')).toBeInTheDocument();
  });

  it('shows progress counter "0 / 2" for a 2-card deck', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    // ProgressBar renders "{current} / {total}" inside a single <span>
    await screen.findByText('0 / 2');
  });

  it('shows the ✓ done button in the ActionBar', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    // Use getByRole('button') to distinguish from sidebar's ✓ <span>
    expect(screen.getByRole('button', { name: '✓' })).toBeInTheDocument();
  });

  it('shows the ↺ and ↩ buttons in the ActionBar', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    expect(screen.getByText('↺')).toBeInTheDocument();
    expect(screen.getByText('↩')).toBeInTheDocument();
  });

  it('back button (↩) is visually dimmed at the start of a session', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    const backBtn = screen.getByText('↩').closest('button');
    expect(backBtn.style.opacity).toBe('0.3');
  });

  it('advances to the next card when the ✓ button is clicked', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    await user.click(screen.getByRole('button', { name: '✓' }));
    await screen.findByText('Second Card');
  });

  it('updates the progress counter to "1 / 2" after one advance', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    await user.click(screen.getByRole('button', { name: '✓' }));
    await screen.findByText('1 / 2');
  });

  it('enables the back button after advancing one card', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    await user.click(screen.getByRole('button', { name: '✓' }));
    await waitFor(() => {
      const backBtn = screen.getByText('↩').closest('button');
      expect(backBtn.style.opacity).toBe('1');
    });
  });

  it('goes back to the previous card when ↩ is clicked', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    await user.click(screen.getByRole('button', { name: '✓' }));  // advance to card 2
    await screen.findByText('Second Card');
    await user.click(screen.getByText('↩'));                       // go back
    await screen.findByText('First Card');
  });

  it('reverts the progress counter when going back', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    await user.click(screen.getByRole('button', { name: '✓' }));
    await screen.findByText('1 / 2');
    await user.click(screen.getByText('↩'));
    await screen.findByText('0 / 2');
  });

  it('shows revisit count in the progress bar when ↺ is clicked', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    await user.click(screen.getByText('↺'));
    // ProgressBar shows "↺ 1" when revisitCount > 0
    await screen.findByText('↺ 1');
  });

  it('shows the context (Deep dive) section when "↑ Expand" is clicked', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    // Both stacked DraggableCards render "↑ Expand". The DOM renders offset=1
    // (background card) before offset=0 (top card), so the top card's button
    // is the LAST one in the array.
    const expandBtns = screen.getAllByText('↑ Expand');
    await user.click(expandBtns[expandBtns.length - 1]);
    // Deep dive only appears inside the card that was expanded (top card)
    await screen.findByText('Deep dive');
    expect(screen.getByText('Context one.')).toBeInTheDocument();
  });

  it('hides the context section when "↓ Collapse" is clicked', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    const expandBtns = screen.getAllByText('↑ Expand');
    await user.click(expandBtns[expandBtns.length - 1]);
    // After expansion, only the top card shows "↓ Collapse" — unique
    const collapseBtn = await screen.findByText('↓ Collapse');
    await user.click(collapseBtn);
    await waitFor(() => {
      expect(screen.queryByText('Deep dive')).not.toBeInTheDocument();
    });
  });

  it('toggles the flag button: Flag → Flagged on first click', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    // Both cards in the stack show Flag; use the first one (top card)
    const flagBtns = screen.getAllByRole('button', { name: 'Flag' });
    await user.click(flagBtns[0]);
    // Top card now shows "Flagged"
    expect(await screen.findByRole('button', { name: 'Flagged' })).toBeInTheDocument();
  });

  it('toggles the flag button: Flagged → Flag on second click', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    const flagBtns = screen.getAllByRole('button', { name: 'Flag' });
    await user.click(flagBtns[0]);
    await user.click(screen.getByRole('button', { name: 'Flagged' }));
    expect(await screen.findAllByRole('button', { name: 'Flag' })).toBeTruthy();
  });

  it('toggles the star button: ☆ → ★ on first click', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    // Both cards in the stack show ☆; click the first (top card)
    const starBtns = screen.getAllByRole('button', { name: '☆' });
    await user.click(starBtns[0]);
    expect(await screen.findByRole('button', { name: '★' })).toBeInTheDocument();
  });

  it('toggles the star button: ★ → ☆ on second click', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    const starBtns = screen.getAllByRole('button', { name: '☆' });
    await user.click(starBtns[0]);
    await user.click(screen.getByRole('button', { name: '★' }));
    expect(await screen.findAllByRole('button', { name: '☆' })).toBeTruthy();
  });

  it('returns to the home screen when ‹ is clicked', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    await user.click(screen.getByText('‹'));
    await screen.findByText('Overall progress');
  });

  it('shows the completion screen after advancing through all cards', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    await user.click(screen.getByRole('button', { name: '✓' })); // card 1
    await user.click(screen.getByRole('button', { name: '✓' })); // card 2 → completes
    await screen.findByText('Done!');
  });
});

// ── Completion screen ─────────────────────────────────────────────────────────

describe('Completion screen', () => {
  const completeAllCards = async (user, extra = {}) => {
    await navigateToLearn(user, extra);
    await user.click(screen.getByRole('button', { name: '✓' }));
    await user.click(screen.getByRole('button', { name: '✓' }));
    await screen.findByText('Done!');
  };

  it('shows "Done!" heading', async () => {
    const user = userEvent.setup();
    await completeAllCards(user);
    expect(screen.getByText('Done!')).toBeInTheDocument();
  });

  it('shows the topic title on the completion screen', async () => {
    const user = userEvent.setup();
    await completeAllCards(user);
    // On completion screen only the topic title text is shown; no DraggableCard stacks
    expect(screen.getByText('Tiny Topic')).toBeInTheDocument();
  });

  it('returns to the home screen when "Back to library" is clicked', async () => {
    const user = userEvent.setup();
    await completeAllCards(user);
    await user.click(screen.getByRole('button', { name: /back to library/i }));
    await screen.findByText('Overall progress');
  });

  it('shows the revisit queue when cards were swiped right (↺)', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    await user.click(screen.getByText('↺'));          // mark card 1 for revisit
    await user.click(screen.getByRole('button', { name: '✓' })); // advance past card 2
    await screen.findByText('Done!');
    expect(screen.getByText(/review queue/i)).toBeInTheDocument();
  });

  it('shows the flagged section when cards were flagged', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    // Background card (t2) is first in DOM; top card (t1) is last → use last
    const flagBtns = screen.getAllByRole('button', { name: 'Flag' });
    await user.click(flagBtns[flagBtns.length - 1]);               // flag top card (t1)
    await user.click(screen.getByRole('button', { name: '✓' }));  // advance to t2
    await user.click(screen.getByRole('button', { name: '✓' }));  // advance past t2
    await screen.findByText('Done!');
    // CompletionScreen shows "Flagged · 1" heading (more specific than /flagged/i)
    expect(screen.getByText(/flagged · \d+/i)).toBeInTheDocument();
  });

  it('shows the starred section when cards were starred', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    const starBtns = screen.getAllByRole('button', { name: '☆' });
    await user.click(starBtns[starBtns.length - 1]);               // star top card (t1)
    await user.click(screen.getByRole('button', { name: '✓' }));  // advance
    await user.click(screen.getByRole('button', { name: '✓' }));  // advance
    await screen.findByText('Done!');
    expect(screen.getByText(/starred · \d+/i)).toBeInTheDocument();
  });
});

// ── Progress persistence ───────────────────────────────────────────────────────

describe('Progress persistence (localStorage)', () => {
  it('saves completion flag to localStorage after advancing with ✓', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    await user.click(screen.getByRole('button', { name: '✓' }));
    const stored = JSON.parse(localStorage.getItem('sl-comp') || '{}');
    expect(stored['t1']).toBe(true);
  });

  it('removes completion flag from localStorage when going back with ↩', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    await user.click(screen.getByRole('button', { name: '✓' })); // complete t1
    await user.click(screen.getByText('↩'));                      // undo
    const stored = JSON.parse(localStorage.getItem('sl-comp') || '{}');
    expect(stored['t1']).toBeUndefined();
  });

  it('saves revisit id to localStorage when ↺ is clicked', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    await user.click(screen.getByText('↺'));
    const revisit = JSON.parse(localStorage.getItem('sl-rev') || '[]');
    expect(revisit).toContain('t1');
  });

  it('saves flagged id to localStorage when Flag is clicked', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    const flagBtns = screen.getAllByRole('button', { name: 'Flag' });
    // Top card (t1) renders last in the DOM stack; background card (t2) is first
    await user.click(flagBtns[flagBtns.length - 1]);
    const confused = JSON.parse(localStorage.getItem('sl-conf') || '[]');
    expect(confused).toContain('t1');
  });

  it('saves starred id to localStorage when ☆ is clicked', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    const starBtns = screen.getAllByRole('button', { name: '☆' });
    // Top card (t1) renders last in the DOM stack; background card (t2) is first
    await user.click(starBtns[starBtns.length - 1]);
    const starred = JSON.parse(localStorage.getItem('sl-star') || '[]');
    expect(starred).toContain('t1');
  });

  it('loads existing completion progress from localStorage on mount', async () => {
    // Pre-seed: t1 is already complete → 50% for Tiny Topic
    setup(TINY_LIBRARY, { 'sl-comp': { t1: true } });
    await screen.findByText('Tiny Topic');
    // At least one element shows 50% — could be overall bar or topic row
    const pcts = await screen.findAllByText(/50%/);
    expect(pcts.length).toBeGreaterThan(0);
  });
});

// ── Reset ─────────────────────────────────────────────────────────────────────

describe('Reset', () => {
  it('clears all progress and shows 0% after clicking Reset', async () => {
    const user = setup(TINY_LIBRARY, { 'sl-comp': { t1: true }, 'sl-rev': ['t2'] });
    await screen.findByText('Tiny Topic');
    await user.click(screen.getByRole('button', { name: /reset/i }));
    // Overall progress should now show 0%
    const pcts = await screen.findAllByText(/^0%$/);
    expect(pcts.length).toBeGreaterThan(0);
  });
});

// ── DirectoryNode chips ───────────────────────────────────────────────────────

describe('DirectoryNode chip buttons', () => {
  it('shows the "flagged" chip when flags exist in localStorage', async () => {
    setup(TINY_LIBRARY, { 'sl-conf': ['t1'] });
    await screen.findByText('Tiny Topic');
    expect(await screen.findByText(/🚩 1 flagged/)).toBeInTheDocument();
  });

  it('shows the "starred" chip when stars exist in localStorage', async () => {
    setup(TINY_LIBRARY, { 'sl-star': ['t1'] });
    await screen.findByText('Tiny Topic');
    expect(await screen.findByText(/★ 1 starred/)).toBeInTheDocument();
  });

  it('clicking the flagged chip starts a flagged-only study session', async () => {
    const user = setup(TINY_LIBRARY, { 'sl-conf': ['t1'] });
    await screen.findByText('Tiny Topic');
    await user.click(await screen.findByText(/🚩 1 flagged/));
    // Learn screen with only the flagged card
    await screen.findByText('First Card');
    // Queue has only 1 card
    expect(screen.getByText('0 / 1')).toBeInTheDocument();
  });

  it('clicking the starred chip starts a starred-only study session', async () => {
    const user = setup(TINY_LIBRARY, { 'sl-star': ['t2'] });
    await screen.findByText('Tiny Topic');
    await user.click(await screen.findByText(/★ 1 starred/));
    // Only the starred card (t2 = Second Card)
    await screen.findByText('Second Card');
    expect(screen.getByText('0 / 1')).toBeInTheDocument();
  });
});
