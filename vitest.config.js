import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Separate Vitest config so the Vite build (vite.config.js) keeps its PWA plugin
// without it being pulled into the test environment (where it would fail).
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    // Default environment for component / integration tests is jsdom.
    // API tests override per-file with @vitest-environment node.
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    include: ['src/__tests__/**/*.{test,spec}.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{js,jsx}', 'api/**/*.js'],
      exclude: [
        'src/test/**',
        'src/__tests__/**',
        'src/main.jsx',
      ],
    },
    environmentOptions: {
      jsdom: {
        url: 'http://localhost:3000',
      },
    },
  },
});
