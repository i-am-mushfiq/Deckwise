/**
 * E2E behavioral tests — persistence across page reloads
 *
 * These tests verify that localStorage state is correctly written, and that on
 * a fresh page load the app reads it back and reflects it in the UI.
 *
 * This is the class of bug that integration tests (jsdom) cannot catch because
 * jsdom does not reload — it only clears between tests via beforeEach.
 */
import { test, expect } from '@playwright/test';

const TINY_LIBRARY = {
  id: 'root', title: 'My Library', type: 'directory',
  children: [{
    id: 'topic-persist', title: 'Persist Topic', type: 'topic', path: [],
    cards: [
      { id: 'p1', order: 1, title: 'Persist Card One',   body: 'Body.', context: 'Context.', tags: [], difficulty: 1 },
      { id: 'p2', order: 2, title: 'Persist Card Two',   body: 'Body.', context: 'Context.', tags: [], difficulty: 1 },
      { id: 'p3', order: 3, title: 'Persist Card Three', body: 'Body.', context: 'Context.', tags: [], difficulty: 1 },
    ],
  }],
};

async function seedAndLoad(page, library = TINY_LIBRARY) {
  await page.addInitScript((lib) => {
    localStorage.setItem('sl-lib', JSON.stringify(lib));
  }, library);
  await page.goto('/');
}

// ── Progress persistence across reload ───────────────────────────────────────

test.describe('Progress persists across page reloads', () => {
  test('overall progress percentage survives a reload', async ({ page }) => {
    await seedAndLoad(page);
    // Complete card 1
    await page.getByText('Persist Topic').click();
    await page.getByRole('button', { name: '✓' }).click();
    // Go home
    await page.getByText('‹').click();
    await expect(page.getByText('Overall progress')).toBeVisible();

    // Reload the page — progress should survive
    await page.reload();
    // 1 of 3 cards done = 33%
    await expect(page.getByText(/33%/).first()).toBeVisible();
  });

  test('completion count shown on home screen survives reload', async ({ page }) => {
    await seedAndLoad(page);
    await page.getByText('Persist Topic').click();
    await page.getByRole('button', { name: '✓' }).click();
    await page.getByRole('button', { name: '✓' }).click();
    await page.getByText('‹').click();
    await page.reload();
    // 2 of 3 done
    await expect(page.getByText(/2 of 3 cards/i)).toBeVisible();
  });

  test('flagged card chip appears after reload if card was flagged', async ({ page }) => {
    await seedAndLoad(page);
    await page.getByText('Persist Topic').click();
    await page.getByTestId('active-card').getByRole('button', { name: 'Flag' }).click();
    await page.getByText('‹').click();
    await page.reload();
    await expect(page.getByText(/🚩 1 flagged/)).toBeVisible();
  });

  test('starred card chip appears after reload if card was starred', async ({ page }) => {
    await seedAndLoad(page);
    await page.getByText('Persist Topic').click();
    await page.getByTestId('active-card').getByRole('button', { name: '☆' }).click();
    await page.getByText('‹').click();
    await page.reload();
    await expect(page.getByText(/★ 1 starred/)).toBeVisible();
  });

  test('flagged study session still works after reload', async ({ page }) => {
    await seedAndLoad(page);
    await page.getByText('Persist Topic').click();
    await page.getByTestId('active-card').getByRole('button', { name: 'Flag' }).click();
    await page.getByText('‹').click();
    await page.reload();
    await page.getByText(/🚩 1 flagged/).click();
    // Session has only 1 card
    await expect(page.getByText('0 / 1')).toBeVisible();
    await expect(page.getByText('Persist Card One')).toBeVisible();
  });
});

// ── Library persistence ───────────────────────────────────────────────────────

test.describe('Library persists across reloads', () => {
  test('custom library topics are still visible after reload', async ({ page }) => {
    await seedAndLoad(page);
    await expect(page.getByText('Persist Topic')).toBeVisible();
    await page.reload();
    await expect(page.getByText('Persist Topic')).toBeVisible();
  });
});

// ── Theme persistence ─────────────────────────────────────────────────────────

test.describe('Theme persists across reloads', () => {
  test('Forest theme is restored after reload', async ({ page }) => {
    await page.goto('/');
    await page.getByText('☰').click();
    await page.getByText('Forest').click();
    await page.reload();
    const theme = await page.evaluate(() => localStorage.getItem('sl-theme'));
    expect(theme).toBe('"forest"');
  });

  test('Obsidian theme is restored after reload', async ({ page }) => {
    await page.goto('/');
    await page.getByText('☰').click();
    await page.getByText('Obsidian').click();
    await page.reload();
    const theme = await page.evaluate(() => localStorage.getItem('sl-theme'));
    expect(theme).toBe('"obsidian"');
  });
});

// ── Reset ─────────────────────────────────────────────────────────────────────

test.describe('Reset wipes all progress', () => {
  test('Reset clears progress and localStorage shows 0% after reload', async ({ page }) => {
    // Pre-seed with completed progress
    await page.addInitScript((lib) => {
      localStorage.setItem('sl-lib', JSON.stringify(lib));
      localStorage.setItem('sl-comp', JSON.stringify({ p1: true, p2: true }));
    }, TINY_LIBRARY);
    await page.goto('/');
    await expect(page.getByText(/66%/).first()).toBeVisible();

    // Reset
    await page.getByRole('button', { name: /reset/i }).click();
    await expect(page.getByText(/^0%$/).first()).toBeVisible();

    // Reload — progress should still be zero
    await page.reload();
    const pct = await page.getByText(/^0%$/).first();
    await expect(pct).toBeVisible();
  });
});
