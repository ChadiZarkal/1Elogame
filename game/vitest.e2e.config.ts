/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import path from 'path';

/**
 * Vitest config specifically for Puppeteer E2E tests.
 * These tests require a running dev server.
 * 
 * Usage: npm run test:e2e
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // E2E tests run in Node, not jsdom
    include: ['e2e/**/*.e2e.ts'],
    testTimeout: 60_000, // E2E tests can be slow
    hookTimeout: 30_000,
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
