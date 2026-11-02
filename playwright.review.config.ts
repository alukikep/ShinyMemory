import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/review',
  fullyParallel: false,
  workers: 1,
  // 审查台是 Vite dev server，冷启动时偶发“修订后编辑器被列表刷新盖掉”，
  // 重试一次能稳定通过；真正的功能失败仍会在第二次暴露。
  retries: 1,
  timeout: 30_000,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report-review' }]],
  use: {
    baseURL: 'http://127.0.0.1:5178',
    channel: process.env.PW_CHANNEL ?? 'msedge',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  webServer: {
    command: 'vite --host 127.0.0.1 --port 5178',
    url: 'http://127.0.0.1:5178/review.html',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
