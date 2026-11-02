import { expect, test } from '@playwright/test';
import type { ActionCommand } from '../../src/core/types';
import {
  dispatch,
  getState,
  jumpTo,
  openGame,
  watchConsole,
} from '../acceptance/helpers';
import type { Page } from '@playwright/test';

async function playThroughDialogue(page: Page): Promise<void> {
  for (let i = 0; i < 80; i += 1) {
    const before = await getState(page);
    if (!before.pendingDialogueId) return;
    await dispatch(page, { type: 'dialogueAdvance' } as ActionCommand);
    const after = await getState(page);
    if (
      after.pendingDialogueId &&
      after.dialogueNodeId === before.dialogueNodeId
    ) {
      await dispatch(page, { type: 'dialogueChoice', index: 0 });
    }
  }
}

test('opens the facility office from the practice room', async ({ page }) => {
  const errors = watchConsole(page);
  await openGame(page);
  await playThroughDialogue(page);
  await jumpTo(page, 1, 600, 'practice_room');

  await page.getByRole('button', { name: /设施管理室/ }).click();
  const panel = page.getByRole('dialog', { name: '设施管理室' });
  await expect(panel).toBeVisible();
  await expect(panel.locator('.shop-item')).toHaveCount(3);
  await expect(panel).toContainText('声乐室');
  await expect(panel).toContainText('舞蹈室');
  await expect(panel).toContainText('表现室');
  await expect(panel.getByRole('button', { name: '金钱不足' }).first()).toBeVisible();
  expect(errors).toEqual([]);
});
