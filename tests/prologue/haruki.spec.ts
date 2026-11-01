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
 * 郁田はるき 的招募链。
 *
 * 前置：致敬演出 → ルカ → はるき。
 * 这条 spec 守住"闸门真的挡人"——ルカ 没招募之前，会场里不该出现她。
 */

const LUCA = 'luca';
const HARUKI = 'haruki';

const FLYER = '会场里有个抱着贝斯的女孩';

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

async function reachLuca(page: import('@playwright/test').Page) {
  await jumpTo(page, 1, 15 * 60, 'record_shop');
  await pick(page, '店员说经理在后场叫你');
  await jumpTo(page, 2, 17 * 60, 'office_roof');
  await pick(page, '屋顶上有个人在喊');
  await jumpTo(page, 3, 14 * 60, 'office');
  await pick(page, '事务所里有个没见过的女人');
  await jumpTo(page, 4, 16 * 60, 'practice_room');
  await pick(page, '她说想看测试');
  await jumpTo(page, 6, 15 * 60, 'office');
  await pick(page, '事务所来了致敬演出的委托');
  await jumpTo(page, 8, 15 * 60, 'studio');
  await pick(page, '电台公开录音的彩排');
  await jumpTo(page, 10, 18 * 60, 'hall');
  await pick(page, '致敬演出当晚');
  await jumpTo(page, 12, 19 * 60, 'apartment');
  await pick(page, '把便当挂在她家门把上');
  await jumpTo(page, 14, 19 * 60, 'apartment');
  await pick(page, '她说了一样你弄不到的东西');
  await jumpTo(page, 16, 19 * 60, 'apartment');
  await pick(page, '第三次，她发着烧');
  expect((await getState(page)).idols[LUCA]?.status).toBe('recruited');
}

test('Haruki: creator event, stage chase, trainee night, father answer', async ({
  page,
}) => {
  test.setTimeout(360_000);
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await finishDialogue(page);

  // ---- 闸门：ルカ 还没招募的时候，会场里没有她 ----
  await jumpTo(page, 1, 13 * 60, 'hall');
  await expect(page.getByRole('button', { name: FLYER })).toHaveCount(0);
  expect((await getState(page)).idols[HARUKI]?.status).toBe('unknown');

  await reachLuca(page);

  // ---- 第一步：会场发传单 ----
  await jumpTo(page, 18, 13 * 60, 'hall');
  await pick(page, FLYER);
  expect((await getState(page)).idols[HARUKI]?.status).toBe('known');
  expect((await getState(page)).flags['completed.haruki.flyer']).toBe(true);

  // ---- 第二步：她追下台 ----
  await jumpTo(page, 19, 17 * 60, 'hall');
  await pick(page, '演出结束后，她从台上追了出来');
  expect((await getState(page)).flags['completed.haruki.stage']).toBe(true);

  // ---- 第三步：见习期的晚上 ----
  await jumpTo(page, 21, 20 * 60, 'practice_room');
  await pick(page, '见习期的晚上，她一个人还在练');
  expect((await getState(page)).flags['completed.haruki.training']).toBe(true);

  // ---- 第四步：父亲的答复 ----
  await jumpTo(page, 23, 18 * 60, 'office');
  await pick(page, '她带着父亲的答复来了');

  const after = await getState(page);
  expect(after.flags['completed.haruki.answer']).toBe(true);
  expect(after.idols[HARUKI]?.status).toBe('recruited');

  await page.getByRole('button', { name: /偶像名册/ }).first().click();
  const roster = page.getByRole('dialog', { name: '偶像名册' });
  await expect(
    roster.locator('.roster-card', { hasText: '郁田はるき' }),
  ).toBeVisible();
  await page.getByRole('button', { name: '关闭偶像名册' }).click();

  // ---- 卡面【Hopeland】五章 ----
  await jumpTo(page, 25, 15 * 60, 'shopping_street');
  await pick(page, '书店里她挑杂志挑了很久');
  expect((await getState(page)).flags['completed.haruki.books']).toBe(true);

  await jumpTo(page, 27, 16 * 60, 'studio');
  await pick(page, '棚里找不到人，她睡在地板上');
  expect((await getState(page)).flags['completed.haruki.nap']).toBe(true);

  await jumpTo(page, 29, 17 * 60, 'park');
  await pick(page, '收工后，她想在海边多待一会儿');
  expect((await getState(page)).flags['completed.haruki.seaside']).toBe(true);

  await jumpTo(page, 31, 10 * 60, 'office');
  await pick(page, '签名会前，她抱着一叠信');
  expect((await getState(page)).flags['completed.haruki.letters']).toBe(true);

  await jumpTo(page, 33, 16 * 60, 'hall');
  await pick(page, '共演的后台，有人念错了她的名字');
  expect((await getState(page)).flags['completed.haruki.name']).toBe(true);

  // ---- 专属行动与话题 ----
  // 她在公园只在周六上午（双周轮换的另一周是画廊街），所以试两个周六
  let sawAction = false;
  for (const day of [34, 41]) {
    await jumpTo(page, day, 11 * 60, 'park');
    const idolButton = page.getByRole('button', { name: /郁田はるき/ }).first();
    if ((await idolButton.count()) === 0) continue;
    await idolButton.click();
    if ((await page.getByRole('button', { name: '陪她在公园写生' }).count()) > 0) {
      sawAction = true;
      break;
    }
  }
  expect(sawAction).toBe(true);

  const topics = PRODUCTION_PACK.actors.find((a) => a.id === HARUKI)!.topics;
  expect(topics).toHaveLength(8);
  const events = PRODUCTION_PACK.events.filter((e) => e.id.startsWith('evt.haruki.'));
  expect(events).toHaveLength(3);

  expect(errors).toEqual([]);
});
