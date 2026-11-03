import { expect, test } from '@playwright/test';
import { getState, jumpTo, openGame, reset, watchConsole } from '../acceptance/helpers';
import { PRODUCTION_PACK } from '../../src/core/productionPack';

/**
 * 甜花：试镜 → CD 手売り；卡面三章；打游戏 / 话题 / 课后事件。
 * 第一章用 endLocationId 收尾（她家的场景，结束时人在练习场）。
 */

const TENKA = 'tenka';

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

test('Tenka: audition, CD hand-to-hand, card, games, topic and an event', async ({
  page,
}) => {
  test.setTimeout(180_000);
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await finishDialogue(page);

  // ---- 第 1 步：试镜（事务所） ----
  await jumpTo(page, 1, 11 * 60, 'office');
  await pick(page, '试镜室里很安静');
  expect((await getState(page)).idols[TENKA]?.status).toBe('known');

  // ---- 第 2 步：街角 CD 手売り（三分支，选第一个） ----
  await jumpTo(page, 3, 15 * 60, 'shopping_street');
  await pick(page, '街角的 CD 手売り');
  expect((await getState(page)).idols[TENKA]?.status).toBe('recruited');

  // ---- 名册 / 日程表 ----
  await page.getByRole('button', { name: /偶像名册/ }).first().click();
  const roster = page.getByRole('dialog', { name: '偶像名册' });
  await expect(roster.locator('.roster-card', { hasText: '大崎甜花' })).toBeVisible();
  await page.getByRole('button', { name: '关闭偶像名册' }).click();

  await page.getByRole('button', { name: /日程表/ }).first().click();
  const schedule = page.getByRole('dialog', { name: '偶像日程表' });
  await expect(schedule.getByRole('tab', { name: /大崎甜花/ })).toBeVisible();
  await page.getByRole('button', { name: '关闭日程表' }).click();

  // ---- 卡面第一章：她的电话打不通（家里打→去她家→赶去练习场） ----
  await jumpTo(page, 4, 15 * 60, 'home');
  await expect(page.locator('.dialogue-scene-location')).toHaveCount(0);
  await page.getByRole('button', { name: '她的电话打不通' }).first().click();
  await expect(page.locator('.dialogue-scene-location')).toContainText('甜花的家');
  await finishDialogue(page);
  const afterOversleep = await getState(page);
  expect(afterOversleep.flags['completed.tenka.oversleep']).toBe(true);
  // 这一章的收尾把玩家搬到练习场（endLocationId）
  expect(afterOversleep.locationId).toBe('practice_room');

  // ---- 卡面第二章：课后她说想去个地方（三分支，选第一个） ----
  await jumpTo(page, 7, 15 * 60, 'station');
  await pick(page, '课后她说想去个地方');
  expect((await getState(page)).flags['completed.tenka.cafe']).toBe(true);

  // ---- 专属行动：陪她打游戏（周一傍晚在练习室） ----
  await jumpTo(page, 8, 18 * 60, 'practice_room');
  await page.getByRole('button', { name: /大崎甜花/ }).first().click();
  const beforeGame = await getState(page);
  const game = page.getByRole('button', { name: '陪她打游戏' });
  await expect(game).toBeVisible();
  await game.click();
  await expect.poll(() => phase(page)).toBe('activityResult');

  const afterGame = await getState(page);
  expect(beforeGame.shared.stamina - afterGame.shared.stamina).toBe(4);
  expect(
    afterGame.idols[TENKA]!.stats.trust.exp - beforeGame.idols[TENKA]!.stats.trust.exp,
  ).toBe(5);

  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 日常话题（7 条） ----
  const topics = PRODUCTION_PACK.actors.find((actor) => actor.id === TENKA)!
    .topics;
  expect(topics).toHaveLength(7);
  const trustBeforeChat = (await getState(page)).idols[TENKA]!.stats.trust.exp;
  await page.getByRole('button', { name: '聊两句' }).click();
  await expect.poll(() => phase(page)).toBe('npcResult');
  const said = (await getState(page)).lastResult ?? '';
  expect(topics.map((topic) => topic.text)).toContain(said);
  const afterChat = await getState(page);
  expect(afterChat.idols[TENKA]!.stats.trust.exp - trustBeforeChat).toBe(1);
  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 卡面第三章：她拿着台本站在茶水间 ----
  await jumpTo(page, 10, 16 * 60, 'office');
  await pick(page, '她拿着台本站在茶水间');
  expect((await getState(page)).flags['completed.tenka.coffee']).toBe(true);

  // ---- 课后事件：表演课之后（周四傍晚与周一下午她在练习室） ----
  let fired = false;
  for (const [day, startMinute] of [
    [11, 17 * 60 + 30],
    [15, 15 * 60 + 45],
  ] as const) {
    await jumpTo(page, day, startMinute, 'practice_room');
    await page.getByRole('button', { name: /大崎甜花/ }).first().click();
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
    'evt.tenka.after_expression',
  );
  await page.getByRole('button', { name: /这样就好/ }).first().click();
  await expect.poll(() => phase(page)).toBe('eventResult');
  await page.getByRole('button', { name: '继续' }).click();
  await expect
    .poll(
      async () =>
        (await getState(page)).flags['seen:evt.tenka.after_expression'],
    )
    .toBe(true);

  expect(errors).toEqual([]);
});
