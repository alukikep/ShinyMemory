import { expect, test } from '@playwright/test';
import { existsSync } from 'node:fs';
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

// 招募链的对话已迁到审查台；通过之前游戏里没有这些链，跳过。
// 通过后草稿文件消失，测试自动恢复。
const RECRUIT_PENDING = existsSync(
  'content-review/drafts/draft.dialogue.mano.first.json',
);
test.skip(RECRUIT_PENDING, '招募链对话待审');

test('a job needs an idol and ends on a result page', async ({ page }) => {
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await finishDialogue(page);

  // 事务所也有自己的设施面板；工作区第一级 5,000，开局买不起。
  await page.getByRole('button', { name: /事务所管理/ }).click();
  await expect(page.getByRole('dialog', { name: '事务所管理' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '工作区' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '沙发' })).toBeVisible();
  await page.getByRole('button', { name: '关闭事务所管理' }).click();

  // 还没出道：工作面板里没有人能去。
  await page.getByRole('button', { name: '查看可以接的工作' }).click();
  await expect(page.getByRole('dialog', { name: '可以接的工作' })).toBeVisible();
  await page.getByRole('button', { name: /摄影棚拍摄/ }).click();
  expect(await page.getByRole('button', { name: /派 .* 去/ }).count()).toBe(0);
  await page.getByRole('button', { name: '关闭工作面板' }).click();

  // 走两段剧情把真乃招进来。
  await jumpTo(page, 1, 12 * 60, 'park');
  await page.getByRole('button', { name: '循着歌声' }).click();
  await finishDialogue(page);
  await jumpTo(page, 3, 12 * 60, 'park');
  await page.getByRole('button', { name: '再次听见歌声' }).click();
  await finishDialogue(page);
  expect((await getState(page)).idols.mano?.status).toBe('recruited');

  await jumpTo(page, 4, 9 * 60, 'office');
  await page.getByRole('button', { name: '查看可以接的工作' }).click();
  await page.getByRole('button', { name: /摄影棚拍摄/ }).click();
  await page.getByRole('button', { name: /派 樱木真乃 去/ }).click();
  const accepted = await getState(page);
  expect(accepted.jobs).toHaveLength(1);

  // 工作上限是“所有未完成工作”的总数：1/1 时不能再接，
  // 取消后同一天恢复可排。
  await page.getByRole('button', { name: '查看可以接的工作' }).click();
  await expect(page.getByText('已排工作 1/1')).toBeVisible();
  await expect(page.getByText(/占用至/)).toBeVisible();
  await page
    .locator('.job-board-list')
    .getByRole('button', { name: /录音小样/ })
    .click();
  await expect(
    page.getByText('已排满。先完成或取消一份已排工作，或升级事务所工作区。'),
  ).toBeVisible();
  await page.getByRole('button', { name: '取消' }).click();
  await expect(page.getByText('已排工作 0/1')).toBeVisible();
  await page.getByRole('button', { name: '返回' }).click();
  await page
    .locator('.job-board-list')
    .getByRole('button', { name: /摄影棚拍摄/ })
    .click();
  await page.getByRole('button', { name: /派 樱木真乃 去/ }).click();
  expect((await getState(page)).jobs).toHaveLength(1);

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
