import { auditPack } from '../src/core/contentAudit.js';
import { buildContentIndex } from '../src/core/contentIndexCore.js';
import { packApprovedFiles } from '../src/core/content/approvedPacking.js';
import { BASE_PACK } from '../src/core/content/basePack.js';
import { assembleContent } from '../src/core/contentAssembly.js';
import { PENDING_CHAPTERS } from '../src/core/content/chapters/index.js';
import { readApprovedDrafts } from './approvedFiles.js';

const drafts = await readApprovedDrafts();
const approved = packApprovedFiles(
  Object.fromEntries(drafts.map(({ file, draft }) => [file, draft])),
);
const assembly = assembleContent(BASE_PACK, approved, PENDING_CHAPTERS);
const { duplicates } = assembly;

// 与 productionPack 共用同一拼装：卡面/长线结构要算进来，
// 否则会误报「工作解锁 flag 没人设置」——真实踩过。
const fullPack = assembly.pack;
for (const diagnostic of assembly.diagnostics.filter(d => d.kind !== 'merge-conflict')) console.warn(`装配诊断：${diagnostic.message}`);

const issues = [
  ...duplicates.map((duplicate) => ({
    level: 'error' as const,
    code: 'duplicate-id',
    message: `approved 内容 ID 重复：${duplicate}`,
  })),
  ...auditPack(buildContentIndex(fullPack)),
];

const errors = issues.filter((issue) => issue.level === 'error');
const warnings = issues.filter((issue) => issue.level === 'warning');
const strict = process.argv.includes('--strict');

console.log(`内容体检：${errors.length} 个错误，${warnings.length} 个警告`);
console.log(
  `  （基础内容 ${BASE_PACK.events.length} 事件 / ${BASE_PACK.activities.length} 行动，approved ${drafts.length} 份）`,
);

for (const issue of errors) {
  console.log(`  [错误] ${issue.code}: ${issue.message}`);
}
for (const issue of warnings) {
  console.log(`  [警告] ${issue.code}: ${issue.message}`);
}

if (errors.length > 0 || (strict && warnings.length > 0)) {
  process.exit(1);
}
