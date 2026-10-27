import { expect, test } from '@playwright/test';
import {
  getState,
  jumpTo,
  openGame,
  reset,
  watchConsole,
} from '../acceptance/helpers';

async function finishDialogue(page: import('@playwright/test').Page) {
  for (let i = 0; i < 40; i += 1) {
    if ((await page.locator('.dialogue-panel').count()) === 0) return;
    const choices = page.locator('.dialogue-choice');
    if ((await choices.count()) > 0) {
      await choices.first().click();
    } else {
      await page.getByRole('button', { name: '继续' }).click();
    }
    await page.waitForTimeout(20);
  }
  throw new Error('dialogue did not finish');
}

test('office prologue then Mano encounter', async ({ page }) => {
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);

  await expect(page.locator('.dialogue-panel')).toBeVisible();
  await page.getByRole('button', { name: '继续' }).click();
  await expect(page.getByText('七草叶月')).toBeVisible();
  await finishDialogue(page);

  expect((await getState(page)).pendingDialogueId).toBeUndefined();
  expect((await getState(page)).idols.mano?.status).toBe('unknown');
  expect(
    Object.values((await getState(page)).idols).some(
      (idol) => idol.status === 'recruited',
    ),
  ).toBe(false);
  await expect(
    page.getByText('还没有正式出道的偶像。'),
  ).toBeVisible();

  await page.getByRole('button', { name: '偶像名册' }).click();
  await expect(
    page.getByRole('heading', { name: '樱木真乃' }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: '关闭偶像名册' }).click();

  await jumpTo(page, 1, 12 * 60, 'park');
  await page.getByRole('button', { name: '循着歌声' }).click();
  await finishDialogue(page);
  expect((await getState(page)).idols.mano?.status).toBe('known');

  await page.getByRole('button', { name: '偶像名册' }).click();
  await expect(
    page.getByRole('heading', { name: '樱木真乃' }),
  ).toBeVisible();
  await expect(page.getByText('尚未招募')).toBeVisible();
  await page.getByRole('button', { name: '关闭偶像名册' }).click();

  await page.getByRole('button', { name: '日程表' }).click();
  await expect(
    page.locator('.schedule-panel').getByText('樱木真乃'),
  ).toHaveCount(0);
  await page.getByRole('button', { name: '关闭日程表' }).click();

  await jumpTo(page, 3, 12 * 60, 'park');
  await page.getByRole('button', { name: '再次听见歌声' }).click();
  await finishDialogue(page);
  expect((await getState(page)).idols.mano?.status).toBe('recruited');
  expect((await getState(page)).activeIdolId).toBe('mano');

  await expect(page.locator('.idol-summary-name')).toHaveText('樱木真乃');
  await page.getByRole('button', { name: '日程表' }).click();
  await expect(page.getByRole('tab', { name: '樱木真乃' })).toBeVisible();
  await page.getByRole('button', { name: '关闭日程表' }).click();

  await jumpTo(page, 4, 12 * 60, 'practice_room');
  await page.getByRole('button', { name: /樱木真乃/ }).click();
  await page.getByRole('button', { name: /^声乐课/ }).click();
  expect((await getState(page)).phase).toBe('activityResult');

  expect(errors).toEqual([]);
});
