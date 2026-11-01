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
 * 斑鳩ルカ 的招募链（门口三步）。
 *
 * 这条 spec 守的是**链的入口**：致敬演出没打完，公寓走廊里不该出现任何行动；
 * `unlocked.tribute_gig` 之后才出现，走完三步她进名册。
 *
 * 前置是 SHHis 的致敬演出，所以整条 spec 得先从招募 SHHis 两个人开始。
 */

const NICHIKA = 'nichika';
const MIKOTO = 'mikoto';
const LUCA = 'luca';

const DOOR_1 = '把便当挂在她家门把上';

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

test('Luca: door recruitment opens only after the tribute gig', async ({
  page,
}) => {
  test.setTimeout(300_000);
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await finishDialogue(page);

  // ---- 前置：招募 にちか 与 美琴 ----
  await jumpTo(page, 1, 15 * 60, 'record_shop');
  await pick(page, '店员说经理在后场叫你');
  await jumpTo(page, 2, 17 * 60, 'office_roof');
  await pick(page, '屋顶上有个人在喊');

  await jumpTo(page, 3, 14 * 60, 'office');
  await pick(page, '事务所里有个没见过的女人');
  await jumpTo(page, 4, 16 * 60, 'practice_room');
  await pick(page, '她说想看测试');
  expect((await getState(page)).idols[MIKOTO]?.status).toBe('recruited');

  // ---- 还没有致敬演出：门口什么都不该有 ----
  await jumpTo(page, 5, 19 * 60, 'apartment');
  await expect(page.getByRole('button', { name: DOOR_1 })).toHaveCount(0);
  expect((await getState(page)).idols[LUCA]?.status).toBe('unknown');

  // ---- 打完致敬演出 ----
  await jumpTo(page, 6, 15 * 60, 'office');
  await pick(page, '事务所来了致敬演出的委托');
  await jumpTo(page, 8, 15 * 60, 'studio');
  await pick(page, '电台公开录音的彩排');
  await jumpTo(page, 10, 18 * 60, 'hall');
  await pick(page, '致敬演出当晚');
  expect((await getState(page)).flags['unlocked.tribute_gig']).toBe(true);

  // ---- 第一步：经纪人交接，第一次照面 ----
  await jumpTo(page, 12, 19 * 60, 'apartment');
  await pick(page, DOOR_1);
  expect((await getState(page)).idols[LUCA]?.status).toBe('known');
  expect((await getState(page)).flags['completed.luca.door1']).toBe(true);

  // ---- 第二步：她点名「妈妈做的拿坡里意面」 ----
  await jumpTo(page, 14, 19 * 60, 'apartment');
  await pick(page, '她说了一样你弄不到的东西');
  expect((await getState(page)).flags['completed.luca.door2']).toBe(true);

  // ---- 第三步：发烧、はづき、招募完成 ----
  await jumpTo(page, 16, 19 * 60, 'apartment');
  await pick(page, '第三次，她发着烧');

  const after = await getState(page);
  expect(after.flags['completed.luca.door3']).toBe(true);
  expect(after.idols[LUCA]?.status).toBe('recruited');

  // 名册里能看到她
  await page.getByRole('button', { name: /偶像名册/ }).first().click();
  const roster = page.getByRole('dialog', { name: '偶像名册' });
  await expect(
    roster.locator('.roster-card', { hasText: '斑鳩ルカ' }),
  ).toBeVisible();
  await page.getByRole('button', { name: '关闭偶像名册' }).click();

  // ---- 卡面【broken shout】五章 ----
  await jumpTo(page, 18, 17 * 60, 'office');
  await pick(page, '她跟着跑完了一整天的电视台');
  expect((await getState(page)).flags['completed.luca.broken']).toBe(true);

  await jumpTo(page, 20, 16 * 60, 'station');
  await pick(page, '站前的喫茶店里，她一个人坐着');
  expect((await getState(page)).flags['completed.luca.cafe']).toBe(true);

  await jumpTo(page, 22, 15 * 60, 'studio');
  await pick(page, '采访中途，她停住了');
  expect((await getState(page)).flags['completed.luca.interview']).toBe(true);

  await jumpTo(page, 24, 19 * 60, 'hall');
  await pick(page, '小型 live，音响全坏了');
  expect((await getState(page)).flags['completed.luca.live']).toBe(true);

  await jumpTo(page, 25, 19 * 60, 'hall');
  await pick(page, '第二天的会场，她来得比谁都晚');
  expect((await getState(page)).flags['completed.luca.bare']).toBe(true);

  // ---- 专属行动与话题 ----
  // 周日 13:00–22:00 她在练习室（周五晚上她在会场，别用 26 号）
  await jumpTo(page, 28, 19 * 60, 'practice_room');
  await page.getByRole('button', { name: /斑鳩ルカ/ }).first().click();
  await expect(
    page.getByRole('button', { name: '陪她在练习室待到关灯' }),
  ).toBeVisible();

  const topics = PRODUCTION_PACK.actors.find(
    (actor) => actor.id === LUCA,
  )!.topics;
  expect(topics).toHaveLength(8);

  // 三个训练后事件都在包里
  const events = PRODUCTION_PACK.events.filter((event) =>
    event.id.startsWith('evt.luca.'),
  );
  expect(events).toHaveLength(3);

  expect(errors).toEqual([]);
});
