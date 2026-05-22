import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for SwipeLearn E2E tests.
 *
 * Run: npm run test:e2e
 *
 * Starts the Vite dev server automatically (if not already running) and
 * runs tests against Chromium only — the app targets mobile PWA use, so
 * testing against one solid browser is sufficient for E2E coverage.
 *
 * Service worker / offline tests use the 'chromium' project with cache
 * enabled; the dev server does NOT register a service worker (that only
 * happens in a Vite production build), so offline tests work against a
 * pre-cached state seeded via page.route().
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 14'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
