import { expect, test } from '@playwright/test';
import { getState, jumpTo, watchConsole } from '../acceptance/helpers';

/**
 * 事故 #32：旧存档里没有"后来才加进内容包的偶像"的条目。
 *
 * 场景（玩家真实遇到的）：存档是在摩美々加进来之前建的（存档纪元没变，
 * 所以旧档照常加载），档里没有 `idols.mamimi`。招募链照样能走完，
 * 但 `complete.status` 被"条目不存在的守卫"静默跳过——
 * 剧情演完了，她也不进名册和日程表。
 *
 * 这条测试按真实路径复现：改一份没有她的存档 → 刷新 → 走招募 →
 * 断言她出现在名册和日程表里。
 */

const SAVE_KEY = 'shiny-memory.save.v1';

async function finishDialogue(page: import('@playwright/test').Page) {
  for (let index = 0; index < 120; index += 1) {
    if ((await page.locator('.dialogue-panel').count()) === 0) return;
    const choices = page.locator('.dialogue-choice');
    if ((await choices.count()) > 0) await choices.first().click();
    else await page.getByRole('button', { name: '继续' }).click();
    await page.waitForTimeout(15);
  }
  throw new Error('dialogue did not finish');
}

test('an old save without Mamimi still recruits her into the roster', async ({
  page,
}) => {
  test.setTimeout(120_000);
  const errors = watchConsole(page);

  await page.goto('/?debug=1');
  await page.waitForFunction(() => Boolean(window.__SHINY_MEMORY__));
  await page.evaluate(() => window.__SHINY_MEMORY__!.reset(1));
  await finishDialogue(page);

  // 把存档改成"摩美々加进来之前"的样子：删掉她的偶像条目和角色条目。
  const stripped = await page.evaluate((saveKey) => {
    const raw = window.localStorage.getItem(saveKey);
    if (!raw) return 'missing save';
    const envelope = JSON.parse(raw) as {
      state?: { idols?: Record<string, unknown>; actors?: Record<string, unknown> };
    };
    if (!envelope.state?.idols || !envelope.state.actors) return 'no idols';
    delete envelope.state.idols.mamimi;
    delete envelope.state.actors.mamimi;
    window.localStorage.setItem(saveKey, JSON.stringify(envelope));
    return 'ok';
  }, SAVE_KEY);
  expect(stripped).toBe('ok');

  // 刷新：走正常的加载路径（migrateSave 要补回条目）。
  await page.reload();
  await page.waitForFunction(() => Boolean(window.__SHINY_MEMORY__));
  const loaded = await getState(page);
  expect(loaded.idols.mamimi?.status).toBe('unknown');

  // 招募她
  await jumpTo(page, 1, 19 * 60, 'shopping_street');
  await page.getByRole('button', { name: '夜里有个穿得很特别的女孩' }).click();
  await finishDialogue(page);
  await jumpTo(page, 3, 10 * 60, 'office');
  await page.getByRole('button', { name: '她来事务所找你了' }).click();
  await finishDialogue(page);

  expect((await getState(page)).idols.mamimi?.status).toBe('recruited');

  // 名册与日程表都要看得到她
  await page.getByRole('button', { name: /偶像名册/ }).first().click();
  const roster = page.getByRole('dialog', { name: '偶像名册' });
  await expect(
    roster.locator('.roster-card', { hasText: '田中摩美々' }),
  ).toBeVisible();
  await page.getByRole('button', { name: '关闭偶像名册' }).click();

  await page.getByRole('button', { name: /日程表/ }).first().click();
  const schedule = page.getByRole('dialog', { name: '偶像日程表' });
  await expect(schedule.getByRole('tab', { name: /田中摩美々/ })).toBeVisible();
  await expect(schedule).toContainText('练习室');
  await page.getByRole('button', { name: '关闭日程表' }).click();

  expect(errors).toEqual([]);
});
