import { expect, test } from '@playwright/test';
import { getState, jumpTo, openGame, reset, watchConsole } from '../acceptance/helpers';
import { PRODUCTION_PACK } from '../../src/core/productionPack';

/**
 * 凛世：木屐鼻绪 → 她来还手帕 → 课后练习室；卡面三章；折纸 / 话题 / 课后事件。
 * 招募链三步三个场景（playbook §4.6），所以这里也断三次状态。
 */

const RINZE = 'rinze';

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

test('Rinze: three-step recruit, card, folding, topic and a post-lesson event', async ({
  page,
}) => {
  test.setTimeout(180_000);
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await finishDialogue(page);

  // ---- 第 1 步：路边木屐鼻绪断了（商店街，当天） ----
  await jumpTo(page, 1, 14 * 60, 'shopping_street');
  await pick(page, '路边有人蹲着看木屐');
  expect((await getState(page)).idols[RINZE]?.status).toBe('known');

  // ---- 第 2 步：几天后她来还手帕（事务所） ----
  await jumpTo(page, 3, 10 * 60, 'office');
  await pick(page, '她来还手帕');
  expect((await getState(page)).idols[RINZE]?.status).toBe('recruited');

  // ---- 卡面第一章：和风外景的控え室 ----
  await jumpTo(page, 4, 17 * 60, 'studio');
  await pick(page, '和风外景的控え室');
  expect((await getState(page)).flags['completed.rinze.shoot']).toBe(true);

  // ---- 第 3 步：课后练习室（三分支，选第一个） ----
  await jumpTo(page, 5, 15 * 60 + 30, 'practice_room');
  await pick(page, '课后的练习室');
  expect((await getState(page)).storyChains['rinze-encounter']?.completed).toBe(
    true,
  );

  // ---- 名册 / 日程表 ----
  await page.getByRole('button', { name: /偶像名册/ }).first().click();
  const roster = page.getByRole('dialog', { name: '偶像名册' });
  await expect(roster.locator('.roster-card', { hasText: '杜野凛世' })).toBeVisible();
  await page.getByRole('button', { name: '关闭偶像名册' }).click();

  await page.getByRole('button', { name: /日程表/ }).first().click();
  const schedule = page.getByRole('dialog', { name: '偶像日程表' });
  await expect(schedule.getByRole('tab', { name: /杜野凛世/ })).toBeVisible();
  await page.getByRole('button', { name: '关闭日程表' }).click();

  // ---- 卡面第二章：站前突然下起雨（三选项，选第一个） ----
  await jumpTo(page, 7, 17 * 60, 'station');
  await pick(page, '站前突然下起雨');
  expect((await getState(page)).flags['completed.rinze.rain']).toBe(true);

  // ---- 专属行动：陪她折纸（周二傍晚她会在事务所） ----
  await jumpTo(page, 9, 16 * 60, 'office');
  await page.getByRole('button', { name: /杜野凛世/ }).first().click();
  const beforeFold = await getState(page);
  const fold = page.getByRole('button', { name: '陪她折纸' });
  await expect(fold).toBeVisible();
  await fold.click();
  await expect.poll(() => phase(page)).toBe('activityResult');

  const afterFold = await getState(page);
  expect(beforeFold.shared.stamina - afterFold.shared.stamina).toBe(6);
  expect(
    afterFold.idols[RINZE]!.stats.trust.exp -
      beforeFold.idols[RINZE]!.stats.trust.exp,
  ).toBe(5);

  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 日常话题（7 条） ----
  const topics = PRODUCTION_PACK.actors.find((actor) => actor.id === RINZE)!
    .topics;
  expect(topics).toHaveLength(7);
  const trustBeforeChat = (await getState(page)).idols[RINZE]!.stats.trust.exp;
  await page.getByRole('button', { name: '聊两句' }).click();
  await expect.poll(() => phase(page)).toBe('npcResult');
  const said = (await getState(page)).lastResult ?? '';
  expect(topics.map((topic) => topic.text)).toContain(said);
  const afterChat = await getState(page);
  expect(afterChat.idols[RINZE]!.stats.trust.exp - trustBeforeChat).toBe(1);
  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 卡面第三章：她接过你的大衣 ----
  await jumpTo(page, 10, 18 * 60, 'office');
  await pick(page, '她接过你的大衣');
  expect((await getState(page)).flags['completed.rinze.letter']).toBe(true);

  // ---- 课后事件：声乐课之后（周四傍晚与周一下午她在练习室） ----
  let fired = false;
  for (const [day, startMinute] of [
    [11, 17 * 60 + 30],
    [15, 15 * 60 + 45],
  ] as const) {
    await jumpTo(page, day, startMinute, 'practice_room');
    await page.getByRole('button', { name: /杜野凛世/ }).first().click();
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
  expect((await getState(page)).pendingEventId).toBe('evt.rinze.after_vocal');
  await page.getByRole('button', { name: /很好。/ }).first().click();
  await expect.poll(() => phase(page)).toBe('eventResult');
  await page.getByRole('button', { name: '继续' }).click();
  await expect
    .poll(async () => (await getState(page)).flags['seen:evt.rinze.after_vocal'])
    .toBe(true);

  expect(errors).toEqual([]);
});
