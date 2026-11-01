import { expect, test } from '@playwright/test';
import { getState, jumpTo, openGame, reset, watchConsole } from '../acceptance/helpers';

/**
 * 地点入口：街区页可以"进入"楼里的地点；进楼后地图栏隐藏，回到街区再出现。
 *
 * 2026-11 追加：望丘台（大学一带）也是入口——結華平日白天在这里上课，
 * 所以"进楼 0 分钟 + 她真的在场"一起验，否则又会变成一座空街区。
 */

async function finishDialogue(page: import('@playwright/test').Page) {
  for (let index = 0; index < 200; index += 1) {
    if ((await page.locator('.dialogue-panel').count()) === 0) return;
    const choices = page.locator('.dialogue-choice');
    if ((await choices.count()) > 0) await choices.first().click();
    else await page.getByRole('button', { name: '继续' }).click();
    await page.waitForTimeout(10);
  }
  throw new Error('dialogue did not finish');
}

async function pick(page: import('@playwright/test').Page, name: string) {
  await page.getByRole('button', { name }).first().click();
  await finishDialogue(page);
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

test('the campus district leads into the university, where Yuika is', async ({
  page,
}) => {
  test.setTimeout(180_000);
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await finishDialogue(page);

  // 先招募結華（她是大学生，平日白天在大学）。
  await jumpTo(page, 1, 16 * 60, 'shopping_street');
  await pick(page, '雨里有人抱着周边躲雨');
  await jumpTo(page, 3, 18 * 60 + 30, 'studio');
  await pick(page, '她第一次进录音间');
  expect((await getState(page)).idols.yuika?.status).toBe('recruited');

  // 周一 10:00：她在上课。
  await jumpTo(page, 8, 10 * 60, 'university_district');
  const before = await getState(page);

  await page.getByRole('button', { name: '进入 望丘大学' }).click();
  await expect(page.getByRole('button', { name: '回到望丘台' })).toBeVisible();
  await expect(page.locator('#city-map')).toHaveCount(0);

  // 进楼是 0 分钟：时间没有往前走。
  const after = await getState(page);
  expect(after.locationId).toBe('university');
  expect(after.clock.absoluteMinutes).toBe(before.clock.absoluteMinutes);

  // 她在这里：地点页能点进她的页面。
  await expect(page.getByRole('button', { name: /三峰結華/ }).first()).toBeVisible();

  expect(errors).toEqual([]);
});
