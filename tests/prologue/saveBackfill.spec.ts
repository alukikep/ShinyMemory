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
 * 2026-11 回归：L'Antica 四人接完之后，这条扩成"把后来加进来的五个角色
 * （摩美々/霧子/恋鐘/咲耶/結華）一起从旧档里删掉"，再一个个招回来。
 * 单元侧对应 `src/save/idolBackfill.test.ts`（对正式包每个偶像都跑一遍）。
 */

const SAVE_KEY = 'shiny-memory.save.v1';

const LATE_IDOLS = ['mamimi', 'kiriko', 'kogane', 'sakuya', 'yuika'] as const;

type RecruitStep = {
  idolId: string;
  label: string;
  day: number;
  minute: number;
  locationId: string;
};

/** 招募链两步：顺序按时间排好，避免跳来跳去。 */
const RECRUIT_PATH: RecruitStep[] = [
  { idolId: 'kiriko', label: '会客室里有人在缠绷带', day: 1, minute: 10 * 60, locationId: 'office' },
  { idolId: 'kogane', label: '面试室里有人在报名字', day: 1, minute: 10 * 60, locationId: 'office' },
  { idolId: 'sakuya', label: '街边有人在拍杂志', day: 1, minute: 13 * 60, locationId: 'shopping_street' },
  { idolId: 'yuika', label: '雨里有人抱着周边躲雨', day: 1, minute: 16 * 60, locationId: 'shopping_street' },
  { idolId: 'mamimi', label: '夜里有个穿得很特别的女孩', day: 1, minute: 19 * 60, locationId: 'shopping_street' },
  { idolId: 'kiriko', label: '她一个人在练习室擦地', day: 3, minute: 8 * 60 + 30, locationId: 'practice_room' },
  { idolId: 'mamimi', label: '她来事务所找你了', day: 3, minute: 10 * 60, locationId: 'office' },
  { idolId: 'kogane', label: '她第一天上班', day: 3, minute: 10 * 60, locationId: 'studio' },
  { idolId: 'sakuya', label: '她在准备第一支广告', day: 3, minute: 16 * 60, locationId: 'studio' },
  { idolId: 'yuika', label: '她第一次进录音间', day: 3, minute: 18 * 60 + 30, locationId: 'studio' },
];

const NAMES: Record<string, string> = {
  mamimi: '田中摩美々',
  kiriko: '幽谷霧子',
  kogane: '月岡恋鐘',
  sakuya: '白瀬咲耶',
  yuika: '三峰結華',
};

async function finishDialogue(page: import('@playwright/test').Page) {
  for (let index = 0; index < 200; index += 1) {
    if ((await page.locator('.dialogue-panel').count()) === 0) return;
    const choices = page.locator('.dialogue-choice');
    if ((await choices.count()) > 0) await choices.first().click();
    else await page.getByRole('button', { name: '继续' }).click();
    await page.waitForTimeout(15);
  }
  throw new Error('dialogue did not finish');
}

/** 把存档改成"这些角色加进来之前"的样子：删掉她们的偶像条目和角色条目。 */
async function stripIdols(
  page: import('@playwright/test').Page,
  idolIds: readonly string[],
): Promise<string> {
  return page.evaluate(
    ([saveKey, ids]) => {
      const raw = window.localStorage.getItem(saveKey as string);
      if (!raw) return 'missing save';
      const envelope = JSON.parse(raw) as {
        state?: {
          idols?: Record<string, unknown>;
          actors?: Record<string, unknown>;
        };
      };
      if (!envelope.state?.idols || !envelope.state.actors) return 'no idols';
      for (const id of ids as string[]) {
        delete envelope.state.idols[id];
        delete envelope.state.actors[id];
      }
      window.localStorage.setItem(saveKey as string, JSON.stringify(envelope));
      return 'ok';
    },
    [SAVE_KEY, idolIds] as const,
  );
}

test('an old save without the L\'Antica latecomers still recruits them all', async ({
  page,
}) => {
  test.setTimeout(180_000);
  const errors = watchConsole(page);

  await page.goto('/?debug=1');
  await page.waitForFunction(() => Boolean(window.__SHINY_MEMORY__));
  await page.evaluate(() => window.__SHINY_MEMORY__!.reset(1));
  await finishDialogue(page);

  // 旧档：这五个人都还不存在。
  expect(await stripIdols(page, LATE_IDOLS)).toBe('ok');

  // 刷新：走正常的加载路径（migrateSave 要补回条目）。
  await page.reload();
  await page.waitForFunction(() => Boolean(window.__SHINY_MEMORY__));
  const loaded = await getState(page);
  for (const idolId of LATE_IDOLS) {
    expect(loaded.idols[idolId]?.status, `${idolId} 没被补回旧档`).toBe('unknown');
  }

  // ---- 五条招募链各走两步 ----
  for (const step of RECRUIT_PATH) {
    await jumpTo(page, step.day, step.minute, step.locationId);
    await page.getByRole('button', { name: step.label }).first().click();
    await finishDialogue(page);
  }

  const after = await getState(page);
  for (const idolId of LATE_IDOLS) {
    expect(after.idols[idolId]?.status, `${idolId} 没招进来`).toBe('recruited');
  }

  // ---- 名册：五个人都在 ----
  await page.getByRole('button', { name: /偶像名册/ }).first().click();
  const roster = page.getByRole('dialog', { name: '偶像名册' });
  for (const idolId of LATE_IDOLS) {
    await expect(
      roster.locator('.roster-card', { hasText: NAMES[idolId]! }),
      `${NAMES[idolId]} 不在名册里`,
    ).toBeVisible();
  }
  await page.getByRole('button', { name: '关闭偶像名册' }).click();

  // ---- 日程表：五个人都有标签，而且各自有排班 ----
  await page.getByRole('button', { name: /日程表/ }).first().click();
  const schedule = page.getByRole('dialog', { name: '偶像日程表' });
  for (const idolId of LATE_IDOLS) {
    await schedule.getByRole('tab', { name: new RegExp(NAMES[idolId]!) }).click();
    await expect(
      schedule.locator('.schedule-slot').first(),
      `${NAMES[idolId]} 的日程是空的`,
    ).toBeVisible();
  }
  await page.getByRole('button', { name: '关闭日程表' }).click();

  expect(errors).toEqual([]);
});
