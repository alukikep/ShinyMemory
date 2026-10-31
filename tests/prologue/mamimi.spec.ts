import { expect, test } from '@playwright/test';
import { existsSync } from 'node:fs';
import {
  getState,
  jumpTo,
  openGame,
  reset,
  watchConsole,
} from '../acceptance/helpers';
import { PRODUCTION_PACK } from '../../src/core/productionPack';

/**
 * 摩美々：街边偶遇 → 卡面两章 → 专属行动 → 日常话题 → 课后事件。
 *
 * 守两件事：
 * 1. 这一批通过审查台的内容真的进了游戏（行动、话题、事件都能点得到）。
 * 2. 她的日程里真的有练习室——否则舞蹈课/表演课对她永远不可用，
 *    挂在课后的两个事件就是死内容（事故 #30）。
 */

const MAMIMI = 'mamimi';

// 对话还在审查台时，游戏里没有招募链，这条测试没有意义。
const PENDING = existsSync('content-review/drafts/draft.dialogue.mamimi.first.json');
test.skip(PENDING, '摩美々的对话待审：通过后自动恢复');

async function finishDialogue(page: import('@playwright/test').Page) {
  for (let index = 0; index < 120; index += 1) {
    if ((await page.locator('.dialogue-panel').count()) === 0) return;
    const choices = page.locator('.dialogue-choice');
    if ((await choices.count()) > 0) {
      await choices.first().click();
    } else {
      await page.getByRole('button', { name: '继续' }).click();
    }
    await page.waitForTimeout(15);
  }
  throw new Error('dialogue did not finish');
}

async function pick(page: import('@playwright/test').Page, name: string | RegExp) {
  await page.getByRole('button', { name }).first().click();
  await finishDialogue(page);
}

async function phase(page: import('@playwright/test').Page) {
  return (await getState(page)).phase;
}

test('Mamimi: recruit, card, bond action, topic and a post-lesson event', async ({
  page,
}) => {
  test.setTimeout(180_000);
  const errors = watchConsole(page);
  await openGame(page);
  await reset(page, 1);
  await finishDialogue(page);

  // ---- 招募：夜里在商业街碰到她 ----
  await jumpTo(page, 1, 19 * 60, 'shopping_street');
  await pick(page, '夜里有个穿得很特别的女孩');
  expect((await getState(page)).idols[MAMIMI]?.status).toBe('known');

  // ---- 招募：她自己来事务所 ----
  await jumpTo(page, 3, 10 * 60, 'office');
  await pick(page, '她来事务所找你了');
  expect((await getState(page)).idols[MAMIMI]?.status).toBe('recruited');

  // ---- 招募后：名册和日程表都要看得到她 ----
  await page.getByRole('button', { name: /偶像名册/ }).first().click();
  const roster = page.getByRole('dialog', { name: '偶像名册' });
  const card = roster.locator('.roster-card', { hasText: '田中摩美々' });
  await expect(card).toBeVisible();
  await expect(card).toContainText('L\'Antica');
  await expect(card).toContainText('粉丝');
  await page.getByRole('button', { name: '关闭偶像名册' }).click();

  await page.getByRole('button', { name: /日程表/ }).first().click();
  const schedule = page.getByRole('dialog', { name: '偶像日程表' });
  await expect(schedule.getByRole('tab', { name: /田中摩美々/ })).toBeVisible();
  // 练习室是她做舞蹈课/表演课的地方，日程里没有就说明训练不可达。
  await expect(schedule).toContainText('练习室');
  await page.getByRole('button', { name: '关闭日程表' }).click();

  // ---- 卡面第一章：浴衣 ----
  await jumpTo(page, 4, 11 * 60, 'shopping_street');
  await pick(page, '她在改一件浴衣');
  expect((await getState(page)).flags['completed.mamimi.yukata']).toBe(true);

  // ---- 卡面第二章：被粉丝叫住 ----
  await jumpTo(page, 7, 12 * 60, 'shopping_street');
  await pick(page, '她被粉丝叫住了');
  expect((await getState(page)).flags['completed.mamimi.purple']).toBe(true);

  // ---- 专属行动：周日下午她会在商业街 ----
  await jumpTo(page, 7, 17 * 60, 'shopping_street');
  await page.getByRole('button', { name: /田中摩美々/ }).first().click();
  const beforeWalk = await getState(page);

  const walk = page.getByRole('button', { name: '陪她在街上走' });
  await expect(walk).toBeVisible();
  await walk.click();
  await expect.poll(() => phase(page)).toBe('activityResult');

  const afterWalk = await getState(page);
  expect(beforeWalk.shared.stamina - afterWalk.shared.stamina).toBe(7);
  expect(
    afterWalk.idols[MAMIMI]!.stats.trust.exp -
      beforeWalk.idols[MAMIMI]!.stats.trust.exp,
  ).toBe(5);
  // 初始压力 0，-4 被夹到 0。
  expect(afterWalk.shared.stress).toBe(0);

  // 回到她的页面
  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 日常话题：六条里抽一条，正文真的显示 ----
  const topics = PRODUCTION_PACK.actors.find((actor) => actor.id === MAMIMI)!
    .topics;
  expect(topics).toHaveLength(6);

  const trustBeforeChat = (await getState(page)).idols[MAMIMI]!.stats.trust.exp;
  await page.getByRole('button', { name: '聊两句' }).click();
  await expect.poll(() => phase(page)).toBe('npcResult');

  const said = (await getState(page)).lastResult ?? '';
  expect(topics.map((topic) => topic.text)).toContain(said);
  await expect(page.getByText(said).first()).toBeVisible();

  const afterChat = await getState(page);
  expect(afterChat.idols[MAMIMI]!.stats.trust.exp - trustBeforeChat).toBe(1);
  expect(afterChat.pendingTopicId?.startsWith('mamimi.chat.')).toBe(true);

  await page.getByRole('button', { name: '继续' }).click();
  await expect.poll(() => phase(page)).toBe('idol');

  // ---- 课后事件：周二 17:00 练习室，舞蹈课后 ----
  // 事件是 40% 概率，最多练 4 节（17:00–19:00 的课时）。
  await jumpTo(page, 9, 17 * 60, 'practice_room');
  await page.getByRole('button', { name: /田中摩美々/ }).first().click();
  await expect(page.getByRole('button', { name: '舞蹈课' })).toBeVisible();

  let fired = false;
  for (let attempt = 0; attempt < 4 && !fired; attempt += 1) {
    await page.getByRole('button', { name: '舞蹈课' }).click();
    await expect.poll(() => phase(page)).toBe('activityResult');
    await page.getByRole('button', { name: '继续' }).click();
    await expect
      .poll(async () =>
        ['event', 'idol', 'plan'].includes((await getState(page)).phase),
      )
      .toBe(true);
    fired = (await getState(page)).phase === 'event';
  }

  expect(fired).toBe(true);
  const event = await getState(page);
  expect(event.pendingEventId).toBe('evt.mamimi.after_dance');

  await expect(page.getByText('跳得太随便了吧').first()).toBeVisible();
  const trustBeforeChoice = event.idols[MAMIMI]!.stats.trust.exp;
  await page.getByRole('button', { name: '这遍比刚才好' }).click();
  await expect.poll(() => phase(page)).toBe('eventResult');
  expect(
    (await getState(page)).idols[MAMIMI]!.stats.trust.exp - trustBeforeChoice,
  ).toBe(3);

  await page.getByRole('button', { name: '继续' }).click();
  await expect
    .poll(async () => (await getState(page)).flags['seen:evt.mamimi.after_dance'])
    .toBe(true);

  expect(errors).toEqual([]);
});
