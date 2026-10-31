import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { PENDING_CHAPTERS } from '../src/core/content/chapters/index.js';
import { CHAPTER_SOURCES } from '../src/core/content/chapterSources.js';
import { readApprovedDrafts } from './approvedFiles.js';
import { mergeApprovedContent } from '../src/review/approval.js';
import { packApprovedFiles } from '../src/core/content/approvedPacking.js';
import { BASE_PACK } from '../src/core/content/basePack.js';

/**
 * 卡面剧情生产看板。
 *
 * 一条命令看清：哪些章已经进游戏、哪些在等审、配置对不对。
 * 不是校验器（那是 content:anchors 的活），是"我现在做到哪了"。
 *
 *   npm run content:board
 */

const approved = await readApprovedDrafts();
const merged = mergeApprovedContent(
  BASE_PACK,
  packApprovedFiles(
    Object.fromEntries(approved.map(({ file, draft }) => [file, draft])),
  ),
).pack;

const approvedDialogueIds = new Set(merged.dialogues.map((dialogue) => dialogue.id));
const dialogueById = new Map(merged.dialogues.map((d) => [d.id, d]));

const pendingDrafts = new Map<string, { nodes: Record<string, unknown>; startNodeId: string }>();
const draftsDir = 'content-review/drafts';
if (existsSync(draftsDir)) {
  for (const name of readdirSync(draftsDir)) {
    if (!name.endsWith('.json')) continue;
    const raw = JSON.parse(readFileSync(path.join(draftsDir, name), 'utf8')) as {
      payload?: { id?: string; nodes?: Record<string, unknown>; startNodeId?: string };
    };
    if (raw.payload?.id) {
      pendingDrafts.set(raw.payload.id, {
        nodes: raw.payload.nodes ?? {},
        startNodeId: raw.payload.startNodeId ?? '',
      });
    }
  }
}

type Row = {
  chainId: string;
  idol: string;
  index: string;
  title: string;
  script: string;
  place: string;
  window: string;
  day: string;
  needs: string;
  state: string;
  nodes: number;
  branches: number;
};

const cardChains = PENDING_CHAPTERS.filter((chain) => (chain.kind ?? 'card') === 'card');
const arcChains = PENDING_CHAPTERS.filter((chain) => chain.kind === 'arc');

const rows: Row[] = [];
const problems: string[] = [];

for (const chain of cardChains) {
  for (const [stepIndex, step] of chain.steps.entries()) {
  const dialogueId = step?.dialogueId ?? '';
  const source = CHAPTER_SOURCES.find((entry) => entry.chapterId === step.id);
  const isApproved = approvedDialogueIds.has(dialogueId);
  const draft = pendingDrafts.get(dialogueId);
  const nodes = isApproved
    ? Object.keys(dialogueById.get(dialogueId)?.nodes ?? {}).length
    : Object.keys(draft?.nodes ?? {}).length;
  const nodeSet = isApproved
    ? dialogueById.get(dialogueId)?.nodes ?? {}
    : (draft?.nodes ?? {});
  const choiceNode = Object.values(nodeSet).find(
    (node) => Array.isArray((node as { choices?: unknown[] }).choices),
  ) as { choices?: unknown[] } | undefined;
  const branches = choiceNode?.choices?.length ?? 0;

  const dayCond = (step?.when ?? []).find((c) => c.kind === 'dayAtLeast') as
    | { day?: number }
    | undefined;

  rows.push({
    chainId: chain.id,
    idol: chain.idolId,
    index: `${stepIndex + 1}/${chain.steps.length}`,
    title: chain.title,
    script: source?.script ?? '—',
    place: step?.locationId ?? '—',
    window: step?.timeWindow
      ? `${String(Math.floor(step.timeWindow.fromMinute / 60)).padStart(2, '0')}:00–${String(Math.floor(step.timeWindow.toMinute / 60)).padStart(2, '0')}:00`
      : '全天',
    day: dayCond?.day !== undefined ? `第 ${dayCond.day} 天` : '—',
    needs: (step?.when ?? [])
      .filter((c) => c.kind === 'flag')
      .map((c) => String((c as { key?: string }).key ?? ''))
      .join(', ') || '（无）',
    state: isApproved ? '已上线' : draft ? '待审' : '缺对话',
    nodes,
    branches,
  });

  if (!isApproved && !draft) {
    problems.push(`${chain.id}：找不到对话（既没批准也没草稿）`);
  }
  if (isApproved && draft) {
    problems.push(`${chain.id}：对话已批准，但 drafts 里还留着一份`);
  }
  if (!source) problems.push(`${chain.id}：没在 chapterSources 登记剧本编号`);
  if (!step?.locationId) problems.push(`${chain.id}：没有触发地点`);
  if ((step?.effects ?? []).filter((e) => e.kind === 'flag').length === 0) {
    problems.push(`${step?.id ?? chain.id}：结束没有写 flag`);
  }
  }
}

// 同一地点 + 同一动作名 = 测试和玩家都会点错（真实踩过：她提前来了 是巡的）
const byAction = new Map<string, string[]>();
for (const chain of cardChains) {
  for (const step of chain.steps) {
    if (!step?.actionLabel) continue;
    const key = `${step.locationId}::${step.actionLabel}`;
    byAction.set(key, [...(byAction.get(key) ?? []), step.id ?? chain.id]);
  }
}
for (const [key, owners] of byAction) {
  if (owners.length > 1) {
    problems.push(`动作名重复：${key} 被 ${owners.join(' 和 ')} 用了`);
  }
}

// 一个偶像的章节，天数必须递增
for (const key of new Set(rows.map((row) => row.chainId))) {
  const days = rows
    .filter((row) => row.chainId === key)
    .map((row) => Number(row.day.replace(/[^0-9]/g, '')))
    .filter((day) => Number.isFinite(day));
  for (let index = 1; index < days.length; index += 1) {
    if (days[index]! <= days[index - 1]!) {
      problems.push(`${key}：第 ${index + 1} 章的天数没有晚于前一章`);
    }
  }
}

const pad = (text: string, width: number) => {
  const visible = [...text].length;
  return text + ' '.repeat(Math.max(0, width - visible));
};

console.log('');
console.log(
  ['偶像', '节', '标题', '剧本', '地点', '时间', '最早', '节点', '分支', '状态']
    .map((header, index) =>
      pad(header, [6, 6, 24, 12, 14, 13, 9, 6, 6, 8][index]!),
    )
    .join(''),
);
console.log('-'.repeat(110));
const dayOf = (row: Row) => Number(row.day.replace(/[^0-9]/g, '')) || 0;
for (const row of rows.sort((a, b) => a.idol.localeCompare(b.idol) || dayOf(a) - dayOf(b))) {
  console.log(
    pad(row.idol, 6) +
      pad(row.index, 6) +
      pad(row.title, 24) +
      pad(row.script, 12) +
      pad(row.place, 14) +
      pad(row.window, 13) +
      pad(row.day, 9) +
      pad(String(row.nodes), 6) +
      pad(String(row.branches), 6) +
      pad(row.state, 8),
  );
}
console.log('');

const live = rows.filter((row) => row.state === '已上线').length;
const waiting = rows.filter((row) => row.state === '待审').length;
// 每一步都要有出处：step.source 或有 chapterSources 条目。
// 旧的三条长线和招募链是在这条规则之前写的，先豁免（记为技术债）。
const LEGACY_CHAINS = new Set([
  'mano-encounter',
  'hiori-encounter',
  'meguru-encounter',
  'mano-slump',
  'hiori-gap',
  'meguru-burden',
]);

for (const chain of PENDING_CHAPTERS) {
  if (LEGACY_CHAINS.has(chain.id)) continue;
  for (const step of chain.steps) {
    const source =
      step.source ??
      CHAPTER_SOURCES.find((entry) => entry.chapterId === step.id)?.script;
    if (!source) {
      problems.push(
        `${chain.id}：步骤 ${step.id} 没有出处（step.source 或 chapterSources）`,
      );
      continue;
    }
    if (/^\d{9}$/.test(source) && !existsSync(path.join('.cache', 'shiny', `${source}.json`))) {
      problems.push(`${chain.id}：步骤 ${step.id} 的出处 ${source} 没有导出过`);
    }
  }
}

// 一张卡 = 一条链：步数必须等于登记的总段数，每步都要有出处表条目
for (const chain of cardChains) {
  const sources = CHAPTER_SOURCES.filter((entry) =>
    chain.steps.some((step) => step.id === entry.chapterId),
  );
  const totals = new Set(sources.map((entry) => entry.card?.total).filter(Boolean));
  const total = totals.values().next().value as number | undefined;
  if (total !== undefined && chain.steps.length !== total) {
    problems.push(
      `${chain.id}：链有 ${chain.steps.length} 步，但登记的总段数是 ${total}`,
    );
  }
  for (const step of chain.steps) {
    if (!CHAPTER_SOURCES.some((entry) => entry.chapterId === step.id)) {
      problems.push(`${chain.id}：步骤 ${step.id} 没有在 chapterSources 登记`);
    }
  }
}

// 按卡汇总：玩家/策划关心的是"几张卡"，章只是细分
const byCard = new Map<
  string,
  { idol: string; title: string; total: number; live: number }
>();
for (const row of rows) {
  const entry = byCard.get(row.chainId) ?? {
    idol: row.idol,
    title: row.title,
    total: 0,
    live: 0,
  };
  entry.total += 1;
  if (row.state === '已上线') entry.live += 1;
  byCard.set(row.chainId, entry);
}

console.log(
  `\n卡面剧情：${byCard.size} 张卡 · ${rows.length} 章（已上线 ${live}，待审 ${waiting}）`,
);
for (const [, card] of [...byCard.entries()].sort((a, b) =>
  a[1].idol.localeCompare(b[1].idol),
)) {
  console.log(
    `  ${card.idol.padEnd(7)}${card.title.padEnd(22)}${card.live}/${card.total} 章`,
  );
}
console.log(`\n另有长线/招募链 ${arcChains.length} 条（不在本表里，见 content:coverage）`);

if (problems.length > 0) {
  console.log(`\n⚠ 配置问题 ${problems.length} 条：`);
  for (const problem of problems) console.log(`  · ${problem}`);
  process.exitCode = 1;
} else {
  console.log('\n配置检查：全部通过');
}
