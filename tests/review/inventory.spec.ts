import { expect, test } from '@playwright/test';

test('content inventory shows live counts, revisions, filters and read failures', async ({ page }) => {
  await page.goto('/review.html');
  await page.getByRole('button', { name: '内容档案', exact: true }).click();
  const summary = page.getByRole('region', { name: '角色内容汇总' });
  await expect(summary).toContainText('2/2');
  await expect(summary).toContainText('8/8/8');
  await page.getByLabel('档案类型').selectOption('activity');
  const cooking = page.locator('.inventory-entry').filter({ hasText: '看她做饭' });
  await cooking.locator('summary').click();
  await expect(cooking).toContainText('待修改 · 未接入');
  await expect(cooking).toContainText('content-review/revisions/draft.activity.mano.cooking.json');
  await page.getByLabel('档案偶像').selectOption('hiori');
  await expect(summary).toContainText('1/1');
  await expect(cooking).toHaveCount(0);
  await page.getByLabel('档案范围').selectOption('unresolved');
  await page.getByLabel('档案类型').selectOption('all');
  await expect(page.locator('.inventory-entry')).toContainText('dialogue.prologue.office');
  await page.route('**/api/review/inventory', route => route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: '档案读取失败测试' }) }));
  await page.getByRole('button', { name: '刷新档案' }).click();
  await expect(page.getByRole('alert')).toContainText('档案读取失败测试');
  await page.unroute('**/api/review/inventory');
  await page.getByRole('button', { name: '刷新档案' }).click();
  await expect(summary).toBeVisible();
  await page.screenshot({ path: 'test-results/inventory-panel.png', fullPage: true });
  await page.getByRole('button', { name: '返回审查队列' }).click();
  await expect(page.locator('.review-queue')).toBeVisible();
});
