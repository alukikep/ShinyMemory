import { expect, test } from '@playwright/test';
import { getState, jumpTo, openGame, reset, watchConsole } from '../acceptance/helpers';
import { PRODUCTION_PACK } from '../../src/core/productionPack';

/**
 * 恋鐘：事务所面试 → 录音棚第一天 → 卡面三章 → 做饭/话题/课后事件。
 */

const KOGANE = 'kogane';

async function finishDialogue(page: import('@playwright/test').Page) {
  for (let index = 0; index < 160; index += 1) {
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

test('Kogane: recruit, card, cooking, topic and a post-lesson event', async ({
  page,
}) => {
  test.setTimeout(180_000);
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await finishDialogue(page);

  // ---- 招募：事务所面试 ----
  await jumpTo(page, 1, 10 * 60, 'office');
  await pick(page, '面试室里有人在报名字');
  expect((await getState(page)).idols[KOGANE]?.status).toBe('known');

  // ---- 招募：录音棚第一天上班 ----
  await jumpTo(page, 3, 10 * 60, 'studio');
  await pick(page, '她第一天上班');
  expect((await getState(page)).idols[KOGANE]?.status).toBe('recruited');

  // ---- 名册 / 日程表 ----
  await page.getByRole('button', { name: /偶像名册/ }).first().click();
  const roster = page.getByRole('dialog', { name: '偶像名册' });
  await expect(
    roster.locator('.roster-card', { hasText: '月岡恋鐘' }),
  ).toBeVisible();
  await page.getByRole('button', { name: '关闭偶像名册' }).click();

  await page.getByRole('button', { name: /日程表/ }).first().click();
  const schedule = page.getByRole('dialog', { name: '偶像日程表' });
  await expect(schedule.getByRole('tab', { name: /月岡恋鐘/ })).toBeVisible();
  await page.getByRole('button', { name: '关闭日程表' }).click();

  // ---- 卡面第一章：事务所的晚饭 ----
  await jumpTo(page, 4, 11 * 60, 'office');
  await pick(page, '她说要用事务所的东西做饭');
  expect((await getState(page)).flags['completed.kogane.cook']).toBe(true);

  // ---- 卡面第二章：长崎物产展（三选项，选第一个） ----
  await jumpTo(page, 7, 13 * 60, 'shopping_street');
  await page.getByRole('button', { name: '长崎物产展' }).first().click();
  for (let index = 0; index < 90; index += 1) {
    if ((await page.locator('.dialogue-panel').count()) === 0) break;
    const choice = page.getByRole('button', { name: '说不定会因为工作去。' });
    if ((await choice.count()) > 0) await choice.first().click();
    else await page.getByRole('button', { name: '继续' }).click();
    await page.waitForTimeout(10);
  }
  expect((await getState(page)).flags['completed.kogane.fair']).toBe(true);

  // ---- 卡面第三章：live 结束以后 ----
  await jumpTo(page, 10, 19 * 60, 'studio');
  await pick(page, 'live 结束以后');
  expect((await getState(page)).flags['completed.kogane.live']).toBe(true);

  // ---- 专属行动：陪她做晚饭（平日傍晚她在事务所） ----
  await jumpTo(page, 11, 18 * 60 + 30, 'office');
  await page.getByRole('button', { name: /月岡恋鐘/ }).first().click();
  const beforeCook = await getState(page);
  const cook = page.getByRole('button', { name: '陪她做晚饭' });
  await expect(cook).toBeVisible();
  await cook.click();
  await expect.poll(() => phase(page)).toBe('activityResult');

  const afterCook = await getState(page);
  expect(beforeCook.shared.stamina - afterCook.shared.stamina).toBe(7);
  expect(
    afterCook.idols[KOGANE]!.stats.trust.exp -
      beforeCook.idols[KOGANE]!.stats.trust.exp,
  ).toBe(5);

  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 日常话题 ----
  const topics = PRODUCTION_PACK.actors.find((actor) => actor.id === KOGANE)!
    .topics;
  expect(topics).toHaveLength(6);
  const trustBeforeChat = (await getState(page)).idols[KOGANE]!.stats.trust.exp;
  await page.getByRole('button', { name: '聊两句' }).click();
  await expect.poll(() => phase(page)).toBe('npcResult');
  const said = (await getState(page)).lastResult ?? '';
  expect(topics.map((topic) => topic.text)).toContain(said);
  const afterChat = await getState(page);
  expect(afterChat.idols[KOGANE]!.stats.trust.exp - trustBeforeChat).toBe(1);
  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 课后事件：声乐课之后（她平日上午在练习室） ----
  let fired = false;
  for (const [day, startMinute] of [
    [12, 9 * 60],
    [13, 10 * 60],
  ] as const) {
    await jumpTo(page, day, startMinute, 'practice_room');
    await page.getByRole('button', { name: /月岡恋鐘/ }).first().click();
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
  expect((await getState(page)).pendingEventId).toBe('evt.kogane.after_vocal');
  await page.getByRole('button', { name: /很有.*味道/ }).click();
  await expect.poll(() => phase(page)).toBe('eventResult');
  await page.getByRole('button', { name: '继续' }).click();
  await expect
    .poll(async () => (await getState(page)).flags['seen:evt.kogane.after_vocal'])
    .toBe(true);

  expect(errors).toEqual([]);
});
