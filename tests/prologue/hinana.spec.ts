import { expect, test } from '@playwright/test';
import { getState, jumpTo, openGame, reset, watchConsole } from '../acceptance/helpers';
import { PRODUCTION_PACK } from '../../src/core/productionPack';

/**
 * 雛菜：面试 → 看课；卡面五章；吃甜的 / 话题 / 课后事件。
 */

const HINANA = 'hinana';

async function finishDialogue(page: import('@playwright/test').Page) {
  for (let index = 0; index < 400; index += 1) {
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

test('Hinana: interview, lesson; five card chapters, sweets and an event', async ({
  page,
}) => {
  test.setTimeout(240_000);
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await finishDialogue(page);

  // ---- 第 1 步：面试 ----
  await jumpTo(page, 1, 15 * 60, 'office');
  await pick(page, '面试室的门被很响地推开');
  expect((await getState(page)).idols[HINANA]?.status).toBe('known');

  // ---- 第 2 步：第一次去看她的课（三分支） ----
  await jumpTo(page, 3, 17 * 60, 'practice_room');
  await pick(page, '第一次去看她的课');
  expect((await getState(page)).idols[HINANA]?.status).toBe('recruited');

  // ---- 名册 / 日程表 ----
  await page.getByRole('button', { name: /偶像名册/ }).first().click();
  const roster = page.getByRole('dialog', { name: '偶像名册' });
  await expect(roster.locator('.roster-card', { hasText: '市川雛菜' })).toBeVisible();
  await page.getByRole('button', { name: '关闭偶像名册' }).click();

  await page.getByRole('button', { name: /日程表/ }).first().click();
  const schedule = page.getByRole('dialog', { name: '偶像日程表' });
  await expect(schedule.getByRole('tab', { name: /市川雛菜/ })).toBeVisible();
  await page.getByRole('button', { name: '关闭日程表' }).click();

  // ---- 卡面第一章：折纸（三分支） ----
  await jumpTo(page, 4, 17 * 60, 'office');
  await pick(page, '她低着头折着什么');
  expect((await getState(page)).flags['completed.hinana.origami']).toBe(true);

  // ---- 卡面第二章：站台的果汁（线性） ----
  await jumpTo(page, 7, 15 * 60, 'station');
  await pick(page, '站台等电车，她说想喝果汁');
  expect((await getState(page)).flags['completed.hinana.juice']).toBe(true);

  // ---- 卡面第三章：三条消息（三分支） ----
  await jumpTo(page, 10, 17 * 60, 'office');
  await pick(page, '手机上连着三条消息');
  expect((await getState(page)).flags['completed.hinana.paper']).toBe(true);

  // ---- 卡面第四章：杂志采访（三分支） ----
  await jumpTo(page, 13, 15 * 60, 'studio');
  await pick(page, '杂志拍摄之后的采访');
  expect((await getState(page)).flags['completed.hinana.interview']).toBe(true);

  // ---- 卡面第五章：马卡龙（线性） ----
  await jumpTo(page, 16, 16 * 60, 'station');
  await pick(page, '喫茶店的桌子被点心占满');
  expect((await getState(page)).flags['completed.hinana.macaron']).toBe(true);

  // ---- 专属行动：陪她吃甜的（周二傍晚，商店街） ----
  await jumpTo(page, 23, 17 * 60, 'shopping_street');
  await page.getByRole('button', { name: /市川雛菜/ }).first().click();
  const beforeSweets = await getState(page);
  const sweets = page.getByRole('button', { name: '陪她吃甜的' });
  await expect(sweets).toBeVisible();
  await sweets.click();
  await expect.poll(() => phase(page)).toBe('activityResult');

  const afterSweets = await getState(page);
  expect(beforeSweets.shared.stamina - afterSweets.shared.stamina).toBe(5);
  expect(
    afterSweets.idols[HINANA]!.stats.trust.exp -
      beforeSweets.idols[HINANA]!.stats.trust.exp,
  ).toBe(5);

  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 日常话题（8 条） ----
  const topics = PRODUCTION_PACK.actors.find((actor) => actor.id === HINANA)!
    .topics;
  expect(topics).toHaveLength(8);
  const trustBeforeChat = (await getState(page)).idols[HINANA]!.stats.trust.exp;
  await page.getByRole('button', { name: '聊两句' }).click();
  await expect.poll(() => phase(page)).toBe('npcResult');
  const said = (await getState(page)).lastResult ?? '';
  expect(topics.map((topic) => topic.text)).toContain(said);
  const afterChat = await getState(page);
  expect(afterChat.idols[HINANA]!.stats.trust.exp - trustBeforeChat).toBe(1);
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
    await page.getByRole('button', { name: /市川雛菜/ }).first().click();
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
    'evt.hinana.after_expression',
  );
  await page.getByRole('button', { name: /最后一个最好。/ }).first().click();
  await expect.poll(() => phase(page)).toBe('eventResult');
  await page.getByRole('button', { name: '继续' }).click();
  await expect
    .poll(
      async () =>
        (await getState(page)).flags['seen:evt.hinana.after_expression'],
    )
    .toBe(true);

  expect(errors).toEqual([]);
});
