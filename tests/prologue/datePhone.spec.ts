import { expect, test } from '@playwright/test';
import { getState, jumpTo, openGame, reset } from '../acceptance/helpers';

test('production phone clearly exposes the empty approved-content state without charging', async ({ page }) => {
  await openGame(page); await reset(page, 123);
  while (await page.locator('.dialogue-panel').count()) {
    const choices = page.locator('.dialogue-choice');
    if (await choices.count()) await choices.first().click();
    else await page.getByRole('button', { name: '继续', exact: true }).click();
  }
  await jumpTo(page, 1, 9 * 60, 'home');
  const before = await getState(page);
  await page.getByRole('button', { name: '电话：约会预约' }).click();
  await expect(page.getByRole('dialog', { name: '电话约会预约' })).toContainText('暂无可预约内容');
  expect((await getState(page)).money).toBe(before.money);
  expect((await getState(page)).dateAppointment).toBeUndefined();
  await page.screenshot({ path: 'test-results/date-phone-empty.png', fullPage: true });
});
