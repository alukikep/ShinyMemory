import { promises as fs } from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const ROOT = process.cwd();
const STATUS_DIRS = ['drafts', 'revisions', 'approved', 'discarded'];

async function cleanup() {
  for (const dir of STATUS_DIRS) {
    const directory = path.join(ROOT, 'content-review', dir);
    let names: string[] = [];
    try {
      names = await fs.readdir(directory);
    } catch {
      continue;
    }
    for (const name of names) {
      if (!name.endsWith('.json')) continue;
      const file = path.join(directory, name);
      const text = await fs.readFile(file, 'utf8');
      if (text.includes('E2E 审查')) {
        await fs.rm(file, { force: true });
      }
    }
  }
}

test.beforeEach(cleanup);
test.afterEach(cleanup);

/** 流转之后内容会离开当前队列，按标签页重新选中它。 */
async function openInTab(page: Page, tab: RegExp, title: string) {
  await page.getByRole('tab', { name: tab }).click();
  await page.locator('.review-queue-item', { hasText: title }).click();
  await expect(page.locator('.review-queue-item.active')).toContainText(title);
}

test('creates, revises, resubmits and approves an event', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto('/review.html');
  await page.getByRole('button', { name: '新建草稿' }).click();
  await page.locator('.review-modal select').selectOption('event');
  await page.locator('.review-modal input').fill('E2E 审查事件');
  await page.getByRole('button', { name: '创建' }).click();
  await expect(page.locator('.review-editor')).toBeVisible();

  await page
    .getByRole('textbox', { name: '标题', exact: true })
    .fill('E2E 审查事件');
  await page.getByRole('textbox', { name: '正文' }).fill('E2E 正文');
  await page.getByRole('textbox', { name: '结果文本' }).fill('E2E 结果');
  await page.getByRole('button', { name: '保存草稿' }).first().click();
  await expect(page.locator('.review-editor')).toHaveCount(0);
  await expect(page.locator('.review-toolbar .review-status')).toHaveText(
    '待审查',
  );

  await page.locator('.review-note-add textarea').fill('E2E 批注');
  await page.getByRole('button', { name: '添加批注' }).click();
  await expect(page.locator('.review-note')).toHaveCount(1);

  await page.getByRole('button', { name: '打回' }).click();
  await expect(page.locator('.review-flash')).toContainText('待修改');
  await openInTab(page, /待修改/, 'E2E 审查事件');
  await expect(page.locator('.review-toolbar .review-status')).toHaveText(
    '待修改',
  );

  await page.getByRole('button', { name: '重新送审' }).click();
  await expect(page.locator('.review-flash')).toContainText('待审查');
  await openInTab(page, /待审查/, 'E2E 审查事件');
  await expect(page.locator('.review-toolbar .review-status')).toHaveText(
    '待审查',
  );

  await page.getByRole('button', { name: '通过' }).click();
  await expect(page.locator('.review-flash')).toContainText('已通过');
  await openInTab(page, /已通过/, 'E2E 审查事件');
  await expect(page.locator('.review-toolbar .review-status')).toHaveText(
    '已通过',
  );

  const approved = await fs.readdir(
    path.join(ROOT, 'content-review', 'approved'),
  );
  const approvedText = await Promise.all(
    approved
      .filter((name) => name.endsWith('.json'))
      .map((name) =>
        fs.readFile(
          path.join(ROOT, 'content-review', 'approved', name),
          'utf8',
        ),
      ),
  );
  expect(approvedText.some((text) => text.includes('E2E 审查事件'))).toBe(true);

  await page.getByRole('button', { name: '修订为新版本' }).click();
  await expect(page.locator('.review-editor')).toBeVisible();
  await page.getByRole('button', { name: '保存草稿' }).first().click();
  await expect(page.locator('.review-editor')).toHaveCount(0);
  await page.getByRole('button', { name: '通过' }).click();

  // 旧版本被新版本替换后落到 discarded；用轮询，避免和上一条提示抢时序。
  const discardedDir = path.join(ROOT, 'content-review', 'discarded');
  await expect
    .poll(
      async () => {
        const names = (await fs.readdir(discardedDir)).filter((name) =>
          name.endsWith('.json'),
        );
        const texts = await Promise.all(
          names.map((name) => fs.readFile(path.join(discardedDir, name), 'utf8')),
        );
        return texts.some((text) => text.includes('E2E 审查事件'));
      },
      { timeout: 10_000 },
    )
    .toBe(true);
  expect(errors).toEqual([]);

  await page.screenshot({ path: 'screenshots/v47-review-approved.png' });
});

test('creates and approves dialogue and story drafts', async ({ page }) => {
  await page.goto('/review.html');

  await page.getByRole('button', { name: '新建草稿' }).click();
  await page.locator('.review-modal select').selectOption('dialogue');
  await page.locator('.review-modal input').fill('E2E 审查对话');
  await page.getByRole('button', { name: '创建' }).click();
  await expect(page.locator('.review-json-editor')).toBeVisible();
  await page.locator('.review-json-editor').fill(
    JSON.stringify(
      {
        id: 'dialogue.e2e.review',
        idolId: 'mano',
        startNodeId: 'n01',
        nodes: {
          n01: { id: 'n01', text: '第一句', nextNodeId: 'n02' },
          n02: { id: 'n02', text: '第二句' },
        },
      },
      null,
      2,
    ),
  );
  await page.getByRole('button', { name: '保存草稿' }).first().click();
  await expect(page.locator('.review-editor')).toHaveCount(0);
  await page.getByRole('button', { name: '通过' }).click();
  await expect(page.locator('.review-flash')).toContainText('已通过');

  await page.getByRole('button', { name: '新建草稿' }).click();
  await page.locator('.review-modal select').selectOption('story');
  await page.locator('.review-modal input').fill('E2E 审查剧情链');
  await page.getByRole('button', { name: '创建' }).click();
  await expect(page.locator('.review-json-editor')).toBeVisible();
  await page.locator('.review-json-editor').fill(
    JSON.stringify(
      {
        id: 'story.e2e.review',
        idolId: 'mano',
        steps: [
          {
            id: 'step-1',
            locationId: 'park',
            dialogueId: 'dialogue.e2e.review',
            actionLabel: 'E2E 剧情步骤',
            timeWindow: { fromMinute: 600, toMinute: 1080 },
          },
        ],
      },
      null,
      2,
    ),
  );
  await page.getByRole('button', { name: '保存草稿' }).first().click();
  await expect(page.locator('.review-editor')).toHaveCount(0);
  await page.getByRole('button', { name: '通过' }).click();
  await expect(page.locator('.review-flash')).toContainText('已通过');

  const approved = await fs.readdir(
    path.join(ROOT, 'content-review', 'approved'),
  );
  const texts = await Promise.all(
    approved
      .filter((name) => name.endsWith('.json'))
      .map((name) =>
        fs.readFile(
          path.join(ROOT, 'content-review', 'approved', name),
          'utf8',
        ),
      ),
  );
  expect(texts.some((text) => text.includes('E2E 审查对话'))).toBe(true);
  expect(texts.some((text) => text.includes('E2E 审查剧情链'))).toBe(true);
});
