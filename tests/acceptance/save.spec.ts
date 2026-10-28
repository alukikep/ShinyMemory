import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { getState, jumpTo, openGame, reset, watchConsole } from './helpers';

test('manual save slot and load are separate from autosave', async ({
  page,
}) => {
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await jumpTo(page, 1, 12 * 60, 'park');

  await page.getByRole('button', { name: '存档' }).click();
  const savePanel = page.getByRole('dialog', { name: '存档' });
  await expect(savePanel).toBeVisible();
  await savePanel.getByRole('button', { name: '新建存档槽' }).click();
  await expect(page.getByRole('status')).toContainText('已存档');
  const savedAt = await getState(page);
  expect(savedAt.locationId).toBe('park');

  await jumpTo(page, 5, 9 * 60, 'office');
  expect((await getState(page)).clock.absoluteMinutes).toBe(
    4 * 1440 + 9 * 60,
  );

  await page.getByRole('button', { name: '读档' }).click();
  const loadPanel = page.getByRole('dialog', { name: '读档' });
  await expect(loadPanel).toBeVisible();
  await loadPanel.getByRole('button', { name: '读取' }).click();
  await expect(page.getByRole('status')).toContainText('已读取存档');

  const loaded = await getState(page);
  expect(loaded.locationId).toBe('park');
  expect(loaded.clock.absoluteMinutes).toBe(12 * 60);

  expect(errors).toEqual([]);
});

test('a save slot can be deleted', async ({ page }) => {
  await openGame(page);
  await reset(page, 1);

  await page.getByRole('button', { name: '存档' }).click();
  await page
    .getByRole('dialog', { name: '存档' })
    .getByRole('button', { name: '新建存档槽' })
    .click();

  await page.getByRole('button', { name: '读档' }).click();
  const panel = page.getByRole('dialog', { name: '读档' });
  await panel.getByRole('button', { name: '删除' }).click();
  await panel.getByRole('button', { name: '确认删除' }).click();

  await expect(panel.getByText('还没有存档。')).toBeVisible();
});

test('a slot can be exported and imported back', async ({ page }) => {
  await openGame(page);
  await reset(page, 1);
  await jumpTo(page, 2, 9 * 60, 'park');

  await page.getByRole('button', { name: '存档' }).click();
  await page
    .getByRole('dialog', { name: '存档' })
    .getByRole('button', { name: '新建存档槽' })
    .click();

  await page.getByRole('button', { name: '存档' }).click();
  const panel = page.getByRole('dialog', { name: '存档' });
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    panel.getByRole('button', { name: '导出' }).first().click(),
  ]);
  const path = await download.path();
  expect(path).toBeTruthy();
  const text = await readFile(path!, 'utf8');
  expect(text).toContain('"schemaVersion"');

  await panel.getByRole('button', { name: '关闭存档面板' }).click();

  await page.getByRole('button', { name: '存档' }).click();
  await page
    .getByRole('dialog', { name: '存档' })
    .getByLabel('导入存档文件')
    .setInputFiles({
      name: '导入的存档.json',
      mimeType: 'application/json',
      buffer: Buffer.from(text, 'utf8'),
    });

  await expect(page.getByRole('status')).toContainText('已导入存档');

  await page.getByRole('button', { name: '读档' }).click();
  await expect(
    page.getByRole('dialog', { name: '读档' }).getByText('导入的存档'),
  ).toBeVisible();
});

test('manual save controls are reachable on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openGame(page);
  await reset(page, 1);
  await expect(page.getByRole('button', { name: '存档' })).toBeVisible();
  await expect(page.getByRole('button', { name: '读档' })).toBeVisible();
});
