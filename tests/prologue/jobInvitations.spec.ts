import { expect, test } from '@playwright/test';
import { getState, jumpTo, openGame, reset, watchConsole } from '../acceptance/helpers';
const SAVE_KEY = 'shiny-memory.save.v1';

test('daily invitations refresh once, persist on reload and reset tomorrow', async ({ page }) => {
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 37);
  // Construct an unlocked state directly; the recruitment/story path has separate coverage.
  await page.evaluate((key) => {
    const save = JSON.parse(localStorage.getItem(key)!);
    save.state.pendingDialogueId = undefined;
    save.state.dialogueNodeId = undefined;
    save.state.phase = 'plan';
    save.state.locationId = 'office';
    save.state.clock.absoluteMinutes = 9 * 60;
    save.state.flags['unlocked.first_live'] = true;
    // Keep the day's pre-unlock five invitations, so the unlocked sixth is a replacement.
    localStorage.setItem(key, JSON.stringify(save));
  }, SAVE_KEY);
  await page.reload();
  await page.getByRole('button', { name: '查看可以接的工作' }).click();
  await expect(page.getByText('今日邀约 5/5')).toBeVisible();
  const before = await getState(page);
  await page.getByRole('button', { name: '刷新邀约（每日一次）' }).click();
  await expect(page.getByRole('button', { name: '今日已刷新' })).toBeDisabled();
  const refreshed = await getState(page);
  expect(refreshed.jobInvitations?.refreshed).toBe(true);
  expect(refreshed.jobInvitations?.jobIds).toContain('job.first_live');
  expect(refreshed.clock).toEqual(before.clock);
  expect(refreshed.money).toBe(before.money);
  await page.getByRole('button', { name: '关闭工作面板' }).click();
  await page.reload();
  await page.getByRole('button', { name: '查看可以接的工作' }).click();
  expect((await getState(page)).jobInvitations).toEqual(refreshed.jobInvitations);
  await expect(page.getByRole('button', { name: '今日已刷新' })).toBeDisabled();
  await page.getByRole('button', { name: '关闭工作面板' }).click();
  await jumpTo(page, 2, 9 * 60, 'office');
  await page.getByRole('button', { name: '查看可以接的工作' }).click();
  await expect(page.getByRole('button', { name: '刷新邀约（每日一次）' })).toBeEnabled();
  expect((await getState(page)).jobInvitations?.day).toBe(2);
  expect(errors).toEqual([]);
});
