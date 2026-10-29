import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import {
  dispatch,
  getState,
  jumpTo,
  openGame,
  reset,
  watchConsole,
} from './helpers';

async function settle(page: Page): Promise<void> {
  for (let i = 0; i < 40; i += 1) {
    const state = await getState(page);
    if (state.phase === 'plan') return;
    if (state.pendingEventId) {
      await dispatch(page, { type: 'eventChoice', index: 0 });
    } else {
      await dispatch(page, { type: 'continue' });
    }
  }
  throw new Error('could not settle back to plan');
}

test('granted charm can be equipped and shows its effect', async ({ page }) => {
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await jumpTo(page, 1, 12 * 60, 'practice_room');

  await page.getByRole('button', { name: /整理旧物/ }).first().click();
  await settle(page);

  const state = await getState(page);
  expect(state.ownedEquips).toContain('equip.test.watch');
  expect(state.slots?.charm).toBe(2);

  await page.getByRole('button', { name: '背包' }).click();
  const backpack = page.getByRole('dialog', { name: '背包' });
  await expect(backpack).toBeVisible();
  await expect(backpack).toContainText('饰品');
  await expect(backpack).toContainText('旧怀表');

  await backpack.getByRole('button', { name: '装备' }).click();
  await expect
    .poll(async () => (await getState(page)).equipment?.charm1)
    .toBe('equip.test.watch');
  await expect(backpack).toContainText('体力消耗 ×0.90');

  await backpack.getByRole('button', { name: '卸下' }).click();
  await expect
    .poll(async () => (await getState(page)).equipment?.charm1)
    .toBeUndefined();

  expect(errors).toEqual([]);
});
