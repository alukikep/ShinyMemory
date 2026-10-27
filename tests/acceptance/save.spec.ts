import { expect, test } from '@playwright/test';
import { getState, jumpTo, openGame, reset, watchConsole } from './helpers';

test('manual save and load are separate from autosave', async ({ page }) => {
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await jumpTo(page, 1, 12 * 60, 'park');

  await page.getByRole('button', { name: '存档' }).click();
  await expect(page.getByRole('status')).toContainText('已存档');
  const savedAt = await getState(page);
  expect(savedAt.locationId).toBe('park');

  await jumpTo(page, 5, 9 * 60, 'office');
  expect((await getState(page)).clock.absoluteMinutes).toBe(
    4 * 1440 + 9 * 60,
  );

  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: '读档' }).click();
  await expect(page.getByRole('status')).toContainText('已读取手动存档');

  const loaded = await getState(page);
  expect(loaded.locationId).toBe('park');
  expect(loaded.clock.absoluteMinutes).toBe(12 * 60);

  expect(errors).toEqual([]);
});

test('manual save controls are reachable on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openGame(page);
  await reset(page, 1);
  await expect(page.getByRole('button', { name: '存档' })).toBeVisible();
  await expect(page.getByRole('button', { name: '读档' })).toBeVisible();
});
