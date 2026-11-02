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
export async function syncApprovedContent(options?: { strict?: boolean }): Promise<{
  counts: Record<string, number>;
  changed: boolean;
}> {
  // strict（默认 true）只由构建/命令行触发；审查台的 dev server 会在每次通过后同步，
  // 那时候它自己的 E2E 用例正准备写测试草稿——不能拿"发现测试产物"去拦它。
  const strict = options?.strict !== false;
  const drafts = await readApprovedDrafts();

  // E2E 审查用例会真的把草稿批到 approved 里，再在 afterEach 清掉；
  // 中途失败就会留下产物，下一次 build 会把测试内容编进游戏包，
  // 而且 tsc 报错的位置在生成文件里，看起来像生成器的锅（真实踩过）。
  const leftovers = drafts.filter(
    ({ draft }) => typeof draft.title === 'string' && draft.title.startsWith('E2E'),
  );
  if (strict && leftovers.length > 0) {
    const list = leftovers
      .map(({ file, draft }) => `  ${file}（${draft.title}）`)
      .join('\n');
    throw new Error(
      `approved 里混进了 E2E 测试产物，拒绝生成内容包：\n${list}\n` +
        '这是 tests/review 中途失败留下的。删掉这些文件再跑；' +
        '别把测试内容编进游戏包。',
    );
  }

  // 同一个 payload.id 出现两份（典型来源：修订版通过后旧版没退场），
  // 打包结果取决于遍历顺序，游戏里表现成"内容忽新忽旧"。在这里就拦住。
  const byPayloadId = new Map<string, string[]>();
  for (const { file, draft } of drafts) {
    const id = (draft.payload as { id?: string } | undefined)?.id;
    if (typeof id !== 'string' || id === '') continue;
    const list = byPayloadId.get(id) ?? [];
    list.push(file);
    byPayloadId.set(id, list);
  }
  const duplicates = [...byPayloadId.entries()].filter(([, files]) => files.length > 1);
  if (strict && duplicates.length > 0) {
    const list = duplicates
      .map(([id, files]) => `  ${id}：${files.join(' / ')}`)
      .join('\n');
    throw new Error(
      `approved 里有重复的 payload.id，拒绝生成内容包：\n${list}\n` +
        '通常是修订版通过后旧版没被移走——把旧的那份移到 discarded/ 再跑。',
    );
  }

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
    `  topics: ${section(packed.topics.map((x) => x.id), Object.fromEntries(packed.topics.map((x) => [x.id, x])))},`,
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
