import { expect, test } from '@playwright/test';
import { getState, jumpTo, openGame, reset, watchConsole } from '../acceptance/helpers';

/**
 * B6：三步长线 + 分支。
 *
 * 守三件事：
 * 1. 它是由条件解锁的（第 5 天、已招募）
 * 2. 第二步的选择写进 var，第三步台词跟着变
 * 3. 走完设置 resolved flag，压力回落
 */

async function finishDialogue(page: import('@playwright/test').Page) {
  for (let index = 0; index < 60; index += 1) {
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

/** 一直点「继续」，直到出现指定选项。 */
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

async function recruit(page: import('@playwright/test').Page) {
  await finishDialogue(page);
  await jumpTo(page, 1, 12 * 60, 'park');
  await page.getByRole('button', { name: '循着歌声' }).click();
  await finishDialogue(page);
  await jumpTo(page, 3, 12 * 60, 'park');
  await page.getByRole('button', { name: '再次听见歌声' }).click();
  await finishDialogue(page);
}

test('the slump arc branches on how the producer handles it', async ({ page }) => {
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await recruit(page);

  // 第一步：练习室
  await jumpTo(page, 5, 12 * 60, 'practice_room');
  await page.getByRole('button', { name: '练习室里的停顿' }).click();
  await finishDialogue(page);
  expect((await getState(page)).vars['mano.slump']).toBe(1);

  // 第二步：事务所，选「把问题拆开」
  await jumpTo(page, 6, 18 * 60 + 30, 'office');
  await page.getByRole('button', { name: '她在事务所等你的答复' }).click();
  await clickChoice(page, /把问题拆开/);
  await finishDialogue(page);
  const mid = await getState(page);
  expect(mid.vars['mano.slumpApproach']).toBe(1);
  expect(mid.vars['mano.slump']).toBe(2);

  // 第三步：练习室，台词应该走「拆开练」那条变体
  await jumpTo(page, 7, 12 * 60, 'practice_room');
  await page.getByRole('button', { name: '她重新站回练习室' }).click();
  await page.getByRole('button', { name: '继续' }).click();
  await expect(page.getByText(/拆成了三段练/)).toBeVisible();
  await clickChoice(page, /不用收回/);
  await finishDialogue(page);

  const done = await getState(page);
  expect(done.flags['resolved.mano.slump']).toBe(true);
  expect(done.vars['mano.slump']).toBe(3);
  expect(errors).toEqual([]);
});
