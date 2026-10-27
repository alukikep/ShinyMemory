import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { reviewApiPlugin } from './tools/reviewPlugin.js';

export default defineConfig(({ mode }) => ({
  plugins: [react(), reviewApiPlugin()],
  base: './',
  resolve: {
    alias: {
      '#content-pack': fileURLToPath(
        new URL(
          mode === 'fixture'
            ? './src/core/content-fixture/pack.ts'
            : './src/core/productionPack.ts',
          import.meta.url,
        ),
      ),
    },
  },
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['tests/acceptance/**', 'tests/review/**', 'node_modules/**'],
    setupFiles: ['./src/test/setupContent.ts'],
  },
}));
