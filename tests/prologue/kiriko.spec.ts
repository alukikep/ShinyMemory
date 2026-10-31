import { expect, test } from '@playwright/test';
import { getState, jumpTo, openGame, reset, watchConsole } from '../acceptance/helpers';
import { PRODUCTION_PACK } from '../../src/core/productionPack';

/**
 * 霧子：事务所相遇 → 次日清晨练习室招募 → 卡面三章 → 专属行动/话题/课后事件。
 *
 * 守两件事：这一批内容真的进了游戏；她的作息让他们站在该站的地方。
 */

const KIRIKO = 'kiriko';

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

test('Kiriko: recruit, card, bond action, topic and a post-lesson event', async ({
  page,
}) => {
  test.setTimeout(180_000);
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await finishDialogue(page);

  // ---- 招募：事务所会客室 ----
  await jumpTo(page, 1, 10 * 60, 'office');
  await pick(page, '会客室里有人在缠绷带');
  expect((await getState(page)).idols[KIRIKO]?.status).toBe('known');

  // ---- 招募：次日清晨的练习室 ----
  await jumpTo(page, 3, 8 * 60 + 30, 'practice_room');
  await pick(page, '她一个人在练习室擦地');
  expect((await getState(page)).idols[KIRIKO]?.status).toBe('recruited');

  // ---- 招募后：名册和日程表看得到她 ----
  await page.getByRole('button', { name: /偶像名册/ }).first().click();
  const roster = page.getByRole('dialog', { name: '偶像名册' });
  await expect(
    roster.locator('.roster-card', { hasText: '幽谷霧子' }),
  ).toBeVisible();
  await page.getByRole('button', { name: '关闭偶像名册' }).click();

  await page.getByRole('button', { name: /日程表/ }).first().click();
  const schedule = page.getByRole('dialog', { name: '偶像日程表' });
  await expect(schedule.getByRole('tab', { name: /幽谷霧子/ })).toBeVisible();
  await page.getByRole('button', { name: '关闭日程表' }).click();

  // ---- 卡面第一章：贩卖会前的花 ----
  await jumpTo(page, 4, 11 * 60, 'office');
  await pick(page, '她在为贩卖会摆花');
  expect((await getState(page)).flags['completed.kiriko.hand']).toBe(true);

  // ---- 卡面第二章：她看出你有点累（原作三个选项，选第一个） ----
  await jumpTo(page, 7, 9 * 60 + 30, 'office');
  await page.getByRole('button', { name: '她看出你有点累' }).first().click();
  for (let index = 0; index < 60; index += 1) {
    if ((await page.locator('.dialogue-panel').count()) === 0) break;
    const choice = page.getByRole('button', { name: '我去买点营养饮料。' });
    if ((await choice.count()) > 0) await choice.first().click();
    else await page.getByRole('button', { name: '继续' }).click();
    await page.waitForTimeout(10);
  }
  expect((await getState(page)).flags['completed.kiriko.worry']).toBe(true);

  // ---- 卡面第三章：交流会结束后 ----
  await jumpTo(page, 10, 19 * 60, 'studio');
  await pick(page, '交流会结束以后');
  expect((await getState(page)).flags['completed.kiriko.charm']).toBe(true);

  // ---- 专属行动：医院花坛（平日傍晚她在医院） ----
  await jumpTo(page, 10, 19 * 60 + 30, 'hospital');
  await page.getByRole('button', { name: /幽谷霧子/ }).first().click();
  const beforeWalk = await getState(page);
  const care = page.getByRole('button', { name: '陪她照顾花坛' });
  await expect(care).toBeVisible();
  await care.click();
  await expect.poll(() => phase(page)).toBe('activityResult');

  const afterWalk = await getState(page);
  expect(beforeWalk.shared.stamina - afterWalk.shared.stamina).toBe(7);
  expect(
    afterWalk.idols[KIRIKO]!.stats.trust.exp -
      beforeWalk.idols[KIRIKO]!.stats.trust.exp,
  ).toBe(5);

  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 日常话题 ----
  const topics = PRODUCTION_PACK.actors.find((actor) => actor.id === KIRIKO)!
    .topics;
  expect(topics).toHaveLength(6);
  const trustBeforeChat = (await getState(page)).idols[KIRIKO]!.stats.trust.exp;
  await page.getByRole('button', { name: '聊两句' }).click();
  await expect.poll(() => phase(page)).toBe('npcResult');
  const said = (await getState(page)).lastResult ?? '';
  expect(topics.map((topic) => topic.text)).toContain(said);
  const afterChat = await getState(page);
  expect(afterChat.idols[KIRIKO]!.stats.trust.exp - trustBeforeChat).toBe(1);
  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 课后事件：声乐课之后 ----
  await jumpTo(page, 11, 16 * 60, 'practice_room');
  await page.getByRole('button', { name: /幽谷霧子/ }).first().click();
  await expect(page.getByRole('button', { name: '声乐课' })).toBeVisible();

  let fired = false;
  for (let attempt = 0; attempt < 4 && !fired; attempt += 1) {
    await page.getByRole('button', { name: '声乐课' }).click();
    await expect.poll(() => phase(page)).toBe('activityResult');
    await page.getByRole('button', { name: '继续' }).click();
    await expect
      .poll(async () =>
        ['event', 'idol', 'plan'].includes((await getState(page)).phase),
      )
      .toBe(true);
    fired = (await getState(page)).phase === 'event';
  }

  expect(fired).toBe(true);
  expect((await getState(page)).pendingEventId).toBe('evt.kiriko.after_vocal');
  await page.getByRole('button', { name: /再唱一遍/ }).click();
  await expect.poll(() => phase(page)).toBe('eventResult');
  await page.getByRole('button', { name: '继续' }).click();
  await expect
    .poll(async () => (await getState(page)).flags['seen:evt.kiriko.after_vocal'])
    .toBe(true);

  expect(errors).toEqual([]);
});
