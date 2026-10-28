import { expect, test } from '@playwright/test';
import type { ActionCommand } from '../../src/core/types';
import {
  dispatch,
  getState,
  jumpTo,
  openGame,
  reset,
  watchConsole,
} from './helpers';
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

test('handbook starts empty', async ({ page }) => {
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);

  await page.getByRole('button', { name: /手册/ }).click();
  const dialog = page.getByRole('dialog', { name: '手册' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('还没有值得记下的事。');

  await page.getByRole('button', { name: '关闭手册' }).click();
  await expect(dialog).toHaveCount(0);

  expect(errors).toEqual([]);
});

test('records the encounter thread after the first meeting', async ({
  page,
}) => {
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await jumpTo(page, 1, 12 * 60, 'park');

  await dispatch(page, {
    type: 'startStory',
    chainId: 'hiori-encounter',
  } as ActionCommand);
  await playThroughDialogue(page);

  const state = await getState(page);
  expect(state.storyChains['hiori-encounter']?.stepIndex).toBe(1);

  await page.getByRole('button', { name: /手册/ }).click();
  const dialog = page.getByRole('dialog', { name: '手册' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('进行中');
  await expect(dialog).toContainText('公园');
  await expect(dialog).toContainText('还有 2 天');
  await expect(dialog).toContainText('等候');

  expect(errors).toEqual([]);
});
