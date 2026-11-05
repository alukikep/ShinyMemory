import { buildCoverageComparison } from '../src/core/coverageComparison.js';
import { PENDING_IDOLS } from '../src/core/content/pending.js';
import { loadInventorySource } from './contentInventoryService.js';
import { parseInventoryArgs } from './contentInventory.js';

try {
  const args = parseInventoryArgs(process.argv.slice(2), 'content:coverage:compare');
  const source = await loadInventorySource();
  const report = buildCoverageComparison(source.assembly.pack, source.registeredChains, PENDING_IDOLS);
  report.warnings = [...new Set([...source.warnings, ...report.warnings])].sort();
  if (args.idol && !report.idols.some(i => i.id === args.idol)) throw new Error(`未知偶像：${args.idol}`);
  if (args.idol) report.idols = report.idols.filter(i => i.id === args.idol);
  if (args.json) console.log(JSON.stringify(report, null, 2));
  else {
    console.log(`本命令只读，不执行内容门禁。${report.policy}`);
    for (const idol of report.idols) {
      if (!args.idol && !args.details) {
        console.log(`${idol.name} (${idol.id})：变化 ${idol.metrics.reduce((sum, m) => sum + m.differences.length, 0)} 条 · 新口径缺口 ${idol.metrics.reduce((sum, m) => sum + m.simulatedDeficit, 0)}${idol.pending ? ' · 接入中' : ''}`);
        continue;
      }
      console.log(`\n${idol.name} (${idol.id})${idol.pending ? ' · 接入中' : ''}`);
      for (const metric of idol.metrics) {
        console.log(`  ${metric.label}：旧 ${metric.legacyCount} → 新 ${metric.proposedCount} · 变化 ${metric.differences.length} 条 · 门槛 ${metric.minimum}${metric.simulatedDeficit ? ` · 新口径缺口 ${metric.simulatedDeficit}` : ''}`);
        if (args.details) for (const difference of metric.differences) console.log(`    ${difference.change === 'added' ? '+' : '-'} ${difference.key}\n      旧依据：${difference.legacyEvidence.join('; ') || '未命中'}\n      关联事实：${difference.relations.map(r => `${r.idolId}:${r.role}@${r.path}`).join('; ') || '无显式偶像关联'}\n      ${difference.explanation}`);
      }
    }
    console.log(`\n诊断 ${report.warnings.length} 条；无偶像关联的对话/链/话题 ${report.unassignedKeys.length} 条。使用 --details 或 --json 查看依据。`);
    if (args.details) { for (const warning of report.warnings) console.log(`警告：${warning}`); for (const key of report.unassignedKeys) console.log(`无偶像关联：${key}`); }
  }
} catch (error) { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; }
