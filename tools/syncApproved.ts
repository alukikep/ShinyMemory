import { promises as fs } from 'node:fs';
import path from 'node:path';
import { packApprovedFiles } from '../src/core/content/approvedPacking.js';
import { readApprovedDrafts } from './approvedFiles.js';

const TARGET = path.join(
  process.cwd(),
  'src',
  'core',
  'content',
  'approved.generated.ts',
);

function section(names: string[], entries: Record<string, unknown>): string {
  const count = names.length;
  if (count === 0) return '[]';
  return `[\n${names.map((name) => JSON.stringify(entries[name], null, 2)).join(',\n')}\n]`;
}

/**
 * 把 `content-review/approved/*.json` 生成为可 import 的 TS 模块。
 *
 * 为什么不用 `import.meta.glob`：构建产物里它运行时不存在，
 * 而无头脚本（tsx、构建门、vite 配置）里它又完全不存在——两边都会坏。
 * 生成文件对两边都成立。
 */
export async function syncApprovedContent(): Promise<{
  counts: Record<string, number>;
  changed: boolean;
}> {
  const drafts = await readApprovedDrafts();
  const packed = packApprovedFiles(
    Object.fromEntries(drafts.map(({ file, draft }) => [file, draft])),
  );

  const body = [
    '// 由 `npm run content:sync` 生成，不要手改。',
    '// 来源：content-review/approved/*.json',
    "import type { ApprovedContent } from './approvedPacking';",
    '',
    'export const APPROVED_CONTENT: ApprovedContent = {',
    `  activities: ${section(packed.activities.map((x) => x.id), Object.fromEntries(packed.activities.map((x) => [x.id, x])))},`,
    `  events: ${section(packed.events.map((x) => x.id), Object.fromEntries(packed.events.map((x) => [x.id, x])))},`,
    `  jobs: ${section(packed.jobs.map((x) => x.id), Object.fromEntries(packed.jobs.map((x) => [x.id, x])))},`,
    `  dialogues: ${section(packed.dialogues.map((x) => x.id), Object.fromEntries(packed.dialogues.map((x) => [x.id, x])))},`,
    `  storyChains: ${section(packed.storyChains.map((x) => x.id), Object.fromEntries(packed.storyChains.map((x) => [x.id, x])))},`,
    `  items: ${section(packed.items.map((x) => x.id), Object.fromEntries(packed.items.map((x) => [x.id, x])))},`,
    `  shops: ${section(packed.shops.map((x) => x.id), Object.fromEntries(packed.shops.map((x) => [x.id, x])))},`,
    '};',
    '',
  ].join('\n');

  let previous = '';
  try {
    previous = await fs.readFile(TARGET, 'utf8');
  } catch {
    previous = '';
  }
  const changed = previous !== body;
  if (changed) await fs.writeFile(TARGET, body, 'utf8');

  return {
    counts: {
      activities: packed.activities.length,
      events: packed.events.length,
      jobs: packed.jobs.length,
      dialogues: packed.dialogues.length,
      storyChains: packed.storyChains.length,
      items: packed.items.length,
      shops: packed.shops.length,
    },
    changed,
  };
}

const invokedDirectly = process.argv[1]
  ?.replace(/\\/g, '/')
  .endsWith('tools/syncApproved.ts');

if (invokedDirectly) {
  const result = await syncApprovedContent();
  const summary = Object.entries(result.counts)
    .filter(([, count]) => count > 0)
    .map(([kind, count]) => `${kind} ${count}`)
    .join(', ');
  console.log(
    `approved 内容已同步${result.changed ? '' : '（无变化）'}：${summary || '（空）'}`,
  );
}
