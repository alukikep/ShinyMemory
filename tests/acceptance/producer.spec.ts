import { expect, test } from '@playwright/test';
import { openGame, watchConsole } from './helpers';

test('opens and closes the producer attribute panel', async ({ page }) => {
  const errors = watchConsole(page);
  await openGame(page);

  const toggle = page.getByRole('button', { name: '制作人' });
  await expect(toggle).toBeVisible();

  await toggle.click();
  const dialog = page.getByRole('dialog', { name: '制作人属性' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('摄影', { exact: true })).toBeVisible();
  await expect(dialog).toContainText('×1.0 – ×1.5');

  await page.getByRole('button', { name: '关闭制作人属性' }).click();
  await expect(dialog).toHaveCount(0);

  expect(errors).toEqual([]);
});
