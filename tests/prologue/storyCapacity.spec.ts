import { expect, test, type Page } from '@playwright/test';
import { getState, jumpTo, openGame, reset, watchConsole } from '../acceptance/helpers';

async function finishDialogue(page: Page) {
  for (let i = 0; i < 200; i++) {
    if (await page.locator('.dialogue-panel').count() === 0) return;
    const choices = page.locator('.dialogue-choice');
    if (await choices.count()) await choices.first().click();
    else await page.getByRole('button', { name: '继续' }).click();
  }
  throw new Error('Dialogue did not finish');
}

test('two story slots block new starts and hints, exempt recruitment and release on completion', async ({ page }) => {
  test.setTimeout(120_000);
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 37);
  // Build the relevant scenario without replaying unrelated recruitment and four chapters.
  await page.evaluate(() => {
    const key = 'shiny-memory.save.v1';
    const saved = JSON.parse(localStorage.getItem(key)!);
    const state = saved.state;
    state.pendingDialogueId = undefined;
    state.dialogueNodeId = undefined;
    state.phase = 'plan';
    state.locationId = 'ekimae';
    state.clock.absoluteMinutes = 19 * 1440 + 16 * 60;
    for (const id of ['mano', 'hiori', 'meguru']) state.idols[id].status = 'recruited';
    state.storyChains = {
      'mano-smile': { chainId: 'mano-smile', stepIndex: 4 },
      'hiori-smile-card': { chainId: 'hiori-smile-card', stepIndex: 1 },
    };
    state.flags['completed.mano.afterglow'] = true;
    localStorage.setItem(key, JSON.stringify(saved));
  });
  await page.reload();
  await expect(page.locator('.map-node-hint')).toHaveCount(0);
  await jumpTo(page, 20, 16 * 60, 'shopping_street');
  await expect(page.getByRole('button', { name: '杂志那边约了新人特集' })).toHaveCount(0);
  await page.getByRole('button', { name: '大屏下面有人在跳' }).click();
  await finishDialogue(page);
  expect((await getState(page)).idols.asahi?.status).toBe('known');
  await page.getByRole('button', { name: /手册/ }).click();
  const handbook = page.getByRole('dialog', { name: '手册' });
  await expect(handbook.getByLabel('剧情名额')).toContainText('剧情进行中 2/2');
  await expect(handbook.getByRole('region', { name: '招募引导' })).toBeVisible();
  await handbook.getByRole('button', { name: '关闭手册' }).click();

  await jumpTo(page, 20, 16 * 60, 'park');
  await page.getByRole('button', { name: '她在长椅上睡着了' }).click();
  await finishDialogue(page);
  const finished = await getState(page);
  expect(finished.storyChains['mano-smile']?.completed).toBe(true);
  expect(finished.flags['completed.mano.dream']).toBe(true);
  await page.getByRole('button', { name: /手册/ }).click();
  await expect(page.getByLabel('剧情名额')).toContainText('剧情进行中 1/2');
  await page.getByRole('button', { name: '关闭手册' }).click();
  await jumpTo(page, 20, 16 * 60, 'shopping_street');
  await page.getByRole('button', { name: '杂志那边约了新人特集' }).click();
  await finishDialogue(page);
  expect((await getState(page)).flags['completed.meguru.swimsuit']).toBe(true);
  await page.getByRole('button', { name: /手册/ }).click();
  await expect(page.getByLabel('剧情名额')).toContainText('剧情进行中 2/2');
  expect(errors).toEqual([]);
});
