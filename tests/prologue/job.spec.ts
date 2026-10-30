import { expect, test } from '@playwright/test';
import { getState, jumpTo, openGame, reset, watchConsole } from '../acceptance/helpers';

/**
 * 工作的完整闭环：事务所接 → 到现场做 → 结果页。
 *
 * 守两条真实问题：
 * 1. 没有出道的偶像时，事务所不该出现"接下"（工作是她去做的）。
 * 2. 做完要走结果页，而不是把一句日志丢回安排页。
 */

async function finishDialogue(page: import('@playwright/test').Page) {
  for (let index = 0; index < 40; index += 1) {
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

test('a job needs an idol and ends on a result page', async ({ page }) => {
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await finishDialogue(page);

  // 还没出道：没有人能去做这份工作。
  expect(await page.getByRole('button', { name: /接下：/ }).count()).toBe(0);

  // 走两段剧情把真乃招进来。
  await jumpTo(page, 1, 12 * 60, 'park');
  await page.getByRole('button', { name: '循着歌声' }).click();
  await finishDialogue(page);
  await jumpTo(page, 3, 12 * 60, 'park');
  await page.getByRole('button', { name: '再次听见歌声' }).click();
  await finishDialogue(page);
  expect((await getState(page)).idols.mano?.status).toBe('recruited');

  await jumpTo(page, 4, 9 * 60, 'office');
  await page.getByRole('button', { name: /接下：摄影棚拍摄/ }).click();
  const accepted = await getState(page);
  expect(accepted.jobs).toHaveLength(1);

  await jumpTo(page, 5, 10 * 60 + 30, 'studio');
  const before = await getState(page);
  await page.getByRole('button', { name: /参与：摄影棚拍摄/ }).click();

  await expect
    .poll(async () => (await getState(page)).phase, { timeout: 5_000 })
    .toBe('activityResult');

  const after = await getState(page);
  expect(after.jobs).toHaveLength(0);
  // 有检定：成功 1200，失败按 40% 结算 480。
  expect([1200, 480]).toContain(after.money - before.money);
  expect(after.lastResult).toContain('收入 ¥');
  await expect(page.getByRole('button', { name: '继续' })).toBeVisible();
  expect(errors).toEqual([]);
});
