import { expect, test } from '@playwright/test';
import { getState, jumpTo, openGame, reset, watchConsole } from '../acceptance/helpers';
import { PRODUCTION_PACK } from '../../src/core/productionPack';

/**
 * 円香：喫茶店审问 → 宣材写真 → 小舞台；卡面五章；喫茶店 / 话题 / 课后事件。
 */

const MADOKA = 'madoka';

async function finishDialogue(page: import('@playwright/test').Page) {
  for (let index = 0; index < 300; index += 1) {
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

test('Madoka: cafe, shoot, street; five card chapters, tea and an event', async ({
  page,
}) => {
  test.setTimeout(240_000);
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await finishDialogue(page);

  // ---- 第 1 步：站前的喫茶店 ----
  await jumpTo(page, 1, 16 * 60 + 30, 'station');
  await pick(page, '站前的喫茶店，有人一直看着你');
  expect((await getState(page)).idols[MADOKA]?.status).toBe('known');

  // ---- 第 2 步：第一次宣材写真 ----
  await jumpTo(page, 3, 14 * 60, 'studio');
  await pick(page, '第一次宣材写真');

  // ---- 第 3 步：CD 店门口的小舞台（三分支） ----
  await jumpTo(page, 4, 17 * 60, 'shopping_street');
  await pick(page, 'CD 店门口的小舞台');
  expect((await getState(page)).idols[MADOKA]?.status).toBe('recruited');

  // ---- 名册 / 日程表 ----
  await page.getByRole('button', { name: /偶像名册/ }).first().click();
  const roster = page.getByRole('dialog', { name: '偶像名册' });
  await expect(roster.locator('.roster-card', { hasText: '樋口円香' })).toBeVisible();
  await page.getByRole('button', { name: '关闭偶像名册' }).click();

  await page.getByRole('button', { name: /日程表/ }).first().click();
  const schedule = page.getByRole('dialog', { name: '偶像日程表' });
  await expect(schedule.getByRole('tab', { name: /樋口円香/ })).toBeVisible();
  await page.getByRole('button', { name: '关闭日程表' }).click();

  // ---- 卡面第一章：拿错的咖啡（三分支） ----
  await jumpTo(page, 4, 19 * 60, 'office');
  await pick(page, '她拿起桌上的咖啡');
  expect((await getState(page)).flags['completed.madoka.coffee']).toBe(true);

  // ---- 卡面第二章：水边外景（三分支） ----
  await jumpTo(page, 7, 15 * 60, 'seaside');
  await pick(page, '外景下见，她沿着水边走');
  expect((await getState(page)).flags['completed.madoka.walk']).toBe(true);

  // ---- 卡面第三章：练习室的人走光了（三分支） ----
  await jumpTo(page, 10, 19 * 60, 'practice_room');
  await pick(page, '练习室的人走光了');
  expect((await getState(page)).flags['completed.madoka.blanket']).toBe(true);

  // ---- 卡面第四章：桌上的签名草稿 ----
  await jumpTo(page, 13, 19 * 60, 'office');
  await pick(page, '桌上放着一张签名的草稿');
  expect((await getState(page)).flags['completed.madoka.sign']).toBe(true);

  // ---- 卡面第五章：收工后的车 ----
  await jumpTo(page, 16, 18 * 60, 'studio');
  await pick(page, '收工之后，车还停在摄影棚外');
  expect((await getState(page)).flags['completed.madoka.exception']).toBe(true);

  // ---- 专属行动：陪她在喫茶店（周五傍晚，站前） ----
  await jumpTo(page, 19, 16 * 60 + 45, 'station');
  await page.getByRole('button', { name: /樋口円香/ }).first().click();
  const beforeTea = await getState(page);
  const tea = page.getByRole('button', { name: '陪她在喫茶店坐一会儿' });
  await expect(tea).toBeVisible();
  await tea.click();
  await expect.poll(() => phase(page)).toBe('activityResult');

  const afterTea = await getState(page);
  expect(beforeTea.shared.stamina - afterTea.shared.stamina).toBe(5);
  expect(
    afterTea.idols[MADOKA]!.stats.trust.exp -
      beforeTea.idols[MADOKA]!.stats.trust.exp,
  ).toBe(5);

  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 日常话题（8 条） ----
  const topics = PRODUCTION_PACK.actors.find((actor) => actor.id === MADOKA)!
    .topics;
  expect(topics).toHaveLength(8);
  const trustBeforeChat = (await getState(page)).idols[MADOKA]!.stats.trust.exp;
  await page.getByRole('button', { name: '聊两句' }).click();
  await expect.poll(() => phase(page)).toBe('npcResult');
  const said = (await getState(page)).lastResult ?? '';
  expect(topics.map((topic) => topic.text)).toContain(said);
  const afterChat = await getState(page);
  expect(afterChat.idols[MADOKA]!.stats.trust.exp - trustBeforeChat).toBe(1);
  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 课后事件：表演课之后（她得在练习室） ----
  let fired = false;
  for (const [day, startMinute] of [
    [23, 17 * 60], // 周二：练习室
    [25, 19 * 60], // 周四：练习室
    [26, 19 * 60], // 周五：练习室
  ] as const) {
    await jumpTo(page, day, startMinute, 'practice_room');
    await page.getByRole('button', { name: /樋口円香/ }).first().click();
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
    'evt.madoka.after_expression',
  );
  await page.getByRole('button', { name: /为什么不行？/ }).first().click();
  await expect.poll(() => phase(page)).toBe('eventResult');
  await page.getByRole('button', { name: '继续' }).click();
  await expect
    .poll(async () => (await getState(page)).flags['seen:evt.madoka.after_expression'])
    .toBe(true);

  expect(errors).toEqual([]);
});
