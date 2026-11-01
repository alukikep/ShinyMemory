import { expect, test } from '@playwright/test';
import {
  getState,
  jumpTo,
  openGame,
  reset,
  watchConsole,
} from '../acceptance/helpers';

/**
 * にちか 的第三条线：八雲なみ的致敬演出（セヴン＃ス）。
 *
 * 这条 spec 专门守两件引擎侧的东西：
 * 1. **跨角色闸门**——にちか 一个人招募完之后，事务所里不该出现这场演出；
 *    美琴 也在籍才会出现（`when` 里有两个 `idolStatus`）。
 * 2. **新地点 `hall`**——会场是 `ekimae` 的成员，第三段必须能在那里跑起来。
 */

const NICHIKA = 'nichika';
const MIKOTO = 'mikoto';

const TRIBUTE_OFFER = '事务所来了致敬演出的委托';
const TRIBUTE_RADIO = '电台公开录音的彩排';
const TRIBUTE_GIG = '致敬演出当晚';

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

test('Tribute: gated on both SHHis idols, and the hall location works', async ({
  page,
}) => {
  test.setTimeout(240_000);
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await finishDialogue(page);

  // ---- 先把 にちか 招募进来（两条老链） ----
  await jumpTo(page, 1, 15 * 60, 'record_shop');
  await pick(page, '店员说经理在后场叫你');
  expect((await getState(page)).idols[NICHIKA]?.status).toBe('known');

  await jumpTo(page, 2, 17 * 60, 'office_roof');
  await pick(page, '屋顶上有个人在喊');
  expect((await getState(page)).idols[NICHIKA]?.status).toBe('recruited');

  // ---- 只有 にちか 的时候，事务所里没有这场演出 ----
  await jumpTo(page, 3, 15 * 60, 'office');
  await expect(
    page.getByRole('button', { name: TRIBUTE_OFFER }),
  ).toHaveCount(0);
  expect((await getState(page)).idols[MIKOTO]?.status).toBe('unknown');

  // ---- 再把 美琴 招募进来 ----
  await pick(page, '事务所里有个没见过的女人');
  expect((await getState(page)).idols[MIKOTO]?.status).toBe('known');

  await jumpTo(page, 4, 16 * 60, 'practice_room');
  await pick(page, '她说想看测试');
  expect((await getState(page)).idols[MIKOTO]?.status).toBe('recruited');

  // ---- 第一步：委托（事务所） ----
  await jumpTo(page, 5, 15 * 60, 'office');
  await pick(page, TRIBUTE_OFFER);
  expect((await getState(page)).flags['completed.nichika.tribute.offer']).toBe(
    true,
  );

  // ---- 第二步：公开录音的彩排（录音棚） ----
  await jumpTo(page, 7, 15 * 60, 'studio');
  await pick(page, TRIBUTE_RADIO);
  expect((await getState(page)).flags['completed.nichika.tribute.radio']).toBe(
    true,
  );

  // ---- 第三步：演出当晚（会场） ----
  await jumpTo(page, 9, 18 * 60, 'hall');
  await expect(page.getByText('会场', { exact: false }).first()).toBeVisible();
  await pick(page, TRIBUTE_GIG);

  const after = await getState(page);
  expect(after.flags['completed.nichika.tribute']).toBe(true);
  // ルカ 的招募链挂在这个 flag 上——没写进旗标就等于没解开。
  expect(after.flags['unlocked.tribute_gig']).toBe(true);

  expect(errors).toEqual([]);
});
