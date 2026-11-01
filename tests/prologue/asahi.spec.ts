import { expect, test } from '@playwright/test';
import { getState, jumpTo, openGame, reset, watchConsole } from '../acceptance/helpers';
import { PRODUCTION_PACK } from '../../src/core/productionPack';

/**
 * あさひ：大屏下跳舞 → 第一次课；卡面三章；找有趣的事 / 话题 / 课后事件。
 */

const ASAHI = 'asahi';

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

test('Asahi: street dance, first lesson, card, exploring and an event', async ({
  page,
}) => {
  test.setTimeout(180_000);
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await finishDialogue(page);

  // ---- 第 1 步：大屏下面有人在跳（商业街） ----
  await jumpTo(page, 1, 14 * 60, 'shopping_street');
  await pick(page, '大屏下面有人在跳');
  expect((await getState(page)).idols[ASAHI]?.status).toBe('known');

  // ---- 第 2 步：第一次课（练习室，三分支） ----
  await jumpTo(page, 3, 15 * 60 + 30, 'practice_room');
  await pick(page, '她比上课时间早到了一个多小时');
  expect((await getState(page)).idols[ASAHI]?.status).toBe('recruited');

  // ---- 名册 / 日程表 ----
  await page.getByRole('button', { name: /偶像名册/ }).first().click();
  const roster = page.getByRole('dialog', { name: '偶像名册' });
  await expect(roster.locator('.roster-card', { hasText: '芹沢あさひ' })).toBeVisible();
  await page.getByRole('button', { name: '关闭偶像名册' }).click();

  await page.getByRole('button', { name: /日程表/ }).first().click();
  const schedule = page.getByRole('dialog', { name: '偶像日程表' });
  await expect(schedule.getByRole('tab', { name: /芹沢あさひ/ })).toBeVisible();
  await page.getByRole('button', { name: '关闭日程表' }).click();

  // ---- 卡面第一章：公园打听魔术师（三选项） ----
  await jumpTo(page, 4, 17 * 60, 'park');
  await pick(page, '她拦住路人问魔术师在哪');
  expect((await getState(page)).flags['completed.asahi.magician']).toBe(true);

  // ---- 卡面第二章：她从背后冒出来 ----
  await jumpTo(page, 7, 11 * 60, 'office');
  await pick(page, '她从背后冒出来');
  expect((await getState(page)).flags['completed.asahi.ambush']).toBe(true);

  // ---- 专属行动：陪她找有趣的事（周一傍晚公园） ----
  await jumpTo(page, 8, 18 * 60, 'park');
  await page.getByRole('button', { name: /芹沢あさひ/ }).first().click();
  const beforeExplore = await getState(page);
  const explore = page.getByRole('button', { name: '陪她找有趣的事' });
  await expect(explore).toBeVisible();
  await explore.click();
  await expect.poll(() => phase(page)).toBe('activityResult');

  const afterExplore = await getState(page);
  expect(beforeExplore.shared.stamina - afterExplore.shared.stamina).toBe(5);
  expect(
    afterExplore.idols[ASAHI]!.stats.trust.exp -
      beforeExplore.idols[ASAHI]!.stats.trust.exp,
  ).toBe(5);

  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 日常话题（7 条） ----
  const topics = PRODUCTION_PACK.actors.find((actor) => actor.id === ASAHI)!
    .topics;
  expect(topics).toHaveLength(7);
  const trustBeforeChat = (await getState(page)).idols[ASAHI]!.stats.trust.exp;
  await page.getByRole('button', { name: '聊两句' }).click();
  await expect.poll(() => phase(page)).toBe('npcResult');
  const said = (await getState(page)).lastResult ?? '';
  expect(topics.map((topic) => topic.text)).toContain(said);
  const afterChat = await getState(page);
  expect(afterChat.idols[ASAHI]!.stats.trust.exp - trustBeforeChat).toBe(1);
  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 卡面第三章：清晨的练习室 ----
  await jumpTo(page, 10, 13 * 60, 'practice_room');
  await pick(page, '清晨的练习室有人在呼吸');
  expect((await getState(page)).flags['completed.asahi.morning']).toBe(true);

  // ---- 课后事件：表现课之后 ----
  let fired = false;
  for (const [day, startMinute] of [
    [11, 16 * 60],
    [15, 15 * 60 + 45],
  ] as const) {
    await jumpTo(page, day, startMinute, 'practice_room');
    await page.getByRole('button', { name: /芹沢あさひ/ }).first().click();
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
    'evt.asahi.after_expression',
  );
  await page.getByRole('button', { name: /哪个不明白/ }).first().click();
  await expect.poll(() => phase(page)).toBe('eventResult');
  await page.getByRole('button', { name: '继续' }).click();
  await expect
    .poll(
      async () => (await getState(page)).flags['seen:evt.asahi.after_expression'],
    )
    .toBe(true);

  expect(errors).toEqual([]);
});
