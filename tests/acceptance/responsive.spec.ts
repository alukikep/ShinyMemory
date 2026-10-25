import { expect, test } from '@playwright/test';
import { openGame } from './helpers';

test('has no horizontal overflow at desktop and mobile widths', async ({
  page,
}) => {
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 1024, height: 900 },
    { width: 768, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await openGame(page);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, `${viewport.width}px`).toBeLessThanOrEqual(0);
    await expect(page.locator('.scene-panel')).toBeVisible();
  }
});

test('uses the bottom nav on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openGame(page);
  const navPosition = await page
    .locator('.sidebar-nav')
    .evaluate((element) => getComputedStyle(element).position);
  expect(navPosition).toBe('fixed');
  await expect(page.getByRole('button', { name: '日程表' })).toBeVisible();
});
