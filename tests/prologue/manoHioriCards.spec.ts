import { expect, test } from '@playwright/test';
import { getState, jumpTo, openGame, reset, watchConsole } from '../acceptance/helpers';

/**
 * 真乃与灯织的初始卡（各 5 章），在真实构建里按顺序触发。
 *
 * 一章 = 1 步 = 1 段对话；每章要求上一章的完成 flag，并且有最早天数。
 */

async function finishDialogue(page: import('@playwright/test').Page) {
  for (let index = 0; index < 200; index += 1) {
    if ((await page.locator('.dialogue-panel').count()) === 0) return;
    const choices = page.locator('.dialogue-choice');
    if ((await choices.count()) > 0) await choices.first().click();
    else await page.getByRole('button', { name: '继续' }).click();
    await page.waitForTimeout(12);
  }
  throw new Error('dialogue did not finish');
}

const chapters = [
  { idol: 'mano', day: 5, minute: 14 * 60, place: 'park', action: '公园里有鸽子在聚', flag: 'completed.mano.hover' },
  { idol: 'hiori', day: 6, minute: 11 * 60, place: 'station', action: '去面试会场的路上', flag: 'completed.hiori.smile' },
  { idol: 'mano', day: 7, minute: 14 * 60, place: 'shopping_street', action: '真乃在和谁说话', flag: 'completed.mano.plainclothes' },
  { idol: 'hiori', day: 8, minute: 21 * 60, place: 'practice_room', action: '练习室的灯还亮着', flag: 'completed.hiori.support' },
  { idol: 'mano', day: 9, minute: 19 * 60, place: 'office', action: '灯还亮着，她还在看照片', flag: 'completed.mano.growth' },
  { idol: 'hiori', day: 10, minute: 14 * 60, place: 'shopping_street', action: '她说要找和小饰物', flag: 'completed.hiori.gift' },
  { idol: 'mano', day: 12, minute: 16 * 60, place: 'home', action: '收工了，她还想再待一会儿', flag: 'completed.mano.afterglow' },
  { idol: 'hiori', day: 13, minute: 17 * 60, place: 'office', action: '采访结束了', flag: 'completed.hiori.answer' },
  { idol: 'mano', day: 15, minute: 18 * 60, place: 'park', action: '她在长椅上睡着了', flag: 'completed.mano.dream' },
  { idol: 'hiori', day: 16, minute: 18 * 60, place: 'studio', action: '演出结束了，她在喝水', flag: 'completed.hiori.ideal' },
];

test('Mano and Hiori initial cards: ten chapters in order', async ({ page }) => {
  test.setTimeout(300_000);
  const errors = watchConsole(page);

  await openGame(page);
  await reset(page, 1);
  await finishDialogue(page);

  // 真乃：公园两段
  await jumpTo(page, 1, 14 * 60, 'park');
  await page.getByRole('button', { name: '循着歌声' }).click();
  await finishDialogue(page);
  await jumpTo(page, 3, 14 * 60, 'park');
  await page.getByRole('button', { name: '再次听见歌声' }).click();
  await finishDialogue(page);

  // 灯织：练习室 → 事务所
  await jumpTo(page, 3, 11 * 60, 'practice_room');
  await page.getByRole('button', { name: '练习室里的人在数拍子' }).click();
  await finishDialogue(page);
  // 这一步在傍晚的时间窗（18:00–22:00）
  await jumpTo(page, 5, 19 * 60, 'office');
  await page.getByRole('button', { name: '她来事务所问了一句话' }).click();
  await finishDialogue(page);

  const state = await getState(page);
  expect(state.idols.mano?.status).toBe('recruited');
  expect(state.idols.hiori?.status).toBe('recruited');

  for (const [index, chapter] of chapters.entries()) {
    await jumpTo(page, chapter.day, chapter.minute, chapter.place);
    const button = page.getByRole('button', { name: chapter.action });
    await expect(button, `第 ${index + 1} 章「${chapter.action}」应出现`).toBeVisible();
    await button.click();
    await finishDialogue(page);

    const after = await getState(page);
    expect(after.flags[chapter.flag], `第 ${index + 1} 章应写 ${chapter.flag}`).toBe(true);
  }

  const done = await getState(page);
  for (const chapter of chapters) expect(done.flags[chapter.flag]).toBe(true);
  expect(errors).toEqual([]);
});
