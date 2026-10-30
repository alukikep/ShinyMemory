import { BASE_PACK } from '../src/core/content/basePack.js';
import { packApprovedFiles } from '../src/core/content/approvedPacking.js';
import { buildContentIndex } from '../src/core/contentIndexCore.js';
import { mergeApprovedContent } from '../src/review/approval.js';
import { readApprovedDrafts } from './approvedFiles.js';

/**
 * 角色覆盖度报告。
 *
 * 生产手册里有一张「一个角色应该有多少内容」的矩阵，但之前只能靠人记。
 * 这个脚本把它变成可执行的检查：每个偶像按单元数一遍，缺什么直接列出来。
 *
 * 用法：npm run content:coverage
 */

type Row = {
  unit: string;
  count: number;
  min: number;
};

const approved = await readApprovedDrafts();
const merged = mergeApprovedContent(
  BASE_PACK,
  packApprovedFiles(
    Object.fromEntries(approved.map(({ file, draft }) => [file, draft])),
  ),
);
const index = buildContentIndex(merged.pack);

function countFor(idolId: string): Map<string, number> {
  const counts = new Map<string, number>();
  const bump = (key: string) => counts.set(key, (counts.get(key) ?? 0) + 1);

  for (const activity of index.activities.values()) {
    // 没有 idolIds = 全员通用（训练课就是这种）。
    const own = activity.idolIds?.includes(idolId) ?? false;
    // 训练课是全员通用的（没有 idolIds）；专属行动必须点名到她。
    if (activity.kind === 'training' && (!activity.idolIds || own)) {
      bump('训练行动');
    } else if (activity.kind === 'bond' && own) {
      bump('专属行动');
    }
  }

  const actor = index.actors.get(idolId);
  for (const topic of actor?.topics ?? []) {
    if (topic.id.startsWith(`${idolId}.chat.`)) bump('日常话题');
  }

  for (const event of index.events.values()) {
    const anchored =
      event.afterIdol?.ids?.includes(idolId) ||
      event.after?.ids?.includes(idolId) ||
      event.entry?.kind === 'arrival';
    if (anchored) bump('事件');
  }

  for (const chain of index.storyChains.values()) {
    if (chain.idolId === idolId) bump('剧情链');
  }

  for (const dialogue of index.dialogues.values()) {
    if (dialogue.idolId === idolId) bump('对话');
  }

  return counts;
}

let ok = true;

for (const idol of [...index.idols.values()]) {
  const counts = countFor(idol.id);
  const rows: Row[] = [
    { unit: '训练行动', count: counts.get('训练行动') ?? 0, min: 3 },
    { unit: '专属行动', count: counts.get('专属行动') ?? 0, min: 1 },
    { unit: '日常话题', count: counts.get('日常话题') ?? 0, min: 6 },
    { unit: '事件', count: counts.get('事件') ?? 0, min: 3 },
    { unit: '剧情链', count: counts.get('剧情链') ?? 0, min: 2 },
    { unit: '对话', count: counts.get('对话') ?? 0, min: 2 },
    { unit: '工作（全角色共享）', count: index.jobs.size, min: 2 },
  ];

  console.log(`\n${idol.name}（${idol.id}）`);
  for (const row of rows) {
    const short = row.count < row.min;
    if (short) ok = false;
    console.log(`  ${short ? '×' : '✓'} ${row.unit}：${row.count} / ${row.min}`);
  }
}

if (merged.duplicates.length > 0) {
  console.log(`\n重复 id：${merged.duplicates.join('，')}`);
  ok = false;
}

console.log('');
if (ok) {
  console.log('覆盖度检查通过。');
} else {
  console.log('有缺的内容（见上），按生产手册第 3 节补。');
  process.exitCode = 1;
}
