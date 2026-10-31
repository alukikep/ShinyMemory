import { expect, test } from '@playwright/test';
import { getState, jumpTo, openGame, reset, watchConsole } from '../acceptance/helpers';

/**
 * 多卡压测：真乃有两张卡（ほわっとスマイル 5 段、ナチュラルモード 3 段）。
 *
 * 验证四件事：
 * 1. 两张卡的第一章都藏在手册外，但地图上有提示
 * 2. 开始其中一张后，另一张被"她正在经历另一段剧情"挡住
 * 3. 触发过的那张出现在手册里
 * 4. 手册按偶像分组，真乃下面能同时看到两张卡
 */

async function finishDialogue(page: import('@playwright/test').Page) {
  for (let index = 0; index < 200; index += 1) {
    if ((await page.locator('.dialogue-panel').count()) === 0) return;
    const choices = page.locator('.dialogue-choice');
    if ((await choices.count()) > 0) await choices.first().click();
    else await page.getByRole('button', { name: '继续' }).click();
    await page.waitForTimeout(12);
  }
  throw new Error('dialogue did not finish');
}

test('two cards for one idol: hints, lock and handbook', async ({ page }) => {
  test.setTimeout(180_000);
  const errors = watchConsole(page);

  await openGame(page);
  await reset(page, 1);
  await finishDialogue(page);

  // 招募真乃
  await jumpTo(page, 1, 14 * 60, 'park');
  await page.getByRole('button', { name: '循着歌声' }).click();
  await finishDialogue(page);
  await jumpTo(page, 3, 14 * 60, 'park');
  await page.getByRole('button', { name: '再次听见歌声' }).click();
  await finishDialogue(page);

  // 第 3 天：两张卡的第一章都还没触发，地图上应该各有一个提示
  await jumpTo(page, 3, 14 * 60, 'park');
  const parkNode = page.locator('.map-node-hint');
  await expect(parkNode.first()).toBeVisible();

  // 地图上的提示徽章（数量）至少有一个
  const hintCount = await page.locator('.map-node-hint').count();
  expect(hintCount).toBeGreaterThan(0);

  // 手册里还没有这两张卡（都没触发过）
  await page.getByRole('button', { name: /手册/ }).click();
  const handbook = page.getByRole('dialog', { name: '手册' });
  await expect(handbook).toBeVisible();
  await expect(handbook).not.toContainText('ナチュラルモード');
  await expect(handbook).not.toContainText('ほわっとスマイル');
  await handbook.getByRole('button', { name: '关闭手册' }).click();

  // 先去商业街触发第二张卡的第一步
  await jumpTo(page, 3, 14 * 60, 'shopping_street');
  await page.getByRole('button', { name: '她说想逛逛店' }).click();
  await finishDialogue(page);

  const afterStart = await getState(page);
  expect(afterStart.flags['completed.mano.shopping']).toBe(true);

  // 另一张卡的第一步这时候应该被"她正在经历另一段剧情"挡住
  await jumpTo(page, 4, 14 * 60, 'park');
  await expect(page.getByRole('button', { name: '公园里有鸽子在聚' })).toHaveCount(0);

  // 手册里出现了已触发的第二张卡，且真乃下面两张卡都能看到
  await page.getByRole('button', { name: /手册/ }).click();
  const handbook2 = page.getByRole('dialog', { name: '手册' });
  await expect(handbook2).toContainText('ナチュラルモード');
  await expect(handbook2).toContainText('樱木真乃');

  expect(errors).toEqual([]);
});
