import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { InventoryReport } from '../src/shared/contentInventoryTypes.js';
import { loadInventory } from './contentInventoryService.js';

export function parseInventoryArgs(args: string[], command = 'content:inventory') {
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
    else throw new Error(`非法参数：${arg}。用法：${command} [--idol ID] [--details] [--json]`);
  }
  return { idol, json, details };
}

export function selectInventory(report: InventoryReport, idol?: string): InventoryReport {
  if (!idol) return report;
  const row = report.idols.find(i => i.id === idol);
  if (!row) throw new Error(`未知偶像：${idol}。可用 ID：${report.idols.map(i => i.id).join(', ')}`);
  const keys = new Set([...row.keys, ...row.pendingKeys]);
  // Shared/unresolved records remain inspectable; otherwise an idol query can conceal unassigned drafts.
  for (const key of [...report.sharedKeys, ...report.unresolvedKeys]) keys.add(key);
  return { ...report, idols: [row], cards: report.cards.filter(c => c.idolId === idol), dateScenarios: report.dateScenarios.filter(s => s.idolId === idol), entries: report.entries.filter(e => keys.has(e.key)) };
}

export function formatInventory(report: InventoryReport, details: boolean) {
  const lines = [report.basis, '卡=完整接入/登记；章=链已接入/对话可用/原卡总章数；其余产量仅统计已接入。分类有重叠，不可相加。',
    '偶像\t卡\t章\t招募/长线\t专属/多人行动\t话题\t主属/参与对话\t专属/参与/条件事件\t待处理\t约会方案'];
  for (const row of report.idols) {
    const c = row.counts;
    lines.push(`${row.name} (${row.id})\t${c.integratedCards}/${c.cards}\t${c.integratedCardChapters}/${c.availableCardChapters}/${c.cardChapters}\t${c.recruitment}/${c.arcs}\t${c.exclusiveActions}/${c.participantActions}\t${c.topics}\t${c.dialogues}/${c.participantDialogues}\t${c.exclusiveEvents}/${c.participantEvents}/${c.conditionEvents}\t${c.pending}\t${c.dateScenarios}`);
  }
  lines.push(`通用/动态 ${report.sharedKeys.length}；待确认归属 ${report.unresolvedKeys.length}；警告 ${report.warnings.length}；历史 ${JSON.stringify(report.history)}`);
  if (details) {
    for (const s of report.dateScenarios) lines.push(`约会方案 ${s.id} · ${s.title} · ${s.idolId} / ${s.locationId} → ${s.dialogueId} · ${s.integrated ? '已接入' : '未接入'} · ${s.file} ${s.problems.join('; ')}`);
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
