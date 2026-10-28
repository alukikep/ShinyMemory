import { expect, test } from '@playwright/test';
import { jumpTo, openGame, reset } from './helpers';

test('debug panel explains why a story chain is blocked', async ({ page }) => {
  await openGame(page);
  await reset(page, 1);

  const panel = page.locator('.debug-panel');
  await expect(panel).toBeVisible();
  await expect(panel).toContainText('剧情链');
  await expect(panel).toContainText('风野灯织 · 在长椅旁停下');
  await expect(panel).toContainText('地点不对');

  await jumpTo(page, 1, 12 * 60, 'park');
  await expect(panel).toContainText('可以触发（手册里还没显示）');
});
