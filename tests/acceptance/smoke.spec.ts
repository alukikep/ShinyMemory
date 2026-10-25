import { expect, test } from '@playwright/test';
import { getState, openGame, watchConsole } from './helpers';

test('loads the first day without console errors', async ({ page }, testInfo) => {
  const errors = watchConsole(page);
  await openGame(page);

  await expect(page.getByText('ShinyMemory')).toBeVisible();
  await expect(page.getByRole('button', { name: '当前安排' })).toBeVisible();
  await expect(page.getByRole('button', { name: '偶像名册' })).toBeVisible();
  await expect(page.getByRole('button', { name: '日程表' })).toBeVisible();
  await expect(page.locator('.map-node')).toHaveCount(7);

  const state = await getState(page);
  expect(state.clock.absoluteMinutes).toBe(8 * 60);
  expect(state.locationId).toBe('office');
  expect(state.jobs).toEqual([]);

  const currentFill = await page
    .locator('.map-node.current rect')
    .evaluate((element) => getComputedStyle(element).fill);
  expect(currentFill).not.toContain('rgba');

  await testInfo.attach('desktop-plan', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });

  expect(errors).toEqual([]);
});
