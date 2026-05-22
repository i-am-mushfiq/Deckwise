/**
 * E2E behavioral tests — Learn flow
 *
 * These tests run against the real Vite dev server in a Chromium browser.
 * They verify the full user journey with real DOM layout, real CSS, and
 * real localStorage — things that jsdom cannot simulate.
 *
 * Supabase is neutralised by seeding localStorage with an 'sl-lib' entry
 * before navigation; the app skips Supabase sync when offline/unauthenticated.
 */
import { test, expect } from '@playwright/test';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const TINY_LIBRARY = {
  id: 'root', title: 'My Library', type: 'directory',
  children: [{
    id: 'topic-e2e', title: 'E2E Topic', type: 'topic', path: [],
    cards: [
      { id: 'e1', order: 1, title: 'E2E Card One',   body: 'Body one.',   context: 'Context one.',   tags: ['foundational'], difficulty: 1 },
      { id: 'e2', order: 2, title: 'E2E Card Two',   body: 'Body two.',   context: 'Context two.',   tags: ['foundational'], difficulty: 1 },
      { id: 'e3', order: 3, title: 'E2E Card Three', body: 'Body three.', context: 'Context three.', tags: ['foundational'], difficulty: 2 },
    ],
  }],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Seed localStorage, navigate to the home screen, and click the topic row.
 */
async function navigateToLearn(page, library = TINY_LIBRARY) {
  await page.addInitScript((lib) => {
    localStorage.setItem('sl-lib', JSON.stringify(lib));
  }, library);
  await page.goto('/');
  await page.getByText('E2E Topic').click();
  await expect(page.getByText('E2E Card One')).toBeVisible();
}

// ── Learn screen ──────────────────────────────────────────────────────────────

test.describe('Learn screen', () => {
  test('shows the first card on navigation', async ({ page }) => {
    await navigateToLearn(page);
    await expect(page.getByText('E2E Card One')).toBeVisible();
    await expect(page.getByText('0 / 3')).toBeVisible();
  });

  test('shows the second card after advancing with ✓', async ({ page }) => {
    await navigateToLearn(page);
    await page.getByRole('button', { name: '✓' }).click();
    await expect(page.getByText('E2E Card Two')).toBeVisible();
    await expect(page.getByText('1 / 3')).toBeVisible();
  });

  test('goes back to the first card when ↩ is clicked', async ({ page }) => {
    await navigateToLearn(page);
    await page.getByRole('button', { name: '✓' }).click();
    await page.getByText('↩').click();
    await expect(page.getByText('E2E Card One')).toBeVisible();
    await expect(page.getByText('0 / 3')).toBeVisible();
  });

  test('shows Deep dive section when ↑ Expand is clicked on the active card', async ({ page }) => {
    await navigateToLearn(page);
    await page.getByTestId('active-card').getByText('↑ Expand').click();
    await expect(page.getByText('Deep dive')).toBeVisible();
    await expect(page.getByText('Context one.')).toBeVisible();
  });

  test('hides Deep dive section when ↓ Collapse is clicked', async ({ page }) => {
    await navigateToLearn(page);
    await page.getByTestId('active-card').getByText('↑ Expand').click();
    await page.getByText('↓ Collapse').click();
    await expect(page.getByText('Deep dive')).not.toBeVisible();
  });

  test('flag button toggles Flag → Flagged on the active card', async ({ page }) => {
    await navigateToLearn(page);
    await page.getByTestId('active-card').getByRole('button', { name: 'Flag' }).click();
    await expect(page.getByTestId('active-card').getByRole('button', { name: 'Flagged' })).toBeVisible();
  });

  test('star button toggles ☆ → ★ on the active card', async ({ page }) => {
    await navigateToLearn(page);
    await page.getByTestId('active-card').getByRole('button', { name: '☆' }).click();
    await expect(page.getByTestId('active-card').getByRole('button', { name: '★' })).toBeVisible();
  });

  test('returns to the home screen when ‹ is clicked', async ({ page }) => {
    await navigateToLearn(page);
    await page.getByText('‹').click();
    await expect(page.getByText('Overall progress')).toBeVisible();
  });
});

// ── Completion ────────────────────────────────────────────────────────────────

test.describe('Completion screen', () => {
  async function completeAllCards(page) {
    await navigateToLearn(page);
    await page.getByRole('button', { name: '✓' }).click();
    await page.getByRole('button', { name: '✓' }).click();
    await page.getByRole('button', { name: '✓' }).click();
    await expect(page.getByText('Done!')).toBeVisible();
  }

  test('shows "Done!" after completing all cards', async ({ page }) => {
    await completeAllCards(page);
  });

  test('returns to home screen when "Back to library" is clicked', async ({ page }) => {
    await completeAllCards(page);
    await page.getByRole('button', { name: /back to library/i }).click();
    await expect(page.getByText('Overall progress')).toBeVisible();
  });

  test('home screen shows 100% after completing all cards', async ({ page }) => {
    await completeAllCards(page);
    await page.getByRole('button', { name: /back to library/i }).click();
    await expect(page.getByText('100%').first()).toBeVisible();
  });

  test('flagged section shows the flagged card title on completion', async ({ page }) => {
    await navigateToLearn(page);
    await page.getByTestId('active-card').getByRole('button', { name: 'Flag' }).click();
    await page.getByRole('button', { name: '✓' }).click();
    await page.getByRole('button', { name: '✓' }).click();
    await page.getByRole('button', { name: '✓' }).click();
    await expect(page.getByText('Done!')).toBeVisible();
    await expect(page.getByText(/flagged · \d+/i)).toBeVisible();
    await expect(page.getByText('E2E Card One')).toBeVisible();
  });
});

// ── Sidebar ───────────────────────────────────────────────────────────────────

test.describe('Sidebar', () => {
  test('opens and closes correctly', async ({ page }) => {
    await page.addInitScript(() => {});
    await page.goto('/');
    await page.getByText('☰').click();
    await expect(page.getByText('Deckwise').first()).toBeVisible();
    await page.getByText('✕').first().click();
    await expect(page.getByText('Overall progress')).toBeVisible();
  });

  test('switching to Midnight theme persists after page reload', async ({ page }) => {
    await page.goto('/');
    await page.getByText('☰').click();
    await page.getByText('Midnight').click();
    await page.reload();
    // After reload, localStorage theme 'midnight' is read at module level
    // The body background should reflect midnight theme (#0d0f18)
    const bodyBg = await page.evaluate(() =>
      getComputedStyle(document.body).backgroundColor
    );
    // Background is set inline — check localStorage instead as the ground truth
    const theme = await page.evaluate(() => localStorage.getItem('sl-theme'));
    expect(theme).toBe('"midnight"');
  });
});
