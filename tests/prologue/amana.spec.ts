import { expect, test } from '@playwright/test';
import { getState, jumpTo, openGame, reset, watchConsole } from '../acceptance/helpers';
import { PRODUCTION_PACK } from '../../src/core/productionPack';

/**
 * 甘奈：试镜 → 新人 live；卡面三章；挑衣服 / 话题 / 课后事件。
 */

const AMANA = 'amana';

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

test('Amana: audition, first live, card, shopping, topic and an event', async ({
  page,
}) => {
  test.setTimeout(180_000);
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await finishDialogue(page);

  // ---- 第 1 步：试镜（事务所） ----
  await jumpTo(page, 1, 11 * 60, 'office');
  await pick(page, '叫到下一个试镜的人');
  expect((await getState(page)).idols[AMANA]?.status).toBe('known');

  // ---- 第 2 步：新人联合 live（三分支，选第一个） ----
  await jumpTo(page, 3, 15 * 60, 'studio');
  await pick(page, '新人联合 live 的后台');
  expect((await getState(page)).idols[AMANA]?.status).toBe('recruited');

  // ---- 名册 / 日程表 ----
  await page.getByRole('button', { name: /偶像名册/ }).first().click();
  const roster = page.getByRole('dialog', { name: '偶像名册' });
  await expect(roster.locator('.roster-card', { hasText: '大崎甘奈' })).toBeVisible();
  await page.getByRole('button', { name: '关闭偶像名册' }).click();

  await page.getByRole('button', { name: /日程表/ }).first().click();
  const schedule = page.getByRole('dialog', { name: '偶像日程表' });
  await expect(schedule.getByRole('tab', { name: /大崎甘奈/ })).toBeVisible();
  await page.getByRole('button', { name: '关闭日程表' }).click();

  // ---- 卡面第一章：她留在事务所翻杂志 ----
  await jumpTo(page, 4, 18 * 60, 'office');
  await pick(page, '她留在事务所翻杂志');
  expect((await getState(page)).flags['completed.amana.magazine']).toBe(true);

  // ---- 卡面第二章：店门口看了很久（三选项，选第一个） ----
  await jumpTo(page, 7, 15 * 60, 'shopping_street');
  await pick(page, '她在店门口看了很久');
  expect((await getState(page)).flags['completed.amana.window']).toBe(true);

  // ---- 专属行动：陪她挑衣服（周一傍晚她在商店街） ----
  await jumpTo(page, 8, 17 * 60 + 45, 'shopping_street');
  await page.getByRole('button', { name: /大崎甘奈/ }).first().click();
  const beforeShop = await getState(page);
  const shop = page.getByRole('button', { name: '陪她挑衣服' });
  await expect(shop).toBeVisible();
  await shop.click();
  await expect.poll(() => phase(page)).toBe('activityResult');

  const afterShop = await getState(page);
  expect(beforeShop.shared.stamina - afterShop.shared.stamina).toBe(5);
  expect(
    afterShop.idols[AMANA]!.stats.trust.exp -
      beforeShop.idols[AMANA]!.stats.trust.exp,
  ).toBe(5);

  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 日常话题（7 条） ----
  const topics = PRODUCTION_PACK.actors.find((actor) => actor.id === AMANA)!
    .topics;
  expect(topics).toHaveLength(7);
  const trustBeforeChat = (await getState(page)).idols[AMANA]!.stats.trust.exp;
  await page.getByRole('button', { name: '聊两句' }).click();
  await expect.poll(() => phase(page)).toBe('npcResult');
  const said = (await getState(page)).lastResult ?? '';
  expect(topics.map((topic) => topic.text)).toContain(said);
  const afterChat = await getState(page);
  expect(afterChat.idols[AMANA]!.stats.trust.exp - trustBeforeChat).toBe(1);
  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 卡面第三章：她拉你去男装店 ----
  await jumpTo(page, 10, 16 * 60, 'shopping_street');
  await pick(page, '她拉你去一家男装店');
  expect((await getState(page)).flags['completed.amana.menswear']).toBe(true);

  // ---- 课后事件：舞蹈课之后（周四傍晚与周一下午她在练习室） ----
  let fired = false;
  for (const [day, startMinute] of [
    [11, 17 * 60 + 30],
    [15, 15 * 60 + 45],
  ] as const) {
    await jumpTo(page, day, startMinute, 'practice_room');
    await page.getByRole('button', { name: /大崎甘奈/ }).first().click();
    for (let attempt = 0; attempt < 4 && !fired; attempt += 1) {
      const dance = page.getByRole('button', { name: '舞蹈课' });
      if ((await dance.count()) === 0) break;
      await dance.click();
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
  expect((await getState(page)).pendingEventId).toBe('evt.amana.after_dance');
  await page.getByRole('button', { name: /给我也看看/ }).first().click();
  await expect.poll(() => phase(page)).toBe('eventResult');
  await page.getByRole('button', { name: '继续' }).click();
  await expect
    .poll(async () => (await getState(page)).flags['seen:evt.amana.after_dance'])
    .toBe(true);

  expect(errors).toEqual([]);
});
