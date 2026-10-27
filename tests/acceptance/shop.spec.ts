import { expect, test } from '@playwright/test';
import {
  getState,
  jumpTo,
  openGame,
  reset,
  watchConsole,
} from './helpers';

test('buys a gift, stores it, and gives it to an idol', async ({ page }) => {
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await jumpTo(page, 1, 600, 'shopping_street');

  await page.getByRole('button', { name: /街角礼品店/ }).click();
  await expect(page.locator('.shop-item')).toHaveCount(4);
  await page.getByRole('button', { name: '购买' }).first().click();
  await expect
    .poll(async () => (await getState(page)).inventory['gift.flower'])
    .toBe(1);
  await expect
    .poll(async () => (await getState(page)).money)
    .toBe(2500);

  await page.reload();
  await page.waitForFunction(() => Boolean(window.__SHINY_MEMORY__));
  expect((await getState(page)).inventory['gift.flower']).toBe(1);

  await page.getByRole('button', { name: '背包' }).click();
  await page.locator('.inventory-target select').selectOption('hiori');
  await page.getByRole('button', { name: /赠送给/ }).click();
  await expect
    .poll(async () => (await getState(page)).inventory['gift.flower'])
    .toBeUndefined();
  await expect(page.locator('.inventory-feedback')).toContainText('风野灯织');
  expect((await getState(page)).idols.hiori?.stats.trust.exp).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});
