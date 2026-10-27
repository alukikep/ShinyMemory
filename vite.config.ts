import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { reviewApiPlugin } from './tools/reviewPlugin.js';

export default defineConfig({
  plugins: [react(), reviewApiPlugin()],
  base: './',
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['tests/acceptance/**', 'tests/review/**', 'node_modules/**'],
    setupFiles: ['./src/test/setupContent.ts'],
  },
});
