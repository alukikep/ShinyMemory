import { expect, test } from '@playwright/test';
import {
  getState,
  jumpTo,
  openGame,
  reset,
  watchConsole,
} from '../acceptance/helpers';
import { PRODUCTION_PACK } from '../../src/core/productionPack';

/**
 * にちか：唱片店后台 → 屋顶；卡面五章；唱片店行动 / 话题 / 课后事件。
 * 这条 spec 同时是新地点（record_shop / office_roof）的入口回归。
 */

const NICHIKA = 'nichika';

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

test('Nichika: record shop, roof; five card chapters, records and an event', async ({
  page,
}) => {
  test.setTimeout(240_000);
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await finishDialogue(page);

  // ---- 第 1 步：唱片店后台 ----
  await jumpTo(page, 1, 15 * 60, 'record_shop');
  await pick(page, '店员说经理在后场叫你');
  expect((await getState(page)).idols[NICHIKA]?.status).toBe('known');

  // ---- 第 2 步：屋顶大喊 ----
  await jumpTo(page, 2, 17 * 60, 'office_roof');
  await pick(page, '屋顶上有个人在喊');
  expect((await getState(page)).idols[NICHIKA]?.status).toBe('recruited');

  // ---- 名册 / 日程表 ----
  await page.getByRole('button', { name: /偶像名册/ }).first().click();
  const roster = page.getByRole('dialog', { name: '偶像名册' });
  await expect(
    roster.locator('.roster-card', { hasText: '七草にちか' }),
  ).toBeVisible();
  await page.getByRole('button', { name: '关闭偶像名册' }).click();

  await page.getByRole('button', { name: /日程表/ }).first().click();
  const schedule = page.getByRole('dialog', { name: '偶像日程表' });
  await expect(schedule.getByRole('tab', { name: /七草にちか/ })).toBeVisible();
  await page.getByRole('button', { name: '关闭日程表' }).click();

  // ---- 卡面第一章：禁区（三分支） ----
  await jumpTo(page, 4, 17 * 60, 'office');
  await pick(page, '她在地板上练步子');
  expect((await getState(page)).flags['completed.nichika.noentry']).toBe(true);

  // ---- 卡面第二章：没来陪的课（三分支） ----
  await jumpTo(page, 7, 19 * 60, 'practice_room');
  await pick(page, '课结束了，她一个人收东西');
  expect((await getState(page)).flags['completed.nichika.alone']).toBe(true);

  // ---- 卡面第三章：唱片店的三条消息（线性） ----
  await jumpTo(page, 10, 17 * 60, 'record_shop');
  await pick(page, '手机连着三条『来一下』');
  expect((await getState(page)).flags['completed.nichika.call']).toBe(true);

  // ---- 卡面第四章：冰箱上的名字（三分支） ----
  await jumpTo(page, 13, 17 * 60, 'office');
  await pick(page, '她在冰箱前拿着油性笔');
  expect((await getState(page)).flags['completed.nichika.rabbit']).toBe(true);

  // ---- 卡面第五章：傍晚的屋顶（线性） ----
  await jumpTo(page, 16, 17 * 60, 'office_roof');
  await pick(page, '傍晚，她趴在屋顶的围栏上');
  expect((await getState(page)).flags['completed.nichika.house']).toBe(true);

  // ---- 专属行动：唱片店翻新碟（周一傍晚） ----
  await jumpTo(page, 22, 17 * 60, 'record_shop');
  await page.getByRole('button', { name: /七草にちか/ }).first().click();
  const beforeRecords = await getState(page);
  const records = page.getByRole('button', { name: '陪她在唱片店翻新碟' });
  await expect(records).toBeVisible();
  await records.click();
  await expect.poll(() => phase(page)).toBe('activityResult');

  const afterRecords = await getState(page);
  expect(beforeRecords.shared.stamina - afterRecords.shared.stamina).toBe(5);
  expect(
    afterRecords.idols[NICHIKA]!.stats.trust.exp -
      beforeRecords.idols[NICHIKA]!.stats.trust.exp,
  ).toBe(5);

  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 日常话题（8 条） ----
  const topics = PRODUCTION_PACK.actors.find(
    (actor) => actor.id === NICHIKA,
  )!.topics;
  expect(topics).toHaveLength(8);
  const trustBeforeChat = (await getState(page)).idols[NICHIKA]!.stats.trust.exp;
  await page.getByRole('button', { name: '聊两句' }).click();
  await expect.poll(() => phase(page)).toBe('npcResult');
  const said = (await getState(page)).lastResult ?? '';
  expect(topics.map((topic) => topic.text)).toContain(said);
  const afterChat = await getState(page);
  expect(afterChat.idols[NICHIKA]!.stats.trust.exp - trustBeforeChat).toBe(1);
  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 课后事件：表现课之后（她得在练习室） ----
  let fired = false;
  for (const [day, startMinute] of [
    [23, 17 * 60], // 周二：练习室
    [24, 19 * 60], // 周三：练习室
    [26, 19 * 60], // 周五：练习室
  ] as const) {
    await jumpTo(page, day, startMinute, 'practice_room');
    await page.getByRole('button', { name: /七草にちか/ }).first().click();
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
    'evt.nichika.after_expression',
  );
  await page.getByRole('button', { name: /看不出来。/ }).first().click();
  await expect.poll(() => phase(page)).toBe('eventResult');
  await page.getByRole('button', { name: '继续' }).click();
  await expect
    .poll(
      async () =>
        (await getState(page)).flags['seen:evt.nichika.after_expression'],
    )
    .toBe(true);

  expect(errors).toEqual([]);
});
