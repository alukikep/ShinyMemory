import { expect, test } from '@playwright/test';
import { getState, jumpTo, openGame, reset } from './helpers';

async function acceptMagazine(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: '查看可以接的工作' }).click();
  await page.getByRole('button', { name: /派 .* 去/ }).first().click();
}

test('accepts, attends and rewards a job', async ({ page }, testInfo) => {
  await openGame(page);
  await acceptMagazine(page);

  let state = await getState(page);
  expect(state.jobs).toHaveLength(1);
  expect(state.actors.mano.scheduleOverrides?.[0]?.mode).toBe('replace-day');
  expect(state.actors.mano.scheduleOverrides?.[0]?.day).toBe(7);

  await page.getByRole('button', { name: '日程表' }).click();
  await expect(page.locator('.schedule-temp')).toHaveCount(1);
  await page.getByRole('button', { name: '关闭日程表' }).click();

  await jumpTo(page, 7, 10 * 60, 'studio');
  const attend = page.getByRole('button', { name: /参与：杂志拍摄/ });
  await expect(attend).toBeVisible();
  await attend.click();

  state = await getState(page);
  expect(state.jobs).toHaveLength(0);
  expect(state.money).toBe(4200);
  // 工作现在走结果页，日志措辞也一起改了。
  expect(state.phase).toBe('activityResult');
  expect(state.log.some((entry) => entry.text.includes('收入 ¥'))).toBe(true);

  await testInfo.attach('job-attended', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });

  await jumpTo(page, 8, 8 * 60, 'office');
  state = await getState(page);
  expect(state.actors.mano.scheduleOverrides).toHaveLength(0);
});

test('does not reward or log an unattended job', async ({ page }) => {
  await openGame(page);
  await acceptMagazine(page);
  const before = await getState(page);

  await jumpTo(page, 7, 17 * 60, 'studio');
  const after = await getState(page);

  expect(after.jobs).toHaveLength(0);
  expect(after.money).toBe(before.money);
  expect(after.shared.stamina).toBe(before.shared.stamina);
  expect(after.shared.stress).toBe(before.shared.stress);
  expect(
    after.log.some((entry) => entry.text.includes('收入 ¥')),
  ).toBe(false);
});

test('persists a job across a reload and clears it after the end', async ({
  page,
}) => {
  await openGame(page);
  await reset(page, 1);
  await acceptMagazine(page);
  await page.reload();
  await page.waitForFunction(() => Boolean(window.__SHINY_MEMORY__));

  let state = await getState(page);
  expect(state.jobs).toHaveLength(1);

  await jumpTo(page, 7, 17 * 60, 'studio');
  await page.reload();
  await page.waitForFunction(() => Boolean(window.__SHINY_MEMORY__));

  state = await getState(page);
  expect(state.jobs).toHaveLength(0);
  expect(state.money).toBe(3000);
});
