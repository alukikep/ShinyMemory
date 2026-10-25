import { expect, test } from '@playwright/test';
import { getState, jumpTo, openGame } from './helpers';

test('schedule starts today and shows seven days', async ({ page }) => {
  await openGame(page);
  await page.getByRole('button', { name: '日程表' }).click();

  await expect(page.locator('.schedule-day')).toHaveCount(7);
  await expect(page.locator('.schedule-day').first().locator('h3')).toHaveText(
    '今天',
  );
  await expect(page.locator('.schedule-day').first()).toContainText(
    '4月6日',
  );
  await expect(page.locator('.schedule-day').nth(1).locator('h3')).toHaveText(
    '4月7日',
  );
  await expect(page.locator('.schedule-day').last()).toContainText('星期日');

  await page.getByRole('button', { name: '关闭日程表' }).click();
  await expect(page.locator('.schedule-panel')).toHaveCount(0);
});

test('schedule window moves with the current day', async ({ page }) => {
  await openGame(page);
  await jumpTo(page, 2, 8 * 60, 'office');
  await page.getByRole('button', { name: '日程表' }).click();

  const state = await getState(page);
  expect(state.clock.absoluteMinutes).toBe(1440 + 8 * 60);
  await expect(page.locator('.schedule-day').first()).toContainText('4月7日');
  await expect(page.locator('.schedule-day').last()).toContainText('4月13日');
});
