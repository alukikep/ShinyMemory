import { expect, test } from '@playwright/test';
import { getState, jumpTo, openGame, reset, watchConsole } from '../acceptance/helpers';
import { PRODUCTION_PACK } from '../../src/core/productionPack';

/**
 * 智代子：档案型（甄选时已见过）→ 事务所认出 → 练习室 → 卡面三章
 *         → 甜品巡礼/话题/课后事件。
 */

const CHIYOKO = 'chiyoko';

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

test('Chiyoko: known from the audition, recruit, card, sweets, topic and event', async ({
  page,
}) => {
  test.setTimeout(180_000);
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await finishDialogue(page);

  // ---- 档案型：第一天名册里就该有她（还没招募） ----
  expect((await getState(page)).idols[CHIYOKO]?.status).toBe('known');
  await page.getByRole('button', { name: /偶像名册/ }).first().click();
  const rosterBefore = page.getByRole('dialog', { name: '偶像名册' });
  await expect(
    rosterBefore.locator('.roster-card', { hasText: '園田智代子' }),
  ).toBeVisible();
  await page.getByRole('button', { name: '关闭偶像名册' }).click();

  // ---- 招募：事务所里认出她 ----
  await jumpTo(page, 1, 10 * 60, 'office');
  await pick(page, '事务所里有个眼熟的女孩子');
  expect((await getState(page)).idols[CHIYOKO]?.status).toBe('known');

  // ---- 招募：练习室的巧克力段子（原三分支，选第一个） ----
  await jumpTo(page, 3, 15 * 60 + 30, 'practice_room');
  await pick(page, '练习室里有人在练巧克力段子');
  expect((await getState(page)).idols[CHIYOKO]?.status).toBe('recruited');

  // ---- 日程表：招募后能看到她 ----
  await page.getByRole('button', { name: /日程表/ }).first().click();
  const schedule = page.getByRole('dialog', { name: '偶像日程表' });
  await expect(schedule.getByRole('tab', { name: /園田智代子/ })).toBeVisible();
  await page.getByRole('button', { name: '关闭日程表' }).click();

  // ---- 卡面第一章：甜品店里有人在拍照 ----
  await jumpTo(page, 4, 17 * 60, 'shopping_street');
  await pick(page, '甜品店里有人在拍照');
  expect((await getState(page)).flags['completed.chiyoko.sweets']).toBe(true);

  // ---- 卡面第二章：拍摄结束后的喫茶店（三选项，选第一个） ----
  await jumpTo(page, 7, 17 * 60, 'station');
  await page.getByRole('button', { name: '拍摄结束后的喫茶店' }).first().click();
  for (let index = 0; index < 120; index += 1) {
    if ((await page.locator('.dialogue-panel').count()) === 0) break;
    const choice = page.getByRole('button', { name: '我觉得不错。' });
    if ((await choice.count()) > 0) await choice.first().click();
    else await page.getByRole('button', { name: '继续' }).click();
    await page.waitForTimeout(10);
  }
  expect((await getState(page)).flags['completed.chiyoko.piano']).toBe(true);

  // ---- 专属行动：陪她甜品巡礼（周二傍晚她在商店街） ----
  await jumpTo(page, 9, 17 * 60 + 45, 'shopping_street');
  await page.getByRole('button', { name: /園田智代子/ }).first().click();
  const beforeSweets = await getState(page);
  const sweets = page.getByRole('button', { name: '陪她甜品巡礼' });
  await expect(sweets).toBeVisible();
  await sweets.click();
  await expect.poll(() => phase(page)).toBe('activityResult');

  const afterSweets = await getState(page);
  expect(beforeSweets.shared.stamina - afterSweets.shared.stamina).toBe(7);
  expect(
    afterSweets.idols[CHIYOKO]!.stats.trust.exp -
      beforeSweets.idols[CHIYOKO]!.stats.trust.exp,
  ).toBe(5);

  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 日常话题（7 条） ----
  const topics = PRODUCTION_PACK.actors.find((actor) => actor.id === CHIYOKO)!
    .topics;
  expect(topics).toHaveLength(7);
  const trustBeforeChat = (await getState(page)).idols[CHIYOKO]!.stats.trust.exp;
  await page.getByRole('button', { name: '聊两句' }).click();
  await expect.poll(() => phase(page)).toBe('npcResult');
  const said = (await getState(page)).lastResult ?? '';
  expect(topics.map((topic) => topic.text)).toContain(said);
  const afterChat = await getState(page);
  expect(afterChat.idols[CHIYOKO]!.stats.trust.exp - trustBeforeChat).toBe(1);
  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 卡面第三章：收工后她叫住我 ----
  await jumpTo(page, 10, 18 * 60, 'office');
  await pick(page, '收工后她叫住我');
  expect((await getState(page)).flags['completed.chiyoko.gift']).toBe(true);

  // ---- 课后事件：声乐课之后（她周四傍晚与周一下午在练习室） ----
  let fired = false;
  for (const [day, startMinute] of [
    [11, 17 * 60 + 30],
    [15, 15 * 60 + 45],
  ] as const) {
    await jumpTo(page, day, startMinute, 'practice_room');
    await page.getByRole('button', { name: /園田智代子/ }).first().click();
    for (let attempt = 0; attempt < 4 && !fired; attempt += 1) {
      const vocal = page.getByRole('button', { name: '声乐课' });
      if ((await vocal.count()) === 0) break;
      await vocal.click();
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
  expect((await getState(page)).pendingEventId).toBe('evt.chiyoko.after_vocal');
  await page.getByRole('button', { name: /唱得很好/ }).click();
  await expect.poll(() => phase(page)).toBe('eventResult');
  await page.getByRole('button', { name: '继续' }).click();
  await expect
    .poll(async () => (await getState(page)).flags['seen:evt.chiyoko.after_vocal'])
    .toBe(true);

  expect(errors).toEqual([]);
});
