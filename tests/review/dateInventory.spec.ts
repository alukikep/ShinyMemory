import { expect, test } from '@playwright/test';

test('inventory lists date configuration separately from approved dialogue production', async ({ page }) => {
  await page.route('**/api/review/inventory', async route => {
    const response = await route.fetch();
    const report = await response.json();
    report.dateScenarios = [{ id: 'fixture.ui.date', title: '【机制测试】约会关联', idolId: 'mano', locationId: 'park', dialogueId: 'fixture.ui.dialogue',
      file: 'fixture-only', integrated: false, problems: ['测试样例未接入正式包'] }];
    await route.fulfill({ response, json: report });
  });
  await page.goto('/review.html');
  await page.getByRole('button', { name: '内容档案', exact: true }).click();
  await page.getByLabel('档案类型').selectOption('date');
  const entry = page.locator('.inventory-entry').filter({ hasText: '【机制测试】约会关联' });
  await entry.locator('summary').click();
  await expect(entry).toContainText('未接入');
  await expect(entry).toContainText('fixture.ui.dialogue');
  await expect(entry).toContainText('fixture-only');
  await expect(page.getByRole('heading', { name: '内容明细（1）' })).toBeVisible();
  await page.getByLabel('档案偶像').selectOption('hiori');
  await expect(entry).toHaveCount(0);
  await expect(page.getByText('当前筛选没有内容。')).toBeVisible();
});
