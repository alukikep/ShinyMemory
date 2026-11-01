import { expect, test } from '@playwright/test';
import { getState, jumpTo, openGame, reset, watchConsole } from '../acceptance/helpers';
import { PRODUCTION_PACK } from '../../src/core/productionPack';

/**
 * 樹里：街头搭话 → 宣材写真 → 卡面三章 → 练投篮/话题/课后事件。
 */

const JURI = 'juri';

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

test('Juri: recruit, card, basketball, topic and a post-lesson event', async ({
  page,
}) => {
  test.setTimeout(180_000);
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await finishDialogue(page);

  // ---- 招募：街上有个金发的女孩子 ----
  await jumpTo(page, 1, 14 * 60, 'shopping_street');
  await pick(page, '街上有个金发的女孩子');
  expect((await getState(page)).idols[JURI]?.status).toBe('known');

  // ---- 招募：等她拍宣材写真（原三分支，选第一个） ----
  await jumpTo(page, 3, 15 * 60, 'studio');
  await pick(page, '她在等宣材写真的拍摄');
  expect((await getState(page)).idols[JURI]?.status).toBe('recruited');

  // ---- 名册 / 日程表 ----
  await page.getByRole('button', { name: /偶像名册/ }).first().click();
  const roster = page.getByRole('dialog', { name: '偶像名册' });
  await expect(roster.locator('.roster-card', { hasText: '西城樹里' })).toBeVisible();
  await page.getByRole('button', { name: '关闭偶像名册' }).click();

  await page.getByRole('button', { name: /日程表/ }).first().click();
  const schedule = page.getByRole('dialog', { name: '偶像日程表' });
  await expect(schedule.getByRole('tab', { name: /西城樹里/ })).toBeVisible();
  await page.getByRole('button', { name: '关闭日程表' }).click();

  // ---- 卡面第一章：她在服屋前转来转去 ----
  await jumpTo(page, 4, 17 * 60, 'shopping_street');
  await pick(page, '她在服屋前转来转去');
  expect((await getState(page)).flags['completed.juri.shop']).toBe(true);

  // ---- 卡面第二章：拍摄前她坐在走廊上（三选项，选第一个） ----
  await jumpTo(page, 7, 17 * 60, 'studio');
  await page.getByRole('button', { name: '拍摄前她坐在走廊上' }).first().click();
  for (let index = 0; index < 120; index += 1) {
    if ((await page.locator('.dialogue-panel').count()) === 0) break;
    const choice = page.getByRole('button', { name: '樹里有樹里的样子。' });
    if ((await choice.count()) > 0) await choice.first().click();
    else await page.getByRole('button', { name: '继续' }).click();
    await page.waitForTimeout(10);
  }
  expect((await getState(page)).flags['completed.juri.letter']).toBe(true);

  // ---- 专属行动：陪她练投篮（周二傍晚她会在公园） ----
  await jumpTo(page, 9, 17 * 60 + 45, 'park');
  await page.getByRole('button', { name: /西城樹里/ }).first().click();
  const beforeHoop = await getState(page);
  const hoop = page.getByRole('button', { name: '陪她练投篮' });
  await expect(hoop).toBeVisible();
  await hoop.click();
  await expect.poll(() => phase(page)).toBe('activityResult');

  const afterHoop = await getState(page);
  expect(beforeHoop.shared.stamina - afterHoop.shared.stamina).toBe(7);
  expect(
    afterHoop.idols[JURI]!.stats.trust.exp - beforeHoop.idols[JURI]!.stats.trust.exp,
  ).toBe(5);

  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 日常话题（7 条） ----
  const topics = PRODUCTION_PACK.actors.find((actor) => actor.id === JURI)!
    .topics;
  expect(topics).toHaveLength(7);
  const trustBeforeChat = (await getState(page)).idols[JURI]!.stats.trust.exp;
  await page.getByRole('button', { name: '聊两句' }).click();
  await expect.poll(() => phase(page)).toBe('npcResult');
  const said = (await getState(page)).lastResult ?? '';
  expect(topics.map((topic) => topic.text)).toContain(said);
  const afterChat = await getState(page);
  expect(afterChat.idols[JURI]!.stats.trust.exp - trustBeforeChat).toBe(1);
  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 卡面第三章：她把旧照片摊在桌上 ----
  await jumpTo(page, 10, 18 * 60, 'office');
  await pick(page, '她把旧照片摊在桌上');
  expect((await getState(page)).flags['completed.juri.photo']).toBe(true);

  // ---- 课后事件：声乐课之后（她周四傍晚与周一下午在练习室） ----
  let fired = false;
  for (const [day, startMinute] of [
    [11, 17 * 60 + 30],
    [15, 15 * 60 + 45],
  ] as const) {
    await jumpTo(page, day, startMinute, 'practice_room');
    await page.getByRole('button', { name: /西城樹里/ }).first().click();
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
  expect((await getState(page)).pendingEventId).toBe('evt.juri.after_vocal');
  // 选项按钮会带偶像名前缀（"让西城樹里…"），所以用宽松匹配。
  await page.getByRole('button', { name: /很好。/ }).first().click();
  await expect.poll(() => phase(page)).toBe('eventResult');
  await page.getByRole('button', { name: '继续' }).click();
  await expect
    .poll(async () => (await getState(page)).flags['seen:evt.juri.after_vocal'])
    .toBe(true);

  expect(errors).toEqual([]);
});
