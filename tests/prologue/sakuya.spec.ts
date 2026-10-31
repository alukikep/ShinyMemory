import { expect, test } from '@playwright/test';
import { getState, jumpTo, openGame, reset, watchConsole } from '../acceptance/helpers';
import { PRODUCTION_PACK } from '../../src/core/productionPack';

/**
 * 咲耶：街头拍摄现场 → 录音棚第一支广告 → 卡面三章
 *       → 挑点心/话题/课后事件。
 */

const SAKUYA = 'sakuya';

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

test('Sakuya: recruit, card, treats, topic and a post-lesson event', async ({
  page,
}) => {
  test.setTimeout(180_000);
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await finishDialogue(page);

  // ---- 招募：街边的拍摄现场 ----
  await jumpTo(page, 1, 13 * 60, 'shopping_street');
  await pick(page, '街边有人在拍杂志');
  expect((await getState(page)).idols[SAKUYA]?.status).toBe('known');

  // ---- 招募：录音棚第一支广告（原三分支，选第一个） ----
  await jumpTo(page, 3, 16 * 60, 'studio');
  await pick(page, '她在准备第一支广告');
  expect((await getState(page)).idols[SAKUYA]?.status).toBe('recruited');

  // ---- 名册 / 日程表 ----
  await page.getByRole('button', { name: /偶像名册/ }).first().click();
  const roster = page.getByRole('dialog', { name: '偶像名册' });
  await expect(
    roster.locator('.roster-card', { hasText: '白瀬咲耶' }),
  ).toBeVisible();
  await page.getByRole('button', { name: '关闭偶像名册' }).click();

  await page.getByRole('button', { name: /日程表/ }).first().click();
  const schedule = page.getByRole('dialog', { name: '偶像日程表' });
  await expect(schedule.getByRole('tab', { name: /白瀬咲耶/ })).toBeVisible();
  await page.getByRole('button', { name: '关闭日程表' }).click();

  // ---- 卡面第一章：被粉丝围着 ----
  await jumpTo(page, 4, 13 * 60, 'shopping_street');
  await pick(page, '她被一群女孩子围着');
  expect((await getState(page)).flags['completed.sakuya.fans']).toBe(true);

  // ---- 卡面第二章：人潮里她找不到你（三选项，选第一个） ----
  await jumpTo(page, 7, 12 * 60, 'station');
  await page.getByRole('button', { name: '人潮里她找不到你' }).first().click();
  for (let index = 0; index < 120; index += 1) {
    if ((await page.locator('.dialogue-panel').count()) === 0) break;
    const choice = page.getByRole('button', { name: '大小姐和她的随从吧。' });
    if ((await choice.count()) > 0) await choice.first().click();
    else await page.getByRole('button', { name: '继续' }).click();
    await page.waitForTimeout(10);
  }
  expect((await getState(page)).flags['completed.sakuya.crowd']).toBe(true);

  // ---- 卡面第三章：演出结束以后 ----
  await jumpTo(page, 10, 19 * 60, 'park');
  await pick(page, '演出结束以后');
  expect((await getState(page)).flags['completed.sakuya.night']).toBe(true);

  // ---- 专属行动：陪她挑点心（平日傍晚她在商店街） ----
  await jumpTo(page, 11, 19 * 60 + 30, 'shopping_street');
  await page.getByRole('button', { name: /白瀬咲耶/ }).first().click();
  const beforeShop = await getState(page);
  const treats = page.getByRole('button', { name: '陪她挑点心' });
  await expect(treats).toBeVisible();
  await treats.click();
  await expect.poll(() => phase(page)).toBe('activityResult');

  const afterShop = await getState(page);
  expect(beforeShop.shared.stamina - afterShop.shared.stamina).toBe(7);
  expect(
    afterShop.idols[SAKUYA]!.stats.trust.exp -
      beforeShop.idols[SAKUYA]!.stats.trust.exp,
  ).toBe(5);

  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 日常话题（7 条） ----
  const topics = PRODUCTION_PACK.actors.find((actor) => actor.id === SAKUYA)!
    .topics;
  expect(topics).toHaveLength(7);
  const trustBeforeChat = (await getState(page)).idols[SAKUYA]!.stats.trust.exp;
  await page.getByRole('button', { name: '聊两句' }).click();
  await expect.poll(() => phase(page)).toBe('npcResult');
  const said = (await getState(page)).lastResult ?? '';
  expect(topics.map((topic) => topic.text)).toContain(said);
  const afterChat = await getState(page);
  expect(afterChat.idols[SAKUYA]!.stats.trust.exp - trustBeforeChat).toBe(1);
  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 课后事件：声乐课之后（她平日下午在练习室） ----
  let fired = false;
  for (const [day, startMinute] of [
    [12, 15 * 60 + 30],
    [15, 15 * 60 + 30],
  ] as const) {
    await jumpTo(page, day, startMinute, 'practice_room');
    await page.getByRole('button', { name: /白瀬咲耶/ }).first().click();
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
  expect((await getState(page)).pendingEventId).toBe('evt.sakuya.after_vocal');
  await page.getByRole('button', { name: /低音很适合你/ }).click();
  await expect.poll(() => phase(page)).toBe('eventResult');
  await page.getByRole('button', { name: '继续' }).click();
  await expect
    .poll(async () => (await getState(page)).flags['seen:evt.sakuya.after_vocal'])
    .toBe(true);

  expect(errors).toEqual([]);
});
