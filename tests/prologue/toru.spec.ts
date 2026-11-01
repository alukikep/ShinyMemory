import { expect, test } from '@playwright/test';
import { getState, jumpTo, openGame, reset, watchConsole } from '../acceptance/helpers';
import { PRODUCTION_PACK } from '../../src/core/productionPack';

/**
 * 透：站前搭话 → 事务所签约；卡面五章；看天 / 话题 / 课后事件。
 */

const TORU = 'toru';

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

test('Toru: bus stop, contract, five card chapters, sky and an event', async ({
  page,
}) => {
  test.setTimeout(180_000);
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await finishDialogue(page);

  // ---- 第 1 步：站前，她看着公交站牌 ----
  await jumpTo(page, 1, 17 * 60, 'station');
  await pick(page, '站前，一个女生看着公交站牌');
  expect((await getState(page)).idols[TORU]?.status).toBe('known');

  // ---- 第 2 步：事务所签约（线性） ----
  await jumpTo(page, 3, 18 * 60, 'office');
  await pick(page, '契约书摊在事务所的桌上');
  expect((await getState(page)).idols[TORU]?.status).toBe('recruited');

  // ---- 名册 / 日程表 ----
  await page.getByRole('button', { name: /偶像名册/ }).first().click();
  const roster = page.getByRole('dialog', { name: '偶像名册' });
  await expect(roster.locator('.roster-card', { hasText: '浅倉透' })).toBeVisible();
  await page.getByRole('button', { name: '关闭偶像名册' }).click();

  await page.getByRole('button', { name: /日程表/ }).first().click();
  const schedule = page.getByRole('dialog', { name: '偶像日程表' });
  await expect(schedule.getByRole('tab', { name: /浅倉透/ })).toBeVisible();
  await page.getByRole('button', { name: '关闭日程表' }).click();

  // ---- 卡面第一章：事务所问卷（三分支） ----
  await jumpTo(page, 4, 20 * 60, 'office');
  await pick(page, '她对着问卷想了很久');
  expect((await getState(page)).flags['completed.toru.questionnaire']).toBe(true);

  // ---- 卡面第二章：夜里的公交（线性） ----
  await jumpTo(page, 7, 19 * 60, 'station');
  await pick(page, '回程的公交上，她睡着了');
  expect((await getState(page)).flags['completed.toru.bus']).toBe(true);

  // ---- 卡面第三章：练习室的电影（三分支） ----
  await jumpTo(page, 10, 17 * 60, 'practice_room');
  await pick(page, '她坐在角落看手机里的电影');
  expect((await getState(page)).flags['completed.toru.movie']).toBe(true);

  // ---- 卡面第四章：食堂「这里就 AA 吧」（三分支） ----
  await jumpTo(page, 13, 19 * 60, 'station');
  await pick(page, '她盯着账单不动');
  expect((await getState(page)).flags['completed.toru.wari']).toBe(true);

  // ---- 卡面第五章：公园的星星（线性） ----
  await jumpTo(page, 16, 17 * 60, 'park');
  await pick(page, '傍晚的公园，她仰着头');
  expect((await getState(page)).flags['completed.toru.star']).toBe(true);

  // ---- 专属行动：陪她在公园看天（周四傍晚，她绕公园） ----
  await jumpTo(page, 18, 16 * 60 + 45, 'park');
  await page.getByRole('button', { name: /浅倉透/ }).first().click();
  const beforeSky = await getState(page);
  const sky = page.getByRole('button', { name: '陪她在公园看天' });
  await expect(sky).toBeVisible();
  await sky.click();
  await expect.poll(() => phase(page)).toBe('activityResult');

  const afterSky = await getState(page);
  expect(beforeSky.shared.stamina - afterSky.shared.stamina).toBe(5);
  expect(
    afterSky.idols[TORU]!.stats.trust.exp - beforeSky.idols[TORU]!.stats.trust.exp,
  ).toBe(5);

  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 日常话题（8 条） ----
  const topics = PRODUCTION_PACK.actors.find((actor) => actor.id === TORU)!
    .topics;
  expect(topics).toHaveLength(8);
  const trustBeforeChat = (await getState(page)).idols[TORU]!.stats.trust.exp;
  await page.getByRole('button', { name: '聊两句' }).click();
  await expect.poll(() => phase(page)).toBe('npcResult');
  const said = (await getState(page)).lastResult ?? '';
  expect(topics.map((topic) => topic.text)).toContain(said);
  const afterChat = await getState(page);
  expect(afterChat.idols[TORU]!.stats.trust.exp - trustBeforeChat).toBe(1);
  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 课后事件：表现课之后（她得在练习室） ----
  let fired = false;
  for (const [day, startMinute] of [
    [18, 18 * 60 + 45], // 周四傍晚：练习室
    [19, 17 * 60], // 周五：练习室
    [22, 17 * 60], // 周一：练习室
  ] as const) {
    await jumpTo(page, day, startMinute, 'practice_room');
    await page.getByRole('button', { name: /浅倉透/ }).first().click();
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
  expect((await getState(page)).pendingEventId).toBe('evt.toru.after_expression');
  await page.getByRole('button', { name: /看出什么了？/ }).first().click();
  await expect.poll(() => phase(page)).toBe('eventResult');
  await page.getByRole('button', { name: '继续' }).click();
  await expect
    .poll(async () => (await getState(page)).flags['seen:evt.toru.after_expression'])
    .toBe(true);

  expect(errors).toEqual([]);
});
