import { expect, test } from '@playwright/test';
import { getState, jumpTo, openGame, reset, watchConsole } from '../acceptance/helpers';
import { PRODUCTION_PACK } from '../../src/core/productionPack';

/**
 * 結華：雨天街角 → 初次广播 → 卡面三章
 *       → 拍照/话题/课后事件。
 */

const YUIKA = 'yuika';

async function finishDialogue(page: import('@playwright/test').Page) {
  for (let index = 0; index < 200; index += 1) {
    if ((await page.locator('.dialogue-panel').count()) === 0) return;
    const choices = page.locator('.dialogue-choice');
    if ((await choices.count()) > 0) await choices.first().click();
    else await page.getByRole('button', { name: '继续' }).click();
    await page.waitForTimeout(10);
  }
  throw new Error('dialogue did not finish');
}

async function pick(page: import('@playwright/test').Page, name: string) {
  await page.getByRole('button', { name }).first().click();
  await finishDialogue(page);
}

async function phase(page: import('@playwright/test').Page) {
  return (await getState(page)).phase;
}

test('Yuika: recruit, card, photo, topic and a post-lesson event', async ({
  page,
}) => {
  test.setTimeout(180_000);
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await finishDialogue(page);

  // ---- 招募：雨里的那条街 ----
  await jumpTo(page, 1, 16 * 60, 'shopping_street');
  await pick(page, '雨里有人抱着周边躲雨');
  expect((await getState(page)).idols[YUIKA]?.status).toBe('known');

  // ---- 招募：录音间首次广播（原三分支，选第一个） ----
  await jumpTo(page, 3, 18 * 60 + 30, 'studio');
  await pick(page, '她第一次进录音间');
  expect((await getState(page)).idols[YUIKA]?.status).toBe('recruited');

  // ---- 名册 / 日程表 ----
  await page.getByRole('button', { name: /偶像名册/ }).first().click();
  const roster = page.getByRole('dialog', { name: '偶像名册' });
  await expect(
    roster.locator('.roster-card', { hasText: '三峰結華' }),
  ).toBeVisible();
  await page.getByRole('button', { name: '关闭偶像名册' }).click();

  await page.getByRole('button', { name: /日程表/ }).first().click();
  const schedule = page.getByRole('dialog', { name: '偶像日程表' });
  await expect(schedule.getByRole('tab', { name: /三峰結華/ })).toBeVisible();
  await page.getByRole('button', { name: '关闭日程表' }).click();

  // ---- 卡面第一章：她说要带我去挑眼镜 ----
  await jumpTo(page, 4, 17 * 60, 'shopping_street');
  await pick(page, '她说要带我去挑眼镜');
  expect((await getState(page)).flags['completed.yuika.shop']).toBe(true);

  // ---- 卡面第二章：练习室里有人在听 CD（三选项，选第一个） ----
  await jumpTo(page, 7, 19 * 60 + 30, 'practice_room');
  await page.getByRole('button', { name: '练习室里有人在听 CD' }).first().click();
  for (let index = 0; index < 120; index += 1) {
    if ((await page.locator('.dialogue-panel').count()) === 0) break;
    const choice = page.getByRole('button', { name: '没那回事。' });
    if ((await choice.count()) > 0) await choice.first().click();
    else await page.getByRole('button', { name: '继续' }).click();
    await page.waitForTimeout(10);
  }
  expect((await getState(page)).flags['completed.yuika.hide']).toBe(true);

  // ---- 专属行动：陪她拍一张照（周二傍晚她在商店街打工） ----
  await jumpTo(page, 9, 17 * 60, 'shopping_street');
  await page.getByRole('button', { name: /三峰結華/ }).first().click();
  const beforeShot = await getState(page);
  const shoot = page.getByRole('button', { name: '陪她拍一张照' });
  await expect(shoot).toBeVisible();
  await shoot.click();
  await expect.poll(() => phase(page)).toBe('activityResult');

  const afterShot = await getState(page);
  expect(beforeShot.shared.stamina - afterShot.shared.stamina).toBe(7);
  expect(
    afterShot.idols[YUIKA]!.stats.trust.exp -
      beforeShot.idols[YUIKA]!.stats.trust.exp,
  ).toBe(5);

  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 日常话题（6 条） ----
  const topics = PRODUCTION_PACK.actors.find((actor) => actor.id === YUIKA)!
    .topics;
  expect(topics).toHaveLength(6);
  const trustBeforeChat = (await getState(page)).idols[YUIKA]!.stats.trust.exp;
  await page.getByRole('button', { name: '聊两句' }).click();
  await expect.poll(() => phase(page)).toBe('npcResult');
  const said = (await getState(page)).lastResult ?? '';
  expect(topics.map((topic) => topic.text)).toContain(said);
  const afterChat = await getState(page);
  expect(afterChat.idols[YUIKA]!.stats.trust.exp - trustBeforeChat).toBe(1);
  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 卡面第三章：优胜之后她还有工作 ----
  await jumpTo(page, 10, 18 * 60, 'studio');
  await pick(page, '优胜之后她还有工作');
  expect((await getState(page)).flags['completed.yuika.live']).toBe(true);

  // ---- 课后事件：声乐课之后（她周一下午与周三下午在练习室） ----
  let fired = false;
  for (const [day, startMinute] of [
    [15, 15 * 60 + 30],
    [17, 15 * 60 + 30],
  ] as const) {
    await jumpTo(page, day, startMinute, 'practice_room');
    await page.getByRole('button', { name: /三峰結華/ }).first().click();
    for (let attempt = 0; attempt < 4 && !fired; attempt += 1) {
      const vocal = page.getByRole('button', { name: '声乐课' });
      if ((await vocal.count()) === 0) break;
      await vocal.click();
      await expect.poll(() => phase(page)).toBe('activityResult');
      await page.getByRole('button', { name: '继续' }).click();
      await expect
        .poll(async () =>
          ['event', 'idol', 'plan'].includes((await getState(page)).phase),
        )
        .toBe(true);
      fired = (await getState(page)).phase === 'event';
      if (fired) break;
      if ((await getState(page)).phase !== 'idol') break;
    }
    if (fired) break;
  }

  expect(fired).toBe(true);
  expect((await getState(page)).pendingEventId).toBe('evt.yuika.after_vocal');
  await page.getByRole('button', { name: /低音那段很好/ }).click();
  await expect.poll(() => phase(page)).toBe('eventResult');
  await page.getByRole('button', { name: '继续' }).click();
  await expect
    .poll(async () => (await getState(page)).flags['seen:evt.yuika.after_vocal'])
    .toBe(true);

  expect(errors).toEqual([]);
});
