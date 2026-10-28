import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import {
  getState,
  jumpTo,
  openGame,
  reset,
  watchConsole,
} from '../acceptance/helpers';

async function finishDialogue(page: Page) {
  for (let i = 0; i < 60; i += 1) {
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

test('falling out with Mano, then making up', async ({ page }) => {
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await finishDialogue(page);

  // 序章之后：两次公园相遇，招募真乃
  await jumpTo(page, 1, 12 * 60, 'park');
  await page.getByRole('button', { name: '循着歌声' }).click();
  await finishDialogue(page);
  await jumpTo(page, 3, 12 * 60, 'park');
  await page.getByRole('button', { name: '再次听见歌声' }).click();
  await finishDialogue(page);
  expect((await getState(page)).idols.mano?.status).toBe('recruited');

  // 一次声乐课之后，争执事件必定出现
  await jumpTo(page, 4, 12 * 60, 'practice_room');
  await page.getByRole('button', { name: /樱木真乃/ }).click();
  await page.getByRole('button', { name: /^声乐课/ }).click();
  await page.getByRole('button', { name: '继续' }).click();
  await expect
    .poll(async () => (await getState(page)).pendingEventId)
    .toBe('evt.mano_quarrel');

  await page.getByRole('button', { name: '道歉' }).click();
  await page.getByRole('button', { name: '继续' }).click();

  const afterFight = await getState(page);
  expect(afterFight.flags.mano_rift).toBe(true);
  expect(afterFight.actors.mano?.scheduleOverrides?.length).toBe(2);

  // 手册里立刻能看到这条线
  await page.getByRole('button', { name: /手册/ }).click();
  const handbook = page.getByRole('dialog', { name: '手册' });
  await expect(handbook).toContainText('话说重了');
  await expect(handbook).toContainText('和社长商量');
  await page.getByRole('button', { name: '关闭手册' }).click();

  // 事务所 → 商业街
  await jumpTo(page, 4, 13 * 60, 'office');
  await page.getByRole('button', { name: '和社长商量' }).click();
  await finishDialogue(page);
  expect((await getState(page)).storyChains['mano-rift']?.stepIndex).toBe(1);

  await jumpTo(page, 4, 15 * 60, 'shopping_street');
  await page.getByRole('button', { name: '挑一束花' }).click();
  await finishDialogue(page);
  const afterGift = await getState(page);
  expect(afterGift.storyChains['mano-rift']?.stepIndex).toBe(2);
  expect(afterGift.storyChains['mano-rift']?.nextEligibleDay).toBe(6);

  // 第 6 天，她出现在公园
  await jumpTo(page, 6, 12 * 60, 'park');
  await expect(page.getByRole('button', { name: '去公园' })).toBeVisible();
  await page.getByRole('button', { name: '去公园' }).click();
  await finishDialogue(page);

  const done = await getState(page);
  expect(done.storyChains['mano-rift']?.completed).toBe(true);
  expect(done.flags.mano_rift).toBe(false);

  expect(errors).toEqual([]);
});
