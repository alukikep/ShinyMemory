import { expect, test } from '@playwright/test';
import {
  getState,
  jumpTo,
  openGame,
  reset,
  watchConsole,
} from '../acceptance/helpers';
import { PRODUCTION_PACK } from '../../src/core/productionPack';

/**
 * 美琴：事务所 → 练习室（测试）；卡面五章；买杂志 / 话题 / 课后事件。
 */

const MIKOTO = 'mikoto';

async function finishDialogue(page: import('@playwright/test').Page) {
  for (let index = 0; index < 400; index += 1) {
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

test('Mikoto: office, audition; five card chapters, magazine run and an event', async ({
  page,
}) => {
  test.setTimeout(240_000);
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await finishDialogue(page);

  // ---- 第 1 步：事务所 ----
  await jumpTo(page, 1, 14 * 60, 'office');
  await pick(page, '事务所里有个没见过的女人');
  expect((await getState(page)).idols[MIKOTO]?.status).toBe('known');

  // ---- 第 2 步：练习室的测试 ----
  await jumpTo(page, 2, 16 * 60, 'practice_room');
  await pick(page, '她说想看测试');
  expect((await getState(page)).idols[MIKOTO]?.status).toBe('recruited');

  // ---- 名册 / 日程表 ----
  await page.getByRole('button', { name: /偶像名册/ }).first().click();
  const roster = page.getByRole('dialog', { name: '偶像名册' });
  await expect(roster.locator('.roster-card', { hasText: '緋田美琴' })).toBeVisible();
  await page.getByRole('button', { name: '关闭偶像名册' }).click();

  await page.getByRole('button', { name: /日程表/ }).first().click();
  const schedule = page.getByRole('dialog', { name: '偶像日程表' });
  await expect(schedule.getByRole('tab', { name: /緋田美琴/ })).toBeVisible();
  await page.getByRole('button', { name: '关闭日程表' }).click();

  // ---- 卡面第一章：忘了喝水（三分支） ----
  await jumpTo(page, 4, 12 * 60, 'practice_room');
  await pick(page, '她练了两个小时没喝水');
  expect((await getState(page)).flags['completed.mikoto.water']).toBe(true);

  // ---- 卡面第二章：买杂志（三分支） ----
  await jumpTo(page, 7, 15 * 60, 'record_shop');
  await pick(page, '她抱着篮子，杂志堆到篮口');
  expect((await getState(page)).flags['completed.mikoto.magazine']).toBe(true);

  // ---- 卡面第三章：洗衣房（线性） ----
  await jumpTo(page, 10, 19 * 60, 'practice_room');
  await pick(page, '练习室的灯关了，洗衣房还亮着');
  expect((await getState(page)).flags['completed.mikoto.laundry']).toBe(true);

  // ---- 卡面第四章：深夜的事务所（三分支） ----
  await jumpTo(page, 13, 21 * 60, 'office');
  await pick(page, '事务所没开灯，里面有人');
  expect((await getState(page)).flags['completed.mikoto.video']).toBe(true);

  // ---- 卡面第五章：家电送到事务所（线性） ----
  await jumpTo(page, 16, 16 * 60, 'office');
  await pick(page, '事务所门口放着个大纸箱');
  expect((await getState(page)).flags['completed.mikoto.delivery']).toBe(true);

  // ---- 专属行动：陪她买杂志（周二下午，唱片店） ----
  await jumpTo(page, 23, 15 * 60, 'record_shop');
  await page.getByRole('button', { name: /緋田美琴/ }).first().click();
  const beforeMagazine = await getState(page);
  const magazine = page.getByRole('button', { name: '陪她去买要看的杂志' });
  await expect(magazine).toBeVisible();
  await magazine.click();
  await expect.poll(() => phase(page)).toBe('activityResult');

  const afterMagazine = await getState(page);
  expect(beforeMagazine.shared.stamina - afterMagazine.shared.stamina).toBe(5);
  expect(
    afterMagazine.idols[MIKOTO]!.stats.trust.exp -
      beforeMagazine.idols[MIKOTO]!.stats.trust.exp,
  ).toBe(5);

  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 日常话题（8 条） ----
  const topics = PRODUCTION_PACK.actors.find(
    (actor) => actor.id === MIKOTO,
  )!.topics;
  expect(topics).toHaveLength(8);
  const trustBeforeChat = (await getState(page)).idols[MIKOTO]!.stats.trust.exp;
  await page.getByRole('button', { name: '聊两句' }).click();
  await expect.poll(() => phase(page)).toBe('npcResult');
  const said = (await getState(page)).lastResult ?? '';
  expect(topics.map((topic) => topic.text)).toContain(said);
  const afterChat = await getState(page);
  expect(afterChat.idols[MIKOTO]!.stats.trust.exp - trustBeforeChat).toBe(1);
  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 课后事件：表现课之后（她得在练习室） ----
  let fired = false;
  for (const [day, startMinute] of [
    [24, 16 * 60], // 周三：练习室
    [25, 14 * 60], // 周四：练习室
    [27, 16 * 60], // 周六：练习室
  ] as const) {
    await jumpTo(page, day, startMinute, 'practice_room');
    await page.getByRole('button', { name: /緋田美琴/ }).first().click();
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
    'evt.mikoto.after_expression',
  );
  await page.getByRole('button', { name: /看起来很开心。/ }).first().click();
  await expect.poll(() => phase(page)).toBe('eventResult');
  await page.getByRole('button', { name: '继续' }).click();
  await expect
    .poll(
      async () =>
        (await getState(page)).flags['seen:evt.mikoto.after_expression'],
    )
    .toBe(true);

  expect(errors).toEqual([]);
});
