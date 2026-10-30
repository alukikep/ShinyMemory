import { expect, test } from '@playwright/test';
import { getState, jumpTo, openGame, reset, watchConsole } from '../acceptance/helpers';

/**
 * 灯织长线「千里的距离」：三步，第二步的选择决定第三步的台词。
 * 改编自 G.R.A.D.編。
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

test('Hiori arc: distance, no answer, keep walking', async ({ page }) => {
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await finishDialogue(page);

  // 招募灯织
  await jumpTo(page, 1, 14 * 60, 'practice_room');
  await page.getByRole('button', { name: '练习室里的人在数拍子' }).click();
  await finishDialogue(page);
  await jumpTo(page, 3, 19 * 60, 'office');
  await page.getByRole('button', { name: '她来事务所问了一句话' }).click();
  await finishDialogue(page);
  expect((await getState(page)).idols.hiori?.status).toBe('recruited');

  // 第一步：橱窗前的广告牌
  await jumpTo(page, 6, 18 * 60 + 30, 'shopping_street');
  await page.getByRole('button', { name: '橱窗前的广告牌' }).click();
  await finishDialogue(page);
  expect((await getState(page)).vars['hiori.gap']).toBe(1);

  // 第二步：收录结束后她没走
  await jumpTo(page, 7, 19 * 60, 'studio');
  await page.getByRole('button', { name: '收录结束后她没走' }).click();
  await clickChoice(page, /你从不敷衍自己/);
  await finishDialogue(page);
  expect((await getState(page)).vars['hiori.gapApproach']).toBe(2);

  // 第三步：台词走「不敷衍自己」那条变体
  await jumpTo(page, 8, 12 * 60, 'practice_room');
  await page.getByRole('button', { name: '她按下了播放键' }).click();
  await page.getByRole('button', { name: '继续' }).click();
  await expect(page.getByText(/不敷衍自己——如果是这个/)).toBeVisible();
  await finishDialogue(page);

  const done = await getState(page);
  expect(done.flags['resolved.hiori.gap']).toBe(true);
  expect(done.vars['hiori.gap']).toBe(3);
  expect(errors).toEqual([]);
});
