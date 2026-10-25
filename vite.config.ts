import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['tests/acceptance/**', 'node_modules/**'],
  },
});
