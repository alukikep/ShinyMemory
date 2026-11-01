import { expect, test } from '@playwright/test';
import { getState, jumpTo, openGame, reset, watchConsole } from '../acceptance/helpers';
import { PRODUCTION_PACK } from '../../src/core/productionPack';

/**
 * 愛依：街上撞到 → 第一次基础课；卡面三章；卡拉 OK / 话题 / 课后事件。
 */

const MEI = 'mei';

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

test('Mei: bump, first lesson, card, karaoke and an event', async ({ page }) => {
  test.setTimeout(180_000);
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await finishDialogue(page);

  // ---- 第 1 步：街上撞到（商业街） ----
  await jumpTo(page, 1, 14 * 60, 'shopping_street');
  await pick(page, '有人撞到了你，然后笑了');
  expect((await getState(page)).idols[MEI]?.status).toBe('known');

  // ---- 第 2 步：第一次基础课（三分支） ----
  await jumpTo(page, 3, 15 * 60 + 30, 'practice_room');
  await pick(page, '第一次基础课');
  expect((await getState(page)).idols[MEI]?.status).toBe('recruited');

  // ---- 名册 / 日程表 ----
  await page.getByRole('button', { name: /偶像名册/ }).first().click();
  const roster = page.getByRole('dialog', { name: '偶像名册' });
  await expect(roster.locator('.roster-card', { hasText: '和泉愛依' })).toBeVisible();
  await page.getByRole('button', { name: '关闭偶像名册' }).click();

  await page.getByRole('button', { name: /日程表/ }).first().click();
  const schedule = page.getByRole('dialog', { name: '偶像日程表' });
  await expect(schedule.getByRole('tab', { name: /和泉愛依/ })).toBeVisible();
  await page.getByRole('button', { name: '关闭日程表' }).click();

  // ---- 卡面第一章：事务所的作业（三分支） ----
  await jumpTo(page, 4, 16 * 60, 'office');
  await pick(page, '她在事务所摊开作业');
  expect((await getState(page)).flags['completed.mei.homework']).toBe(true);

  // ---- 卡面第二章：开车去（海边，线性） ----
  await jumpTo(page, 7, 16 * 60, 'seaside');
  await pick(page, '今天的工作要开车去');
  expect((await getState(page)).flags['completed.mei.drive']).toBe(true);

  // ---- 专属行动：陪她去卡拉 OK（周二傍晚商店街） ----
  await jumpTo(page, 9, 18 * 60, 'shopping_street');
  await page.getByRole('button', { name: /和泉愛依/ }).first().click();
  const beforeKaraoke = await getState(page);
  const karaoke = page.getByRole('button', { name: '陪她去卡拉 OK' });
  await expect(karaoke).toBeVisible();
  await karaoke.click();
  await expect.poll(() => phase(page)).toBe('activityResult');

  const afterKaraoke = await getState(page);
  expect(beforeKaraoke.shared.stamina - afterKaraoke.shared.stamina).toBe(5);
  expect(
    afterKaraoke.idols[MEI]!.stats.trust.exp -
      beforeKaraoke.idols[MEI]!.stats.trust.exp,
  ).toBe(5);

  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 日常话题（7 条） ----
  const topics = PRODUCTION_PACK.actors.find((actor) => actor.id === MEI)!
    .topics;
  expect(topics).toHaveLength(7);
  const trustBeforeChat = (await getState(page)).idols[MEI]!.stats.trust.exp;
  await page.getByRole('button', { name: '聊两句' }).click();
  await expect.poll(() => phase(page)).toBe('npcResult');
  const said = (await getState(page)).lastResult ?? '';
  expect(topics.map((topic) => topic.text)).toContain(said);
  const afterChat = await getState(page);
  expect(afterChat.idols[MEI]!.stats.trust.exp - trustBeforeChat).toBe(1);
  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 卡面第三章：她跑进事务所 ----
  await jumpTo(page, 10, 18 * 60, 'office');
  await pick(page, '她跑进事务所喊"听我说"');
  expect((await getState(page)).flags['completed.mei.report']).toBe(true);

  // ---- 课后事件：表现课之后（周四 / 周一下午练习室） ----
  let fired = false;
  for (const [day, startMinute] of [
    [11, 16 * 60],
    [15, 15 * 60 + 45],
  ] as const) {
    await jumpTo(page, day, startMinute, 'practice_room');
    await page.getByRole('button', { name: /和泉愛依/ }).first().click();
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
  expect((await getState(page)).pendingEventId).toBe('evt.mei.after_expression');
  await page.getByRole('button', { name: /看得出来，但你没停/ }).first().click();
  await expect.poll(() => phase(page)).toBe('eventResult');
  await page.getByRole('button', { name: '继续' }).click();
  await expect
    .poll(async () => (await getState(page)).flags['seen:evt.mei.after_expression'])
    .toBe(true);

  expect(errors).toEqual([]);
});
