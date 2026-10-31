import { expect, test } from '@playwright/test';
import { existsSync } from 'node:fs';
import { getState, jumpTo, openGame, reset, watchConsole } from '../acceptance/helpers';

/**
 * 八宫巡：招募 + 长线（W.I.N.G. 改编）。
 * 守三件事：招募链能走通；长线三步按 var 分支；走完有 resolved flag。
 */

async function finishDialogue(page: import('@playwright/test').Page) {
  for (let index = 0; index < 80; index += 1) {
    if ((await page.locator('.dialogue-panel').count()) === 0) return;
    const choices = page.locator('.dialogue-choice');
    if ((await choices.count()) > 0) {
      await choices.first().click();
    } else {
      await page.getByRole('button', { name: '继续' }).click();
    }
    await page.waitForTimeout(20);
  }
  throw new Error('dialogue did not finish');
}

async function clickChoice(page: import('@playwright/test').Page, name: RegExp) {
  for (let index = 0; index < 40; index += 1) {
    const choice = page.getByRole('button', { name });
    if ((await choice.count()) > 0) {
      await choice.first().click();
      return;
    }
    await page.getByRole('button', { name: '继续' }).click();
    await page.waitForTimeout(20);
  }
  throw new Error('choice never appeared');
}

// 这条长线的对话已迁到审查台；未通过之前游戏里没有这些链，跳过。
// 通过后草稿文件消失，测试自动恢复。
const pendingReview = existsSync(`content-review/drafts/draft.dialogue.meguru.burden.first.json`);
test.skip(pendingReview, '对话在审查台待审：通过后自动启用');

test('Meguru: recruit, then the burden arc', async ({ page }) => {
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await finishDialogue(page);

  // 招募：球场 → 她提前来
  await jumpTo(page, 1, 14 * 60, 'park');
  await page.getByRole('button', { name: '球场上有人在喊' }).click();
  await finishDialogue(page);
  expect((await getState(page)).idols.meguru?.status).toBe('known');

  await jumpTo(page, 3, 10 * 60, 'office');
  await page.getByRole('button', { name: '她提前来了' }).click();
  await finishDialogue(page);
  expect((await getState(page)).idols.meguru?.status).toBe('recruited');

  // 长线第一步：她还在球场上
  await jumpTo(page, 5, 17 * 60, 'park');
  await page.getByRole('button', { name: '她还在球场上' }).click();
  await finishDialogue(page);
  expect((await getState(page)).vars['meguru.burden']).toBe(1);

  // 第二步：她说不用取消
  await jumpTo(page, 6, 19 * 60, 'office');
  await page.getByRole('button', { name: '她说不用取消' }).click();
  await clickChoice(page, /哪一格是空的/);
  await finishDialogue(page);
  expect((await getState(page)).vars['meguru.burdenApproach']).toBe(1);

  // 第三步：台词走「一格都没有空」那条变体
  await jumpTo(page, 7, 12 * 60, 'practice_room');
  await page.getByRole('button', { name: /她第一次说了/ }).click();
  await page.getByRole('button', { name: '继续' }).click();
  await expect(page.getByText(/确实一格都没有空/)).toBeVisible();
  await finishDialogue(page);

  const done = await getState(page);
  expect(done.flags['resolved.meguru.burden']).toBe(true);
  expect(done.vars['meguru.burden']).toBe(3);
  expect(errors).toEqual([]);
});
