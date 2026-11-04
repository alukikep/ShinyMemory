import { promises as fs } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { buildContentInventory, type InventorySnapshot } from '../src/core/contentInventory.js';
import { BASE_PACK } from '../src/core/content/basePack.js';
import { APPROVED_CONTENT } from '../src/core/content/approved.generated.js';
import { packApprovedFiles } from '../src/core/content/approvedPacking.js';
import { attachPendingChapters } from '../src/core/content/assemblePack.js';
import { PENDING_CHAPTERS } from '../src/core/content/chapters/index.js';
import { CHAPTER_SOURCES } from '../src/core/content/chapterSources.js';
import { mergeApprovedContent } from '../src/review/approval.js';
import { REVIEW_KINDS, type ReviewKind } from '../src/review/types.js';

export function parseInventoryArgs(args: string[]) {
  let idol: string | undefined;
  let json = false;
  let details = false;
  const seen = new Set<string>();
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (seen.has(arg)) throw new Error(`重复参数：${arg}`);
    seen.add(arg);
    if (arg === '--json') json = true;
    else if (arg === '--details') details = true;
    else if (arg === '--idol' && args[i + 1] && !args[i + 1].startsWith('--')) idol = args[++i];
    else throw new Error(`非法参数：${arg}。用法：content:inventory [--idol ID] [--details] [--json]`);
  }
  return { idol, json, details };
}

// Unlike forgiving review readers, inventory must never turn an unreadable directory into zero content.
export async function readInventorySnapshots(root = process.cwd()): Promise<InventorySnapshot[]> {
  const result: InventorySnapshot[] = [];
  for (const [dir, status] of [['approved', 'approved'], ['drafts', 'review'], ['revisions', 'revision']] as const) {
    const directory = path.join(root, 'content-review', dir);
    const names = await fs.readdir(directory);
    for (const name of names.filter(n => n.endsWith('.json')).sort()) {
      const file = `content-review/${dir}/${name}`;
      try {
        const raw = JSON.parse(await fs.readFile(path.join(directory, name), 'utf8'));
        if (!raw || !REVIEW_KINDS.includes(raw.kind as ReviewKind) || typeof raw.id !== 'string'
          || !raw.payload || typeof raw.payload.id !== 'string' || !raw.payload.id) throw new Error('缺少合法的 kind、草稿 id 或 payload.id');
        result.push({ file, status, draft: raw });
      } catch (error) { throw new Error(`${file}: ${error instanceof Error ? error.message : String(error)}`); }
    }
  }
  return result;
}

export function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.entries(value).filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(',')}}`;
  return JSON.stringify(value) ?? 'null';
}

export async function loadInventory(root = process.cwd()) {
  const snapshots = await readInventorySnapshots(root);
  const approved = packApprovedFiles(Object.fromEntries(snapshots.filter(s => s.status === 'approved').map(s => [s.file, s.draft])));
  const merged = mergeApprovedContent(BASE_PACK, approved);
  const warnings = merged.duplicates.map(d => `装配警告：${d}`);
  if (canonical(approved) !== canonical(APPROVED_CONTENT)) warnings.push('approved.generated.ts 与批准源文件不同步；本命令未执行 content:sync');
  const report = buildContentInventory({ pack: attachPendingChapters(merged.pack), registeredChains: PENDING_CHAPTERS,
    sources: CHAPTER_SOURCES, snapshots, warnings, basePack: BASE_PACK });
  const history: Record<string, number> = {};
  for (const dir of ['archived', 'discarded']) history[dir] = (await fs.readdir(path.join(root, 'content-review', dir))).filter(n => n.endsWith('.json')).length;
  return { ...report, history };
}

export function selectInventory(report: Awaited<ReturnType<typeof loadInventory>>, idol?: string) {
  if (!idol) return report;
  const row = report.idols.find(i => i.id === idol);
  if (!row) throw new Error(`未知偶像：${idol}。可用 ID：${report.idols.map(i => i.id).join(', ')}`);
  const keys = new Set([...row.keys, ...row.pendingKeys]);
  // Shared/unresolved records remain inspectable; otherwise an idol query can conceal unassigned drafts.
  for (const key of [...report.sharedKeys, ...report.unresolvedKeys]) keys.add(key);
  return { ...report, idols: [row], cards: report.cards.filter(c => c.idolId === idol), entries: report.entries.filter(e => keys.has(e.key)) };
}

export function formatInventory(report: Awaited<ReturnType<typeof loadInventory>>, details: boolean) {
  const lines = [report.basis, '卡=完整接入/登记；章=链已接入/对话可用/原卡总章数；其余产量仅统计已接入。分类有重叠，不可相加。',
    '偶像\t卡\t章\t招募/长线\t专属/多人行动\t话题\t主属/参与对话\t专属/参与/条件事件\t待处理'];
  for (const row of report.idols) {
    const c = row.counts;
    lines.push(`${row.name} (${row.id})\t${c.integratedCards}/${c.cards}\t${c.integratedCardChapters}/${c.availableCardChapters}/${c.cardChapters}\t${c.recruitment}/${c.arcs}\t${c.exclusiveActions}/${c.participantActions}\t${c.topics}\t${c.dialogues}/${c.participantDialogues}\t${c.exclusiveEvents}/${c.participantEvents}/${c.conditionEvents}\t${c.pending}`);
  }
  lines.push(`通用/动态 ${report.sharedKeys.length}；待确认归属 ${report.unresolvedKeys.length}；警告 ${report.warnings.length}；历史 ${JSON.stringify(report.history)}`);
  if (details) {
    for (const card of report.cards) lines.push(`卡面 ${card.key}：链已接入 ${card.chapters.filter(c => c.integrated).length}/${card.expected}，对话可用 ${card.chapters.filter(c => c.available).length}/${card.expected}，已登记 ${card.chapters.length}/${card.expected}；链 ${card.chainIds.join(', ')}`);
    for (const entry of report.entries) {
      lines.push(`\n${entry.key} · ${entry.title} · ${entry.scope}${entry.storyType ? ` · ${entry.storyType}` : ''}`);
      for (const v of entry.versions) lines.push(`  ${v.approval} / ${v.integration}${v.reason ? ` (${v.reason})` : ''} · ${v.file} · draft=${v.draftId ?? '-'} v${v.version ?? '-'} root=${v.rootId ?? '-'} supersedes=${v.supersedes ?? '-'}\n  归属：${v.relations.map(r => `${r.idolId}:${r.role}@${r.path}`).join('; ') || '通用/动态或待确认（见 scope）'}`);
      for (const c of entry.chapters ?? []) lines.push(`  章 ${c.id} → ${c.dialogueId} · 对话${c.available ? '可用' : '缺失'} / 链${c.integrated ? '已接入' : '未接入'} · ${c.source?.card ? `${c.source.card.title} ${c.source.card.index}/${c.source.card.total}` : ''} · script=${c.source?.script ?? c.script ?? '-'} · source=${c.source?.source ?? '-'}`);
    }
    for (const warning of report.warnings) lines.push(`警告：${warning}`);
  } else if (report.warnings.length) lines.push('使用 --details 或 --json 查看警告与归属依据。');
  return lines.join('\n');
}

async function main() {
  const args = parseInventoryArgs(process.argv.slice(2));
  const report = selectInventory(await loadInventory(), args.idol);
  console.log(args.json ? JSON.stringify(report, null, 2) : formatInventory(report, args.details));
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch(error => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
}
