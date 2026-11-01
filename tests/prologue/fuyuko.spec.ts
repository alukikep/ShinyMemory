import { expect, test } from '@playwright/test';
import { getState, jumpTo, openGame, reset, watchConsole } from '../acceptance/helpers';
import { PRODUCTION_PACK } from '../../src/core/productionPack';

/**
 * 冬優子：站前海报 → 第一次拍摄；卡面三章；周边店 / 话题 / 课后事件。
 */

const FUYUKO = 'fuyuko';

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

test('Fuyuko: poster, first shoot, card, goods store and an event', async ({
  page,
}) => {
  test.setTimeout(180_000);
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await finishDialogue(page);

  // ---- 第 1 步：站前有人盯着海报 ----
  await jumpTo(page, 1, 14 * 60, 'station');
  await pick(page, '站前有人盯着海报');
  expect((await getState(page)).idols[FUYUKO]?.status).toBe('known');

  // ---- 第 2 步：第一次拍摄（三分支，选第一个） ----
  await jumpTo(page, 3, 15 * 60, 'studio');
  await pick(page, '她第一次拍摄，笑得很标准');
  expect((await getState(page)).idols[FUYUKO]?.status).toBe('recruited');

  // ---- 名册 / 日程表 ----
  await page.getByRole('button', { name: /偶像名册/ }).first().click();
  const roster = page.getByRole('dialog', { name: '偶像名册' });
  await expect(roster.locator('.roster-card', { hasText: '黛冬優子' })).toBeVisible();
  await page.getByRole('button', { name: '关闭偶像名册' }).click();

  await page.getByRole('button', { name: /日程表/ }).first().click();
  const schedule = page.getByRole('dialog', { name: '偶像日程表' });
  await expect(schedule.getByRole('tab', { name: /黛冬優子/ })).toBeVisible();
  await page.getByRole('button', { name: '关闭日程表' }).click();

  // ---- 卡面第一章：她瘫在练习室的地板上（三分支） ----
  await jumpTo(page, 4, 15 * 60, 'practice_room');
  await pick(page, '她瘫在练习室的地板上');
  expect((await getState(page)).flags['completed.fuyuko.lazy']).toBe(true);

  // ---- 卡面第二章：商店街排起了长队（原作无分支，线性） ----
  await jumpTo(page, 7, 16 * 60, 'shopping_street');
  await pick(page, '商店街排起了长队');
  expect((await getState(page)).flags['completed.fuyuko.badge']).toBe(true);

  // ---- 专属行动：陪她逛周边店（周二傍晚商店街） ----
  await jumpTo(page, 9, 16 * 60 + 30, 'shopping_street');
  await page.getByRole('button', { name: /黛冬優子/ }).first().click();
  const beforeShop = await getState(page);
  const shop = page.getByRole('button', { name: '陪她逛周边店' });
  await expect(shop).toBeVisible();
  await shop.click();
  await expect.poll(() => phase(page)).toBe('activityResult');

  const afterShop = await getState(page);
  expect(beforeShop.shared.stamina - afterShop.shared.stamina).toBe(4);
  expect(
    afterShop.idols[FUYUKO]!.stats.trust.exp -
      beforeShop.idols[FUYUKO]!.stats.trust.exp,
  ).toBe(5);

  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 日常话题（7 条） ----
  const topics = PRODUCTION_PACK.actors.find((actor) => actor.id === FUYUKO)!
    .topics;
  expect(topics).toHaveLength(7);
  const trustBeforeChat = (await getState(page)).idols[FUYUKO]!.stats.trust.exp;
  await page.getByRole('button', { name: '聊两句' }).click();
  await expect.poll(() => phase(page)).toBe('npcResult');
  const said = (await getState(page)).lastResult ?? '';
  expect(topics.map((topic) => topic.text)).toContain(said);
  const afterChat = await getState(page);
  expect(afterChat.idols[FUYUKO]!.stats.trust.exp - trustBeforeChat).toBe(1);
  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 卡面第三章：ソロステージ结束后的后台 ----
  await jumpTo(page, 10, 18 * 60, 'studio');
  await pick(page, 'ソロステージ结束后的后台');
  expect((await getState(page)).flags['completed.fuyuko.solo']).toBe(true);

  // ---- 课后事件：表现课之后（周五 / 周一下午她在练习室） ----
  let fired = false;
  for (const [day, startMinute] of [
    [12, 14 * 60 + 30],
    [15, 14 * 60 + 30],
  ] as const) {
    await jumpTo(page, day, startMinute, 'practice_room');
    await page.getByRole('button', { name: /黛冬優子/ }).first().click();
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
    'evt.fuyuko.after_expression',
  );
  await page.getByRole('button', { name: /笑了很久吧/ }).first().click();
  await expect.poll(() => phase(page)).toBe('eventResult');
  await page.getByRole('button', { name: '继续' }).click();
  await expect
    .poll(
      async () => (await getState(page)).flags['seen:evt.fuyuko.after_expression'],
    )
    .toBe(true);

  expect(errors).toEqual([]);
});
