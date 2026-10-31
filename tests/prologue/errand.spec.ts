import { expect, test } from '@playwright/test';
import { getState, jumpTo, openGame, reset, watchConsole } from '../acceptance/helpers';

/**
 * 制作人零工必须"点得动"。
 *
 * 这条守的是一个真实反馈：零工按钮出现过点了没反应的情况。
 * 原因可能是旧页面、也可能是行动接错了分支——所以这里直接验
 * 「点击 → 进入结果页 → 钱和属性真的变了」。
 */

async function finishDialogue(page: import('@playwright/test').Page) {
  for (let index = 0; index < 40; index += 1) {
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

test('producer errand responds to a click', async ({ page }) => {
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await finishDialogue(page);

  await jumpTo(page, 1, 12 * 60, 'office');
  const before = await getState(page);

  const errand = page.getByRole('button', { name: /整理资料/ });
  await expect(errand).toBeVisible();
  await expect(errand).toBeEnabled();
  await errand.click();

  await expect
    .poll(async () => (await getState(page)).phase, { timeout: 5_000 })
    .toBe('activityResult');

  const after = await getState(page);
  // 零工按制作人熟练度缩放（企划 F 时 ×0.55），所以不写死金额：
  // 内容里的基础报酬改了，这条测试也不该跟着改。
  const base = 150; // activity.office_filing 的基础报酬
  const expected = Math.round(base * 0.55);
  expect(after.money - before.money).toBe(expected);
  expect(after.producer.planning.exp).toBe(3);
  expect(errors).toEqual([]);
});
