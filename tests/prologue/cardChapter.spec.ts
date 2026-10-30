import { expect, test } from '@playwright/test';
import { getState, jumpTo, openGame, reset, watchConsole } from '../acceptance/helpers';

/**
 * 巡的卡面五章，按真实结构串跑一遍。
 *
 * 一章 = 1 步 = 1 段对话（选项在对话内部，选完各自演到章末）。
 * 顺序：商业街 → 泳池 → 练习室 → 事务所 → 公园，各自有最早天数。
 */

async function finishDialogue(page: import('@playwright/test').Page) {
  for (let index = 0; index < 120; index += 1) {
    if ((await page.locator('.dialogue-panel').count()) === 0) return;
    const choices = page.locator('.dialogue-choice');
    if ((await choices.count()) > 0) {
      await choices.first().click();
    } else {
      await page.getByRole('button', { name: '继续' }).click();
    }
    await page.waitForTimeout(15);
  }
  throw new Error('dialogue did not finish');
}

test('Meguru card chapters: five sittings in order', async ({ page }) => {
  test.setTimeout(120_000);
  const errors = watchConsole(page);

  await openGame(page);
  await reset(page, 1);
  await finishDialogue(page);

  // 招募巡
  await jumpTo(page, 1, 14 * 60, 'park');
  await page.getByRole('button', { name: '球场上有人在喊' }).click();
  await finishDialogue(page);
  await jumpTo(page, 3, 10 * 60, 'office');
  await page.getByRole('button', { name: '她提前来了' }).click();
  await finishDialogue(page);
  expect((await getState(page)).idols.meguru?.status).toBe('recruited');

  const chapters = [
    { day: 5, minute: 12 * 60, place: 'shopping_street', action: '杂志那边约了新人特集', flag: 'completed.meguru.swimsuit' },
    { day: 8, minute: 12 * 60, place: 'pool', action: '拍摄结束了', flag: 'completed.meguru.sunshine' },
    { day: 12, minute: 10 * 60, place: 'practice_room', action: '她比集合时间早到', flag: 'completed.meguru.purity' },
    { day: 14, minute: 19 * 60, place: 'office', action: '有人把你叫醒', flag: 'completed.meguru.coffee' },
    { day: 16, minute: 20 * 60, place: 'park', action: '她抬头看星星', flag: 'completed.meguru.stars' },
  ];

  for (const [index, chapter] of chapters.entries()) {
    await jumpTo(page, chapter.day, chapter.minute, chapter.place);
    await page.getByRole('button', { name: chapter.action }).click();
    await finishDialogue(page);

    const state = await getState(page);
    expect(
      state.flags[chapter.flag],
      `第 ${index + 1} 章应写入 ${chapter.flag}`,
    ).toBe(true);
  }

  const done = await getState(page);
  for (const chapter of chapters) {
    expect(done.flags[chapter.flag]).toBe(true);
  }
  expect(errors).toEqual([]);
});
