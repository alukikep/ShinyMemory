import { expect, test } from '@playwright/test';
import {
  getState,
  jumpTo,
  openGame,
  reset,
  watchConsole,
} from '../acceptance/helpers';

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

  expect(errors).toEqual([]);
});
