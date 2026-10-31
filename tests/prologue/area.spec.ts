import { expect, test } from '@playwright/test';
import { jumpTo, openGame, reset, watchConsole } from '../acceptance/helpers';

/**
 * 地点入口：街区页可以"进入"楼里的地点；进楼后地图栏隐藏，回到街区再出现。
 */

async function finishDialogue(page: import('@playwright/test').Page) {
  for (let index = 0; index < 120; index += 1) {
    if ((await page.locator('.dialogue-panel').count()) === 0) return;
    const choices = page.locator('.dialogue-choice');
    if ((await choices.count()) > 0) await choices.first().click();
    else await page.getByRole('button', { name: '继续' }).click();
    await page.waitForTimeout(10);
  }
  throw new Error('dialogue did not finish');
}

test('entering a place inside a district hides the map', async ({ page }) => {
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await finishDialogue(page);

  await jumpTo(page, 1, 12 * 60, 'studio_district');
  await expect(page.locator('#city-map')).toBeVisible();
  await page.getByRole('button', { name: '进入 练习室' }).click();

  await expect(page.getByRole('button', { name: '回到青叶练习街区' })).toBeVisible();
  await expect(page.locator('#city-map')).toHaveCount(0);

  await page.getByRole('button', { name: '回到青叶练习街区' }).click();
  await expect(page.locator('#city-map')).toBeVisible();
  await expect(page.getByRole('button', { name: /公共交通/ })).toBeVisible();

  expect(errors).toEqual([]);
});
