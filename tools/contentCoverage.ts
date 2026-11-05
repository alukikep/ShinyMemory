import { BASE_PACK } from '../src/core/content/basePack.js';
import { packApprovedFiles } from '../src/core/content/approvedPacking.js';
import { buildContentIndex } from '../src/core/contentIndexCore.js';
import { PENDING_CHAPTERS } from '../src/core/content/chapters/index.js';
import { PENDING_IDOLS } from '../src/core/content/pending.js';
import { assembleContent } from '../src/core/contentAssembly.js';
import { readApprovedDrafts } from './approvedFiles.js';
import { buildCoverageComparison } from '../src/core/coverageComparison.js';

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
const quiet = process.argv.includes('--quiet');
const failures: string[] = [];
const assembly = assembleContent(
  BASE_PACK,
  packApprovedFiles(
    Object.fromEntries(approved.map(({ file, draft }) => [file, draft])),
  ),
  PENDING_CHAPTERS,
);
for (const diagnostic of assembly.diagnostics) console.warn(`装配诊断：${diagnostic.message}`);
const index = buildContentIndex(assembly.pack);

const comparison = buildCoverageComparison(assembly.pack, PENDING_CHAPTERS, PENDING_IDOLS);
for (const warning of comparison.warnings) console.warn(`归属诊断：${warning}`);

let ok = true;

for (const idol of [...index.idols.values()]) {
  const metrics = comparison.idols.find(row => row.id === idol.id)!.metrics;
  const pending = PENDING_IDOLS.includes(idol.id);
  const rows: Row[] = metrics.map(metric => ({ unit: metric.label, count: metric.proposedCount, min: metric.minimum }));

  if (!quiet) {
    console.log(`\n${idol.name}（${idol.id}）${pending ? ' · 接入中' : ''}`);
  }
  for (const row of rows) {
    const short = row.count < row.min;
    if (short && !pending) {
      ok = false;
      failures.push(
        `${idol.name}（${idol.id}）${row.unit}：${row.count} / ${row.min}`,
      );
    }
    if (!quiet) {
      console.log(
        `  ${short ? '×' : '✓'} ${row.unit}：${row.count} / ${row.min}${short && pending ? '（接入中，不算失败）' : ''}`,
      );
    }
  }
}

if (assembly.duplicates.length > 0) {
  console.log(`\n重复 id：${assembly.duplicates.join('，')}`);
  failures.push(`重复 id：${assembly.duplicates.join('，')}`);
  ok = false;
}

if (quiet) {
  if (ok) {
    console.log(`覆盖度：${index.idols.size} 个偶像，全部达标`);
  } else {
    console.log(`覆盖度：${index.idols.size} 个偶像，${failures.length} 项未达标`);
    for (const failure of failures) console.log(`  - ${failure}`);
  }
} else {
  console.log('');
  if (ok) {
    console.log('覆盖度检查通过。');
  } else {
    console.log('有缺的内容（见上），按生产手册第 3 节补。');
  }
}

if (!ok) {
  process.exitCode = 1;
}
