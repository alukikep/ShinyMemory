import { auditPack } from '../src/core/contentAudit.js';
import { buildContentIndex } from '../src/core/contentIndexCore.js';
import { packApprovedFiles } from '../src/core/content/approved.js';
import { PRODUCTION_PACK } from '../src/core/productionPack.js';
import { mergeApprovedContent } from '../src/review/approval.js';
import { readApprovedDrafts } from './approvedFiles.js';

const drafts = await readApprovedDrafts();
const approved = packApprovedFiles(
  Object.fromEntries(drafts.map(({ file, draft }) => [file, draft])),
);
const { pack, duplicates } = mergeApprovedContent(PRODUCTION_PACK, approved);
const issues = [
  ...duplicates.map((duplicate) => ({
    level: 'error' as const,
    code: 'duplicate-id',
    message: `approved 内容 ID 重复：${duplicate}`,
  })),
  ...auditPack(buildContentIndex(pack)),
];

const errors = issues.filter((issue) => issue.level === 'error');
const warnings = issues.filter((issue) => issue.level === 'warning');
const strict = process.argv.includes('--strict');

console.log(`内容体检：${errors.length} 个错误，${warnings.length} 个警告`);
console.log(
  `  （基础内容 ${PRODUCTION_PACK.events.length} 事件 / ${PRODUCTION_PACK.activities.length} 行动，approved ${drafts.length} 份）`,
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
