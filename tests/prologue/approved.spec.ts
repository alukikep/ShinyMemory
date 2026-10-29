import { expect, test } from '@playwright/test';

/**
 * 审查台通过的内容必须真的进正式构建。
 *
 * 这条测试守的是一个真实踩过的坑：`import.meta.glob` 在构建产物运行时不存在，
 * 用运行时判空会让整批 approved 内容静默变成空表——包里有字符串，游戏里没有内容。
 */
test('approved content reaches the built game', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto('/?debug=1');
  await page.waitForFunction(() => Boolean(window.__SHINY_MEMORY__));

  // 事件表列出 CONTENT_INDEX 里的每一条事件；有行就说明内容载入了。
  const eventRows = page.locator('.debug-panel tbody tr');
  await expect(eventRows.first()).toBeVisible();
  await expect(page.locator('.debug-panel')).toContainText('还没唱完的一句');

  expect(errors).toEqual([]);
});
