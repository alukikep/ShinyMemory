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
 * 鈴木羽那 的招募链。
 *
 * 前置比 ルカ 还长一层：致敬演出 → ルカ → 羽那。
 * 这条 spec 除了走完四步，还要守住"闸门真的挡人"——
 * ルカ 没招募之前，事务所里不该出现那条视频。
 */

const NICHIKA = 'nichika';
const MIKOTO = 'mikoto';
const LUCA = 'luca';
const HANA = 'hana';

const VIDEO = 'SNS 上推来一条视频';

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

/** 前置：招募 にちか / 美琴，打完致敬演出，再把 ルカ 从门口带回来。 */
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

test('Hana: video, DM, arrival, dorm — gated on Luca', async ({ page }) => {
  test.setTimeout(360_000);
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await finishDialogue(page);

  // ---- 闸门：谁都没招的时候，事务所没有那条视频 ----
  await jumpTo(page, 1, 11 * 60, 'office');
  await expect(page.getByRole('button', { name: VIDEO })).toHaveCount(0);
  expect((await getState(page)).idols[HANA]?.status).toBe('unknown');

  await reachLuca(page);

  // ---- 第一步：刷到视频 ----
  await jumpTo(page, 18, 11 * 60, 'office');
  await pick(page, VIDEO);
  expect((await getState(page)).idols[HANA]?.status).toBe('known');
  expect((await getState(page)).flags['completed.hana.video']).toBe(true);

  // ---- 第二步：私信 + 电话 ----
  await jumpTo(page, 19, 19 * 60, 'office');
  await pick(page, '给发视频的账号发一条私信');
  expect((await getState(page)).flags['completed.hana.dm']).toBe(true);

  // ---- 第三步：上京那天（要等 10 天） ----
  await jumpTo(page, 30, 15 * 60, 'station');
  await pick(page, '上京那天，去车站接她');
  expect((await getState(page)).flags['completed.hana.arrival']).toBe(true);

  // ---- 第四步：宿舍 ----
  await jumpTo(page, 31, 18 * 60, 'dorm');
  await pick(page, '带她看宿舍');

  const after = await getState(page);
  expect(after.flags['completed.hana.dorm']).toBe(true);
  expect(after.idols[HANA]?.status).toBe('recruited');

  await page.getByRole('button', { name: /偶像名册/ }).first().click();
  const roster = page.getByRole('dialog', { name: '偶像名册' });
  await expect(
    roster.locator('.roster-card', { hasText: '鈴木羽那' }),
  ).toBeVisible();
  await page.getByRole('button', { name: '关闭偶像名册' }).click();

  // ---- 卡面【Scene With You】五章 ----
  await jumpTo(page, 33, 16 * 60, 'studio');
  await pick(page, '收录结束了，工作人员想拍 off-shot');
  expect((await getState(page)).flags['completed.hana.offshot']).toBe(true);

  await jumpTo(page, 35, 14 * 60, 'office');
  await pick(page, '游乐场的合作说明会');
  expect((await getState(page)).flags['completed.hana.parkoffer']).toBe(true);

  // 游乐园是这一轮新加的地点：两章都在这里
  await jumpTo(page, 37, 9 * 60, 'theme_park');
  await pick(page, '开园前的园区，她说要拍大头贴');
  expect((await getState(page)).flags['completed.hana.purikura']).toBe(true);

  await jumpTo(page, 38, 12 * 60, 'theme_park');
  await pick(page, '可丽饼摊前，她要你也吃一口');
  expect((await getState(page)).flags['completed.hana.crepe']).toBe(true);

  await jumpTo(page, 40, 19 * 60, 'office');
  await pick(page, '她烧得有点迷糊');
  expect((await getState(page)).flags['completed.hana.fever']).toBe(true);

  // ---- 专属行动与话题 ----
  await jumpTo(page, 41, 15 * 60, 'practice_room');
  await page.getByRole('button', { name: /鈴木羽那/ }).first().click();
  await expect(
    page.getByRole('button', { name: '陪她练拍照的姿势' }),
  ).toBeVisible();

  const topics = PRODUCTION_PACK.actors.find((actor) => actor.id === HANA)!.topics;
  expect(topics).toHaveLength(8);

  const events = PRODUCTION_PACK.events.filter((event) =>
    event.id.startsWith('evt.hana.'),
  );
  expect(events).toHaveLength(3);

  expect(errors).toEqual([]);
});
