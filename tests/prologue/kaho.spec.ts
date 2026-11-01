import { expect, test } from '@playwright/test';
import { getState, jumpTo, openGame, reset, watchConsole } from '../acceptance/helpers';
import { PRODUCTION_PACK } from '../../src/core/productionPack';

/**
 * 果穂：公园里的抓人游戏 → 自己跑来事务所 → 卡面三章
 *       → 遛狗/话题/课后事件。
 */

const KAHO = 'kaho';

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

test('Kaho: recruit, card, dog walk, topic and a post-lesson event', async ({
  page,
}) => {
  test.setTimeout(180_000);
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await finishDialogue(page);

  // ---- 招募：公园里的抓人游戏 ----
  await jumpTo(page, 1, 15 * 60, 'park');
  await pick(page, '公园里有孩子在玩抓人');
  expect((await getState(page)).idols[KAHO]?.status).toBe('known');

  // ---- 招募：第二天她自己跑来事务所（原文 100900101 后半） ----
  await jumpTo(page, 2, 10 * 60, 'office');
  await pick(page, '第二天她自己跑来事务所');
  expect((await getState(page)).idols[KAHO]?.status).toBe('recruited');
  // 三段戏、三个时间点：公园(第 1 天) → 决定(第 2 天) → 上课前(第 3 天)
  expect((await getState(page)).storyChains['kaho-encounter']?.stepIndex).toBe(2);

  // ---- 招募：第一次上课前（原三分支，选第一个） ----
  await jumpTo(page, 3, 10 * 60, 'office');
  await pick(page, '第一次上课前她坐不住');
  expect((await getState(page)).storyChains['kaho-encounter']?.completed).toBe(
    true,
  );

  // ---- 名册 / 日程表 ----
  await page.getByRole('button', { name: /偶像名册/ }).first().click();
  const roster = page.getByRole('dialog', { name: '偶像名册' });
  await expect(
    roster.locator('.roster-card', { hasText: '小宮果穂' }),
  ).toBeVisible();
  await page.getByRole('button', { name: '关闭偶像名册' }).click();

  await page.getByRole('button', { name: /日程表/ }).first().click();
  const schedule = page.getByRole('dialog', { name: '偶像日程表' });
  await expect(schedule.getByRole('tab', { name: /小宮果穂/ })).toBeVisible();
  await page.getByRole('button', { name: '关闭日程表' }).click();

  // ---- 卡面第一章：收工路上遇到一只小狗 ----
  await jumpTo(page, 4, 17 * 60, 'shopping_street');
  await pick(page, '收工路上遇到一只小狗');
  expect((await getState(page)).flags['completed.kaho.walk']).toBe(true);

  // ---- 卡面第二章：下校路上她背着书包（三选项，选第一个） ----
  await jumpTo(page, 7, 17 * 60, 'park');
  await page.getByRole('button', { name: '下校路上她背着书包' }).first().click();
  for (let index = 0; index < 120; index += 1) {
    if ((await page.locator('.dialogue-panel').count()) === 0) break;
    const choice = page.getByRole('button', { name: '是不是发烧了。' });
    if ((await choice.count()) > 0) await choice.first().click();
    else await page.getByRole('button', { name: '继续' }).click();
    await page.waitForTimeout(10);
  }
  expect((await getState(page)).flags['completed.kaho.home']).toBe(true);

  // ---- 专属行动：陪她遛マメ丸（周二傍晚她在公园遛狗） ----
  await jumpTo(page, 9, 17 * 60 + 45, 'park');
  await page.getByRole('button', { name: /小宮果穂/ }).first().click();
  const beforeWalk = await getState(page);
  const walk = page.getByRole('button', { name: '陪她遛マメ丸' });
  await expect(walk).toBeVisible();
  await walk.click();
  await expect.poll(() => phase(page)).toBe('activityResult');

  const afterWalk = await getState(page);
  expect(beforeWalk.shared.stamina - afterWalk.shared.stamina).toBe(6);
  expect(
    afterWalk.idols[KAHO]!.stats.trust.exp - beforeWalk.idols[KAHO]!.stats.trust.exp,
  ).toBe(5);

  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 日常话题（7 条） ----
  const topics = PRODUCTION_PACK.actors.find((actor) => actor.id === KAHO)!
    .topics;
  expect(topics).toHaveLength(7);
  const trustBeforeChat = (await getState(page)).idols[KAHO]!.stats.trust.exp;
  await page.getByRole('button', { name: '聊两句' }).click();
  await expect.poll(() => phase(page)).toBe('npcResult');
  const said = (await getState(page)).lastResult ?? '';
  expect(topics.map((topic) => topic.text)).toContain(said);
  const afterChat = await getState(page);
  expect(afterChat.idols[KAHO]!.stats.trust.exp - trustBeforeChat).toBe(1);
  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 卡面第三章：英雄秀开演前 ----
  await jumpTo(page, 10, 16 * 60, 'studio');
  await pick(page, '英雄秀开演前');
  expect((await getState(page)).flags['completed.kaho.red']).toBe(true);

  // ---- 课后事件：声乐课之后（她周四傍晚与周一下午在练习室） ----
  let fired = false;
  for (const [day, startMinute] of [
    [11, 17 * 60 + 30],
    [15, 15 * 60 + 45],
  ] as const) {
    await jumpTo(page, day, startMinute, 'practice_room');
    await page.getByRole('button', { name: /小宮果穂/ }).first().click();
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
  expect((await getState(page)).pendingEventId).toBe('evt.kaho.after_vocal');
  await page.getByRole('button', { name: /最后那句很好/ }).click();
  await expect.poll(() => phase(page)).toBe('eventResult');
  await page.getByRole('button', { name: '继续' }).click();
  await expect
    .poll(async () => (await getState(page)).flags['seen:evt.kaho.after_vocal'])
    .toBe(true);

  expect(errors).toEqual([]);
});
