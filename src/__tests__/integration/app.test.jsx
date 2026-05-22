// @vitest-environment jsdom
/**
 * Integration tests — src/App.jsx
 *
 * Renders the full App with mocked Supabase (null → no auth/sync side-effects)
 * and drives all major UI flows via @testing-library/react.
 *
 * Behavioral principle: every test asserts on an OUTCOME (localStorage state,
 * correct card title rendered, correct count displayed) rather than just
 * confirming an element is present in the DOM.
 *
 * Key DOM facts:
 *  - DraggableCard with `isTop` receives `data-testid="active-card"`.
 *    Use `within(screen.getByTestId('active-card'))` to target the visible
 *    top card without relying on DOM position.
 *  - The Sidebar is ALWAYS rendered (off-screen when closed); its active-theme
 *    ✓ <span> is always in the DOM.  Tests that need the ActionBar ✓ use
 *    getByRole('button', { name: '✓' }) to target the button specifically.
 *  - "Tiny Topic" appears in the learn-screen header AND each card's
 *    topicTitle field.  Tests use findAllByText() where needed.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App.jsx';
import { TINY_LIBRARY } from '../fixtures.js';

// Supabase is null in all integration tests — the app works fully offline.
// Auth/sync behavioral tests live in auth-sync.test.jsx.
vi.mock('../../supabase.js', () => ({ supabase: null }));

// ── Helpers ───────────────────────────────────────────────────────────────────

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
 * The first `findAllByText('Tiny Topic')` match on the home screen is
 * the clickable topic row.
 */
const navigateToLearn = async (user, extra = {}) => {
  setup(TINY_LIBRARY, extra);
  const allMatches = await screen.findAllByText('Tiny Topic');
  await user.click(allMatches[0]);
  await screen.findByText('First Card');
};

// ── Home screen ───────────────────────────────────────────────────────────────

describe('Home screen', () => {
  it('renders the home screen after initial load', async () => {
    setup();
    await screen.findByText('Overall progress');
  });

  it('shows 0% completion on fresh load', async () => {
    setup(TINY_LIBRARY);
    const pcts = await screen.findAllByText(/^0%$/);
    expect(pcts.length).toBeGreaterThan(0);
  });

  it('shows demo topics when no library is stored', async () => {
    setup();
    expect(await screen.findByText('Demo Deck')).toBeInTheDocument();
    expect(await screen.findByText('How to Learn Anything')).toBeInTheDocument();
  });

  it('shows custom library topics loaded from localStorage', async () => {
    setup(TINY_LIBRARY);
    expect(await screen.findByText('Tiny Topic')).toBeInTheDocument();
  });

  it('shows "0 of 2 cards" in overall progress for a 2-card library', async () => {
    setup(TINY_LIBRARY);
    expect(await screen.findByText(/0 of 2 cards/i)).toBeInTheDocument();
  });

  it('shows 50% completion when one of two cards is pre-seeded complete', async () => {
    setup(TINY_LIBRARY, { 'sl-comp': { t1: true } });
    const pcts = await screen.findAllByText(/50%/);
    expect(pcts.length).toBeGreaterThan(0);
  });

  it('shows the hamburger menu button', async () => {
    setup();
    expect(await screen.findByText('☰')).toBeInTheDocument();
  });

  it('shows the "Edit library" button', async () => {
    setup();
    expect(await screen.findByRole('button', { name: /edit library/i })).toBeInTheDocument();
  });

  it('shows the "AI Prompt" toggle button', async () => {
    setup();
    expect(await screen.findByRole('button', { name: /ai prompt/i })).toBeInTheDocument();
  });

  it('shows the "Generate with AI" CTA somewhere on the page', async () => {
    setup();
    const els = await screen.findAllByText(/generate with ai/i);
    expect(els.length).toBeGreaterThan(0);
  });
});

// ── Sidebar ───────────────────────────────────────────────────────────────────

describe('Sidebar', () => {
  it('opens when the hamburger button is clicked', async () => {
    const user = setup();
    await user.click(await screen.findByText('☰'));
    expect(await screen.findByText('Deckwise')).toBeInTheDocument();
  });

  it('shows "Sign in to sync" when no user is logged in', async () => {
    const user = setup();
    await user.click(await screen.findByText('☰'));
    expect(await screen.findByText(/sign in to sync/i)).toBeInTheDocument();
  });

  it('shows all five color profile options', async () => {
    const user = setup();
    await user.click(await screen.findByText('☰'));
    for (const name of ['Rustic Autumn', 'Midnight', 'Forest', 'Slate', 'Obsidian']) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
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
    await user.click(screen.getAllByText('✕')[0]);
    // Home screen is still intact after close
    await screen.findByText('Overall progress');
  });

  it('opens AuthModal when the Sign in button is clicked in the sidebar', async () => {
    const user = setup();
    await user.click(await screen.findByText('☰'));
    await user.click(await screen.findByRole('button', { name: /^sign in$/i }));
    expect(await screen.findByText(/sign in with google/i)).toBeInTheDocument();
  });

  it('can add a community deck to the library and the button confirms', async () => {
    const user = setup(TINY_LIBRARY);
    await user.click(await screen.findByText('☰'));
    const addBtns = await screen.findAllByRole('button', { name: /add to library/i });
    await user.click(addBtns[0]);
    expect(await screen.findByText('Added ✓')).toBeInTheDocument();
  });

  it('persists the chosen theme to localStorage when a color profile is clicked', async () => {
    const user = setup();
    await user.click(await screen.findByText('☰'));
    await user.click(screen.getByText('Midnight'));
    await waitFor(() => {
      expect(localStorage.getItem('sl-theme')).toBe('"midnight"');
    });
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
    expect(await screen.findByText('Your Library')).toBeInTheDocument();
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
    await user.click(screen.getAllByText('✕')[0]);
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
    expect(await screen.findByText('Generate with AI')).toBeInTheDocument();
  });

  it('shows Topic and Audience input fields', async () => {
    const user = setup();
    await user.click(await screen.findByRole('button', { name: /ai prompt/i }));
    expect(await screen.findByPlaceholderText(/how transformers work/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/software engineers/i)).toBeInTheDocument();
  });

  it('collapses when "✕ Close" is clicked and input fields disappear', async () => {
    const user = setup();
    await user.click(await screen.findByRole('button', { name: /ai prompt/i }));
    await screen.findByPlaceholderText(/how transformers work/i);
    await user.click(screen.getByRole('button', { name: /✕ close/i }));
    await waitFor(() => {
      expect(screen.queryByPlaceholderText(/how transformers work/i)).not.toBeInTheDocument();
    });
  });
});

// ── Learn screen ──────────────────────────────────────────────────────────────

describe('Learn screen', () => {
  it('shows the first card title on the active card', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    // The active card specifically contains "First Card"
    expect(within(screen.getByTestId('active-card')).getByText('First Card')).toBeInTheDocument();
  });

  it('shows progress counter "0 / 2" for a 2-card deck', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    await screen.findByText('0 / 2');
  });

  it('shows the ✓ done button in the ActionBar', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    // getByRole('button') distinguishes the ActionBar ✓ from the sidebar ✓ <span>
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
    expect(screen.getByText('↩').closest('button').style.opacity).toBe('0.3');
  });

  it('shows the second card after advancing with ✓', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    await user.click(screen.getByRole('button', { name: '✓' }));
    expect(await within(await screen.findByTestId('active-card')).findByText('Second Card')).toBeInTheDocument();
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
      expect(screen.getByText('↩').closest('button').style.opacity).toBe('1');
    });
  });

  it('shows the first card again after going back with ↩', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    await user.click(screen.getByRole('button', { name: '✓' }));
    await screen.findByText('Second Card');
    await user.click(screen.getByText('↩'));
    expect(await within(await screen.findByTestId('active-card')).findByText('First Card')).toBeInTheDocument();
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
    await screen.findByText('↺ 1');
  });

  it('shows the context (Deep dive) for the active card when "↑ Expand" is clicked', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    // Only target the active card's Expand button — no DOM-position guessing
    await user.click(within(screen.getByTestId('active-card')).getByText('↑ Expand'));
    expect(await screen.findByText('Deep dive')).toBeInTheDocument();
    // Context is the correct card's context, not the background card's
    expect(screen.getByText('Deep dive of first card.')).toBeInTheDocument();
  });

  it('hides the context section when "↓ Collapse" is clicked', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    await user.click(within(screen.getByTestId('active-card')).getByText('↑ Expand'));
    await user.click(await screen.findByText('↓ Collapse'));
    await waitFor(() => {
      expect(screen.queryByText('Deep dive')).not.toBeInTheDocument();
    });
  });

  it('toggles the flag button on the active card: Flag → Flagged', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    await user.click(within(screen.getByTestId('active-card')).getByRole('button', { name: 'Flag' }));
    expect(within(screen.getByTestId('active-card')).getByRole('button', { name: 'Flagged' })).toBeInTheDocument();
  });

  it('toggles the flag button on the active card: Flagged → Flag', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    await user.click(within(screen.getByTestId('active-card')).getByRole('button', { name: 'Flag' }));
    await user.click(within(screen.getByTestId('active-card')).getByRole('button', { name: 'Flagged' }));
    expect(within(screen.getByTestId('active-card')).getByRole('button', { name: 'Flag' })).toBeInTheDocument();
  });

  it('toggles the star button on the active card: ☆ → ★', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    await user.click(within(screen.getByTestId('active-card')).getByRole('button', { name: '☆' }));
    expect(within(screen.getByTestId('active-card')).getByRole('button', { name: '★' })).toBeInTheDocument();
  });

  it('toggles the star button on the active card: ★ → ☆', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    await user.click(within(screen.getByTestId('active-card')).getByRole('button', { name: '☆' }));
    await user.click(within(screen.getByTestId('active-card')).getByRole('button', { name: '★' }));
    expect(within(screen.getByTestId('active-card')).getByRole('button', { name: '☆' })).toBeInTheDocument();
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
    await user.click(screen.getByRole('button', { name: '✓' }));
    await user.click(screen.getByRole('button', { name: '✓' }));
    await screen.findByText('Done!');
  });
});

// ── Completion screen ─────────────────────────────────────────────────────────

describe('Completion screen', () => {
  /** Navigate through a full deck, completing every card. */
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
    expect(screen.getByText('Tiny Topic')).toBeInTheDocument();
  });

  it('returns to the home screen when "Back to library" is clicked', async () => {
    const user = userEvent.setup();
    await completeAllCards(user);
    await user.click(screen.getByRole('button', { name: /back to library/i }));
    await screen.findByText('Overall progress');
  });

  it('home screen shows 100% after completing all cards', async () => {
    const user = userEvent.setup();
    await completeAllCards(user);
    await user.click(screen.getByRole('button', { name: /back to library/i }));
    const pcts = await screen.findAllByText(/100%/);
    expect(pcts.length).toBeGreaterThan(0);
  });

  it('shows the revisit queue section when cards were swiped right (↺)', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    await user.click(screen.getByText('↺'));
    await user.click(screen.getByRole('button', { name: '✓' }));
    await screen.findByText('Done!');
    expect(screen.getByText(/review queue/i)).toBeInTheDocument();
  });

  it('shows flagged section with card title when a card was flagged before completing', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    // Flag the active card (t1 = First Card)
    await user.click(within(screen.getByTestId('active-card')).getByRole('button', { name: 'Flag' }));
    await user.click(screen.getByRole('button', { name: '✓' }));
    await user.click(screen.getByRole('button', { name: '✓' }));
    await screen.findByText('Done!');
    expect(screen.getByText(/flagged · \d+/i)).toBeInTheDocument();
    // The flagged card's title should appear in the flagged section
    expect(screen.getByText('First Card')).toBeInTheDocument();
  });

  it('shows starred section with card title when a card was starred before completing', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    await user.click(within(screen.getByTestId('active-card')).getByRole('button', { name: '☆' }));
    await user.click(screen.getByRole('button', { name: '✓' }));
    await user.click(screen.getByRole('button', { name: '✓' }));
    await screen.findByText('Done!');
    expect(screen.getByText(/starred · \d+/i)).toBeInTheDocument();
    expect(screen.getByText('First Card')).toBeInTheDocument();
  });
});

// ── Progress persistence (localStorage) ───────────────────────────────────────

describe('Progress persistence (localStorage)', () => {
  it('writes t1 completion to localStorage after advancing with ✓', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    await user.click(screen.getByRole('button', { name: '✓' }));
    expect(JSON.parse(localStorage.getItem('sl-comp') || '{}')).toMatchObject({ t1: true });
  });

  it('removes t1 from completionMap in localStorage after going back with ↩', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    await user.click(screen.getByRole('button', { name: '✓' }));
    await user.click(screen.getByText('↩'));
    const stored = JSON.parse(localStorage.getItem('sl-comp') || '{}');
    expect(stored.t1).toBeUndefined();
  });

  it('adds t1 to revisit array in localStorage when ↺ is clicked', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    await user.click(screen.getByText('↺'));
    expect(JSON.parse(localStorage.getItem('sl-rev') || '[]')).toContain('t1');
  });

  it('adds t1 to confused array in localStorage when the active card is flagged', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    await user.click(within(screen.getByTestId('active-card')).getByRole('button', { name: 'Flag' }));
    expect(JSON.parse(localStorage.getItem('sl-conf') || '[]')).toContain('t1');
  });

  it('adds t1 to starred array in localStorage when the active card is starred', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    await user.click(within(screen.getByTestId('active-card')).getByRole('button', { name: '☆' }));
    expect(JSON.parse(localStorage.getItem('sl-star') || '[]')).toContain('t1');
  });

  it('un-flags t1 in localStorage on a second click (toggle off)', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    const activeCard = screen.getByTestId('active-card');
    await user.click(within(activeCard).getByRole('button', { name: 'Flag' }));
    await user.click(within(screen.getByTestId('active-card')).getByRole('button', { name: 'Flagged' }));
    expect(JSON.parse(localStorage.getItem('sl-conf') || '[]')).not.toContain('t1');
  });

  it('loads pre-seeded completion state and shows 50% on the home screen', async () => {
    setup(TINY_LIBRARY, { 'sl-comp': { t1: true } });
    const pcts = await screen.findAllByText(/50%/);
    expect(pcts.length).toBeGreaterThan(0);
  });
});

// ── Reset ─────────────────────────────────────────────────────────────────────

describe('Reset', () => {
  it('clears all progress from localStorage and shows 0% after clicking Reset', async () => {
    const user = setup(TINY_LIBRARY, {
      'sl-comp': { t1: true },
      'sl-rev': ['t2'],
      'sl-conf': ['t1'],
    });
    await screen.findByText('Tiny Topic');
    await user.click(screen.getByRole('button', { name: /reset/i }));
    // All localStorage progress keys should be cleared
    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem('sl-comp') || '{}')).toEqual({});
    });
    const pcts = await screen.findAllByText(/^0%$/);
    expect(pcts.length).toBeGreaterThan(0);
  });
});

// ── DirectoryNode chip buttons ────────────────────────────────────────────────

describe('DirectoryNode chip buttons', () => {
  it('shows the "flagged" chip when flags exist in localStorage', async () => {
    setup(TINY_LIBRARY, { 'sl-conf': ['t1'] });
    expect(await screen.findByText(/🚩 1 flagged/)).toBeInTheDocument();
  });

  it('shows the "starred" chip when stars exist in localStorage', async () => {
    setup(TINY_LIBRARY, { 'sl-star': ['t1'] });
    expect(await screen.findByText(/★ 1 starred/)).toBeInTheDocument();
  });

  it('clicking the flagged chip starts a 1-card flagged-only session', async () => {
    const user = setup(TINY_LIBRARY, { 'sl-conf': ['t1'] });
    await user.click(await screen.findByText(/🚩 1 flagged/));
    // Only the flagged card (t1 = First Card) is in the queue
    expect(await within(await screen.findByTestId('active-card')).findByText('First Card')).toBeInTheDocument();
    expect(screen.getByText('0 / 1')).toBeInTheDocument();
  });

  it('clicking the starred chip starts a 1-card starred-only session', async () => {
    const user = setup(TINY_LIBRARY, { 'sl-star': ['t2'] });
    await user.click(await screen.findByText(/★ 1 starred/));
    // Only the starred card (t2 = Second Card) is in the queue
    expect(await within(await screen.findByTestId('active-card')).findByText('Second Card')).toBeInTheDocument();
    expect(screen.getByText('0 / 1')).toBeInTheDocument();
  });
});

// ── End-to-end pipeline tests ─────────────────────────────────────────────────
// These tests verify that two halves of the same feature connect correctly:
// flag a card in learn → home screen shows the chip → chip starts filtered session.

describe('End-to-end pipeline: flag → chip → filtered session', () => {
  it('flagging a card in learn creates the chip on the home screen', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    await user.click(within(screen.getByTestId('active-card')).getByRole('button', { name: 'Flag' }));
    // Return to home screen
    await user.click(screen.getByText('‹'));
    // Chip should now be visible on the home screen
    expect(await screen.findByText(/🚩 1 flagged/)).toBeInTheDocument();
  });

  it('flagged chip opens a filtered session containing only the flagged card', async () => {
    const user = userEvent.setup();
    await navigateToLearn(user);
    await user.click(within(screen.getByTestId('active-card')).getByRole('button', { name: 'Flag' }));
    await user.click(screen.getByText('‹'));
    await user.click(await screen.findByText(/🚩 1 flagged/));
    // Session has exactly 1 card and it's the flagged one (First Card = t1)
    expect(await within(await screen.findByTestId('active-card')).findByText('First Card')).toBeInTheDocument();
    expect(screen.getByText('0 / 1')).toBeInTheDocument();
  });
});
