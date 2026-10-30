import { expect, test } from '@playwright/test';
import { getState, jumpTo, openGame, reset, watchConsole } from '../acceptance/helpers';

/**
 * 卡面章「泳装的颜色」：四步、cadence 2、工作面板挡剧情日。
 * 素材：巡【夏に恋するピチカート！】。
 */

async function finishDialogue(page: import('@playwright/test').Page) {
  for (let index = 0; index < 90; index += 1) {
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

test('Meguru card chapter: four steps on a two-day cadence', async ({ page }) => {
  // 这一章的 4 段对话在审查台待审；通过之前游戏里没有它们，跳过。
  test.skip(
    process.env.CARD_CHAPTER_APPROVED !== '1',
    '卡面章对话尚未通过审查（通过后设 CARD_CHAPTER_APPROVED=1 再跑）',
  );
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await finishDialogue(page);

  // 招募巡（公园 → 事务所）
  await jumpTo(page, 1, 14 * 60, 'park');
  await page.getByRole('button', { name: '球场上有人在喊' }).click();
  await finishDialogue(page);
  await jumpTo(page, 3, 10 * 60, 'office');
  await page.getByRole('button', { name: '她提前来了' }).click();
  await finishDialogue(page);
  expect((await getState(page)).idols.meguru?.status).toBe('recruited');

  // 第 5 天：第一步
  await jumpTo(page, 5, 12 * 60, 'shopping_street');
  await page.getByRole('button', { name: '杂志那边约了新人特集' }).click();
  await finishDialogue(page);

  // 第 6 天：节奏 2，第二步还没到
  await jumpTo(page, 6, 12 * 60, 'shopping_street');
  await expect(
    page.getByRole('button', { name: '去看看泳装' }),
  ).toHaveCount(0);

  // 第 7 天：第二步可触发
  await jumpTo(page, 7, 12 * 60, 'shopping_street');
  await page.getByRole('button', { name: '去看看泳装' }).click();
  await finishDialogue(page);

  // 第 9 天：第三步（含三选一），挑「试试搭配吧」
  await jumpTo(page, 9, 12 * 60, 'shopping_street');
  await page.getByRole('button', { name: '她挑不出来了' }).click();
  for (let index = 0; index < 30; index += 1) {
    const choice = page.getByRole('button', { name: /试试搭配吧/ });
    if ((await choice.count()) > 0) {
      await choice.first().click();
      break;
    }
    await page.getByRole('button', { name: '继续' }).click();
    await page.waitForTimeout(20);
  }
  await finishDialogue(page);

  // 锚点句必须真的出现在这一章里
  await jumpTo(page, 11, 12 * 60, 'shopping_street');
  await page.getByRole('button', { name: '从店里出来' }).click();
  await finishDialogue(page);

  const state = await getState(page);
  expect(state.flags['completed.meguru.swimsuit']).toBe(true);
  expect(errors).toEqual([]);
});
