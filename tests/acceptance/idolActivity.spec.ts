import { expect, test } from '@playwright/test';
import { dispatch, getState, jumpTo, openGame, watchConsole } from './helpers';

test('an idol-exclusive action only exists on its owner page', async ({
  page,
}) => {
  const errors = watchConsole(page);
  await openGame(page);

  // 练习室 12:00，真乃在场。她是这次行动的唯一归属。
  await jumpTo(page, 1, 12 * 60, 'practice_room');

  // 地点页看不到（专属行动只属于偶像页）
  await expect(page.getByRole('button', { name: /陪她加练/ })).toHaveCount(0);

  await dispatch(page, { type: 'enterIdol', idolId: 'mano' });
  const button = page.getByRole('button', { name: /陪她加练/ });
  await expect(button).toBeVisible();

  await button.click();
  await expect(
    page.getByText('她又唱了一遍，这次没有看谱。').first(),
  ).toBeVisible();

  const state = await getState(page);
  expect(state.idols.mano?.fans).toBe(5);
  // 另一个偶像没有被顺带结算
  expect(state.idols.hiori?.fans ?? 0).toBe(0);

  expect(errors).toEqual([]);
});
