import { expect, test } from '@playwright/test';
import { getState, jumpTo, openGame, reset, watchConsole } from '../acceptance/helpers';
import { PRODUCTION_PACK } from '../../src/core/productionPack';

/**
 * 小糸：面试 → 交文件；卡面五章；咖啡店复习 / 话题 / 课后事件。
 */

const KOITO = 'koito';

async function finishDialogue(page: import('@playwright/test').Page) {
  for (let index = 0; index < 300; index += 1) {
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

async function phase(page: import('@playwright/test').Page) {
  return (await getState(page)).phase;
}

test('Koito: interview, papers; five card chapters, study and an event', async ({
  page,
}) => {
  test.setTimeout(240_000);
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await finishDialogue(page);

  // ---- 第 1 步：面试 ----
  await jumpTo(page, 1, 15 * 60, 'office');
  await pick(page, '面试室的椅子上坐得笔直');
  expect((await getState(page)).idols[KOITO]?.status).toBe('known');

  // ---- 第 2 步：交文件（三分支） ----
  await jumpTo(page, 3, 16 * 60, 'office');
  await pick(page, '她抱着一叠文件站在门口');
  expect((await getState(page)).idols[KOITO]?.status).toBe('recruited');

  // ---- 名册 / 日程表 ----
  await page.getByRole('button', { name: /偶像名册/ }).first().click();
  const roster = page.getByRole('dialog', { name: '偶像名册' });
  await expect(roster.locator('.roster-card', { hasText: '福丸小糸' })).toBeVisible();
  await page.getByRole('button', { name: '关闭偶像名册' }).click();

  await page.getByRole('button', { name: /日程表/ }).first().click();
  const schedule = page.getByRole('dialog', { name: '偶像日程表' });
  await expect(schedule.getByRole('tab', { name: /福丸小糸/ })).toBeVisible();
  await page.getByRole('button', { name: '关闭日程表' }).click();

  // ---- 卡面第一章：写作业（三分支） ----
  await jumpTo(page, 4, 17 * 60, 'office');
  await pick(page, '她趴在桌上写作业');
  expect((await getState(page)).flags['completed.koito.homework']).toBe(true);

  // ---- 卡面第二章：清早送她上学（三分支） ----
  await jumpTo(page, 7, 7 * 60, 'office');
  await pick(page, '清早，事务所的门还没开');
  expect((await getState(page)).flags['completed.koito.notebook']).toBe(true);

  // ---- 卡面第三章：落选（三分支） ----
  await jumpTo(page, 10, 16 * 60, 'office');
  await pick(page, '她低着头走进事务所');
  expect((await getState(page)).flags['completed.koito.fail']).toBe(true);

  // ---- 卡面第四章：公园（线性） ----
  await jumpTo(page, 13, 17 * 60, 'park');
  await pick(page, '傍晚的公园，她站在游乐设施前');
  expect((await getState(page)).flags['completed.koito.park']).toBe(true);

  // ---- 卡面第五章：摄影棚（线性） ----
  await jumpTo(page, 16, 10 * 60, 'studio');
  await pick(page, '第一次进摄影棚');
  expect((await getState(page)).flags['completed.koito.studio']).toBe(true);

  // ---- 专属行动：咖啡店复习（周二傍晚，商店街） ----
  await jumpTo(page, 23, 17 * 60, 'shopping_street');
  await page.getByRole('button', { name: /福丸小糸/ }).first().click();
  const beforeStudy = await getState(page);
  const study = page.getByRole('button', { name: '陪她在咖啡店复习' });
  await expect(study).toBeVisible();
  await study.click();
  await expect.poll(() => phase(page)).toBe('activityResult');

  const afterStudy = await getState(page);
  expect(beforeStudy.shared.stamina - afterStudy.shared.stamina).toBe(5);
  expect(
    afterStudy.idols[KOITO]!.stats.trust.exp -
      beforeStudy.idols[KOITO]!.stats.trust.exp,
  ).toBe(5);

  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 日常话题（8 条） ----
  const topics = PRODUCTION_PACK.actors.find((actor) => actor.id === KOITO)!
    .topics;
  expect(topics).toHaveLength(8);
  const trustBeforeChat = (await getState(page)).idols[KOITO]!.stats.trust.exp;
  await page.getByRole('button', { name: '聊两句' }).click();
  await expect.poll(() => phase(page)).toBe('npcResult');
  const said = (await getState(page)).lastResult ?? '';
  expect(topics.map((topic) => topic.text)).toContain(said);
  const afterChat = await getState(page);
  expect(afterChat.idols[KOITO]!.stats.trust.exp - trustBeforeChat).toBe(1);
  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 课后事件：表现课之后（她得在练习室） ----
  let fired = false;
  for (const [day, startMinute] of [
    [24, 17 * 60], // 周三：练习室
    [25, 19 * 60], // 周四：练习室
    [27, 14 * 60], // 周六：练习室
  ] as const) {
    await jumpTo(page, day, startMinute, 'practice_room');
    await page.getByRole('button', { name: /福丸小糸/ }).first().click();
    for (let attempt = 0; attempt < 4 && !fired; attempt += 1) {
      const lesson = page.getByRole('button', { name: '表现课' });
      if ((await lesson.count()) === 0) break;
      await lesson.click();
      await expect.poll(() => phase(page)).toBe('activityResult');
      await page.getByRole('button', { name: '继续' }).click();
      await expect
        .poll(async () =>
          ['event', 'idol', 'plan'].includes((await getState(page)).phase),
        )
        .toBe(true);
      fired = (await getState(page)).phase === 'event';
      if (fired) break;
      if ((await getState(page)).phase !== 'idol') break;
    }
    if (fired) break;
  }

  expect(fired).toBe(true);
  expect((await getState(page)).pendingEventId).toBe(
    'evt.koito.after_expression',
  );
  await page.getByRole('button', { name: /第三次，很好。/ }).first().click();
  await expect.poll(() => phase(page)).toBe('eventResult');
  await page.getByRole('button', { name: '继续' }).click();
  await expect
    .poll(async () => (await getState(page)).flags['seen:evt.koito.after_expression'])
    .toBe(true);

  expect(errors).toEqual([]);
});
