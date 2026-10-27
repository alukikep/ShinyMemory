import { expect, test } from '@playwright/test';
import {
  getState,
  jumpTo,
  openGame,
  reset,
  watchConsole,
} from '../acceptance/helpers';

async function finishDialogue(page: import('@playwright/test').Page) {
  for (let i = 0; i < 40; i += 1) {
    if ((await page.locator('.dialogue-panel').count()) === 0) return;
    const choices = page.locator('.dialogue-choice');
    if ((await choices.count()) > 0) {
      await choices.first().click();
    } else {
      await page.getByRole('button', { name: '继续' }).click();
    }
    await page.waitForTimeout(20);
  }
  throw new Error('dialogue did not finish');
}

test('Meguru unlock: unknown -> known -> recruited', async ({ page }) => {
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await jumpTo(page, 1, 12 * 60, 'shopping_street');

  await page.getByRole('button', { name: '偶像名册' }).click();
  await expect(
    page.getByRole('heading', { name: '八宫巡' }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: '关闭偶像名册' }).click();

  await page.getByRole('button', { name: '和巡搭话' }).click();
  await expect(page.locator('.dialogue-panel')).toBeVisible();
  await finishDialogue(page);

  expect((await getState(page)).idols.meguru?.status).toBe('known');
  expect(
    (await getState(page)).storyChains['meguru-encounter']?.nextEligibleDay,
  ).toBe(3);

  await page.getByRole('button', { name: '偶像名册' }).click();
  await expect(
    page.getByRole('heading', { name: '八宫巡' }),
  ).toBeVisible();
  await expect(page.getByText('尚未招募')).toBeVisible();
  await page.getByRole('button', { name: '关闭偶像名册' }).click();

  await page.getByRole('button', { name: '日程表' }).click();
  await expect(
    page.locator('.schedule-panel').getByText('八宫巡'),
  ).toHaveCount(0);
  await page.getByRole('button', { name: '关闭日程表' }).click();

  await jumpTo(page, 2, 12 * 60, 'park');
  await expect(page.getByRole('button', { name: '去公园找巡' })).toHaveCount(0);

  await jumpTo(page, 3, 12 * 60, 'park');
  await expect(page.getByRole('button', { name: '去公园找巡' })).toBeVisible();
  await page.getByRole('button', { name: '去公园找巡' }).click();
  await finishDialogue(page);

  expect((await getState(page)).idols.meguru?.status).toBe('recruited');
  expect(
    (await getState(page)).storyChains['meguru-encounter']?.completed,
  ).toBe(true);
  expect((await getState(page)).activeIdolId).toBe('mano');

  await page.getByRole('button', { name: '偶像名册' }).click();
  await expect(
    page.getByRole('heading', { name: '八宫巡' }),
  ).toBeVisible();
  await page.getByRole('button', { name: '关闭偶像名册' }).click();

  await page.getByRole('button', { name: '日程表' }).click();
  await expect(page.getByRole('tab', { name: '八宫巡' })).toBeVisible();
  await page.getByRole('button', { name: '关闭日程表' }).click();

  await jumpTo(page, 4, 12 * 60, 'practice_room');
  await page.getByRole('button', { name: /八宫巡/ }).click();
  expect((await getState(page)).phase).toBe('idol');
  expect((await getState(page)).activeIdolId).toBe('meguru');
  await page.getByRole('button', { name: /^声乐课/ }).click();
  expect((await getState(page)).phase).toBe('activityResult');

  expect(errors).toEqual([]);
});
