import { expect, test } from '@playwright/test';
import { getState, jumpTo, openGame, reset, watchConsole } from '../acceptance/helpers';
import { PRODUCTION_PACK } from '../../src/core/productionPack';

/**
 * 千雪：街上缝袖扣 → 事务所答复 → 第一次挨拶。卡面三章、手工、话题、课后事件。
 */

const CHIYUKI = 'chiyuki';

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

async function phase(page: import('@playwright/test').Page) {
  return (await getState(page)).phase;
}

test('Chiyuki: sewing, answer, first greeting, card, craft and an event', async ({
  page,
}) => {
  test.setTimeout(180_000);
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await finishDialogue(page);

  // ---- 第 1 步：街上有人叫住你（商店街） ----
  await jumpTo(page, 1, 14 * 60, 'shopping_street');
  await pick(page, '有人叫住了你');
  expect((await getState(page)).idols[CHIYUKI]?.status).toBe('known');

  // ---- 第 2 步：她来给出答复（事务所） ----
  await jumpTo(page, 3, 11 * 60, 'office');
  await pick(page, '她来给出答复');
  expect((await getState(page)).idols[CHIYUKI]?.status).toBe('recruited');

  // ---- 第 3 步：第一次工作（录音棚，三分支） ----
  await jumpTo(page, 5, 14 * 60, 'studio');
  await pick(page, '第一次工作，挨拶まわり');
  expect((await getState(page)).storyChains['chiyuki-encounter']?.completed).toBe(
    true,
  );

  // ---- 名册 / 日程表 ----
  await page.getByRole('button', { name: /偶像名册/ }).first().click();
  const roster = page.getByRole('dialog', { name: '偶像名册' });
  await expect(roster.locator('.roster-card', { hasText: '桑山千雪' })).toBeVisible();
  await page.getByRole('button', { name: '关闭偶像名册' }).click();

  await page.getByRole('button', { name: /日程表/ }).first().click();
  const schedule = page.getByRole('dialog', { name: '偶像日程表' });
  await expect(schedule.getByRole('tab', { name: /桑山千雪/ })).toBeVisible();
  await page.getByRole('button', { name: '关闭日程表' }).click();

  // ---- 卡面第一章：杂货屋买马克杯 ----
  await jumpTo(page, 4, 16 * 60, 'shopping_street');
  await pick(page, '新开的杂货屋里都是小东西');
  expect((await getState(page)).flags['completed.chiyuki.mug']).toBe(true);

  // ---- 卡面第二章：牛丼（三选项） ----
  await jumpTo(page, 7, 19 * 60, 'station');
  await pick(page, '收工很晚，她说想吃牛丼');
  expect((await getState(page)).flags['completed.chiyuki.gyudon']).toBe(true);

  // ---- 专属行动：陪她做手工（宿舍，周一傍晚） ----
  await jumpTo(page, 8, 19 * 60, 'dorm');
  await page.getByRole('button', { name: /桑山千雪/ }).first().click();
  const beforeCraft = await getState(page);
  const craft = page.getByRole('button', { name: '陪她做手工' });
  await expect(craft).toBeVisible();
  await craft.click();
  await expect.poll(() => phase(page)).toBe('activityResult');

  const afterCraft = await getState(page);
  expect(beforeCraft.shared.stamina - afterCraft.shared.stamina).toBe(4);
  expect(
    afterCraft.idols[CHIYUKI]!.stats.trust.exp -
      beforeCraft.idols[CHIYUKI]!.stats.trust.exp,
  ).toBe(5);

  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 日常话题（7 条） ----
  const topics = PRODUCTION_PACK.actors.find((actor) => actor.id === CHIYUKI)!
    .topics;
  expect(topics).toHaveLength(7);
  const trustBeforeChat = (await getState(page)).idols[CHIYUKI]!.stats.trust.exp;
  await page.getByRole('button', { name: '聊两句' }).click();
  await expect.poll(() => phase(page)).toBe('npcResult');
  const said = (await getState(page)).lastResult ?? '';
  expect(topics.map((topic) => topic.text)).toContain(said);
  const afterChat = await getState(page);
  expect(afterChat.idols[CHIYUKI]!.stats.trust.exp - trustBeforeChat).toBe(1);
  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 卡面第三章：半价促销 ----
  await jumpTo(page, 10, 18 * 60, 'shopping_street');
  await pick(page, '那家杂货屋打半价了');
  expect((await getState(page)).flags['completed.chiyuki.sale']).toBe(true);

  // ---- 课后事件：表现课之后 ----
  let fired = false;
  for (const [day, startMinute] of [
    [11, 13 * 60 + 30],
    [15, 10 * 60 + 30],
  ] as const) {
    await jumpTo(page, day, startMinute, 'practice_room');
    await page.getByRole('button', { name: /桑山千雪/ }).first().click();
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
    'evt.chiyuki.after_expression',
  );
  await page.getByRole('button', { name: /刚才那样很好/ }).first().click();
  await expect.poll(() => phase(page)).toBe('eventResult');
  await page.getByRole('button', { name: '继续' }).click();
  await expect
    .poll(
      async () =>
        (await getState(page)).flags['seen:evt.chiyuki.after_expression'],
    )
    .toBe(true);

  expect(errors).toEqual([]);
});
