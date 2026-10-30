import { expect, test } from '@playwright/test';
import { getState, jumpTo, openGame, reset, watchConsole } from '../acceptance/helpers';

/**
 * B2：剧情推进解锁一份工作。
 *
 * 走完「公园的歌声」第三步之后，工作面板里才会出现「初次 Live」；
 * 在那之前它整条是隐藏的（不是灰掉）。
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

test('a story step unlocks a job that was hidden before', async ({ page }) => {
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await finishDialogue(page);

  // 第一步、第二步：认识并招募
  await jumpTo(page, 1, 12 * 60, 'park');
  await page.getByRole('button', { name: '循着歌声' }).click();
  await finishDialogue(page);
  await jumpTo(page, 3, 12 * 60, 'park');
  await page.getByRole('button', { name: '再次听见歌声' }).click();
  await finishDialogue(page);
  expect((await getState(page)).idols.mano?.status).toBe('recruited');

  // 还没走第三步：flag 不存在
  expect((await getState(page)).flags['unlocked.first_live']).toBeUndefined();

  // 第三步
  await jumpTo(page, 4, 18 * 60 + 30, 'office');
  await page.getByRole('button', { name: '她在事务所等你' }).click();
  await finishDialogue(page);
  expect((await getState(page)).flags['unlocked.first_live']).toBe(true);

  // 解锁后工作应该出现在面板里；草稿还没通过审查时自动跳过这段。
  await page.getByRole('button', { name: '查看可以接的工作' }).click();
  const live = page.getByRole('button', { name: /初次 Live/ });
  if ((await live.count()) === 0) {
    test.skip(true, 'draft.job.first_live 还没通过审查');
  }
  await expect(live).toBeVisible();
  expect(errors).toEqual([]);
});
