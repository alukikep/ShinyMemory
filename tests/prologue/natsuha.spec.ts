import { expect, test } from '@playwright/test';
import { getState, jumpTo, openGame, reset, watchConsole } from '../acceptance/helpers';
import { PRODUCTION_PACK } from '../../src/core/productionPack';

/**
 * 夏葉：档案型（书面审查已在籍）→ 练习室第一次见面 → 事务所单手平衡
 *       → 卡面三章 → 跑步 / 话题 / 课后事件。
 */

const NATSUHA = 'natsuha';

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

test('Natsuha: known from paperwork, recruit, card, run, topic and an event', async ({
  page,
}) => {
  test.setTimeout(180_000);
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await finishDialogue(page);

  // ---- 档案型：第一天名册里就该有她（还没"接手"） ----
  expect((await getState(page)).idols[NATSUHA]?.status).toBe('known');
  await page.getByRole('button', { name: /偶像名册/ }).first().click();
  const rosterBefore = page.getByRole('dialog', { name: '偶像名册' });
  await expect(
    rosterBefore.locator('.roster-card', { hasText: '有栖川夏葉' }),
  ).toBeVisible();
  await page.getByRole('button', { name: '关闭偶像名册' }).click();

  // ---- 第 1 步：练习室里她练完出来认人 ----
  await jumpTo(page, 1, 15 * 60 + 30, 'practice_room');
  await pick(page, '练习室里有人在喊拍子');
  expect((await getState(page)).storyChains['natsuha-encounter']?.stepIndex).toBe(1);

  // ---- 第 2 步：等工作的空档（三选项，选第一个） ----
  await jumpTo(page, 2, 15 * 60 + 30, 'office');
  await pick(page, '等工作的空档她在练平衡');
  expect((await getState(page)).idols[NATSUHA]?.status).toBe('recruited');

  // ---- 日程表：接手后能看到她 ----
  await page.getByRole('button', { name: /日程表/ }).first().click();
  const schedule = page.getByRole('dialog', { name: '偶像日程表' });
  await expect(schedule.getByRole('tab', { name: /有栖川夏葉/ })).toBeVisible();
  await page.getByRole('button', { name: '关闭日程表' }).click();

  // ---- 卡面第一章：喫茶店里一手哑铃一手书 ----
  await jumpTo(page, 4, 17 * 60, 'station');
  await pick(page, '喫茶店里一手哑铃一手书');
  expect((await getState(page)).flags['completed.natsuha.cafe']).toBe(true);

  // ---- 卡面第二章：她突然说要去逛街（三选项，选第一个） ----
  await jumpTo(page, 7, 17 * 60, 'shopping_street');
  await pick(page, '她突然说要去逛街');
  expect((await getState(page)).flags['completed.natsuha.shopping']).toBe(true);

  // ---- 专属行动：陪她跑步（周二傍晚她在公园） ----
  await jumpTo(page, 9, 17 * 60 + 45, 'park');
  await page.getByRole('button', { name: /有栖川夏葉/ }).first().click();
  const beforeRun = await getState(page);
  const run = page.getByRole('button', { name: '陪她跑步' });
  await expect(run).toBeVisible();
  await run.click();
  await expect.poll(() => phase(page)).toBe('activityResult');

  const afterRun = await getState(page);
  expect(beforeRun.shared.stamina - afterRun.shared.stamina).toBe(8);
  expect(
    afterRun.idols[NATSUHA]!.stats.trust.exp -
      beforeRun.idols[NATSUHA]!.stats.trust.exp,
  ).toBe(5);

  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 日常话题（7 条） ----
  const topics = PRODUCTION_PACK.actors.find((actor) => actor.id === NATSUHA)!
    .topics;
  expect(topics).toHaveLength(7);
  const trustBeforeChat = (await getState(page)).idols[NATSUHA]!.stats.trust.exp;
  await page.getByRole('button', { name: '聊两句' }).click();
  await expect.poll(() => phase(page)).toBe('npcResult');
  const said = (await getState(page)).lastResult ?? '';
  expect(topics.map((topic) => topic.text)).toContain(said);
  const afterChat = await getState(page);
  expect(afterChat.idols[NATSUHA]!.stats.trust.exp - trustBeforeChat).toBe(1);
  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 卡面第三章：她递来一罐咖啡 ----
  await jumpTo(page, 10, 18 * 60, 'park');
  await pick(page, '她递来一罐咖啡');
  expect((await getState(page)).flags['completed.natsuha.bench']).toBe(true);

  // ---- 课后事件：舞蹈课之后（周四傍晚与周一下午她在练习室） ----
  let fired = false;
  for (const [day, startMinute] of [
    [11, 17 * 60 + 30],
    [15, 15 * 60 + 45],
  ] as const) {
    await jumpTo(page, day, startMinute, 'practice_room');
    await page.getByRole('button', { name: /有栖川夏葉/ }).first().click();
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
  expect((await getState(page)).pendingEventId).toBe('evt.natsuha.after_dance');
  await page.getByRole('button', { name: /今天就到这里/ }).first().click();
  await expect.poll(() => phase(page)).toBe('eventResult');
  await page.getByRole('button', { name: '继续' }).click();
  await expect
    .poll(async () => (await getState(page)).flags['seen:evt.natsuha.after_dance'])
    .toBe(true);

  expect(errors).toEqual([]);
});
