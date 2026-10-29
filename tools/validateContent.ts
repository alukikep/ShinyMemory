import { auditPack } from '../src/core/contentAudit.js';
import { buildContentIndex } from '../src/core/contentIndexCore.js';
import { packApprovedFiles } from '../src/core/content/approvedPacking.js';
import { BASE_PACK } from '../src/core/content/basePack.js';
import { mergeApprovedContent } from '../src/review/approval.js';
import { validateDraftShape } from '../src/review/validation.js';
import { readApprovedDrafts } from './approvedFiles.js';

const drafts = await readApprovedDrafts();
const errors: string[] = [];

// 1. 每份草稿先过结构检查（字段齐不齐、类型对不对）。
for (const { file, draft } of drafts) {
  for (const error of validateDraftShape(draft)) {
    errors.push(`${file}: ${error}`);
  }
}

// 2. 全量合并后跑一次体检——和审查台“通过”时用的是同一套规则。
const approved = packApprovedFiles(
  Object.fromEntries(drafts.map(({ file, draft }) => [file, draft])),
);
const { pack, duplicates } = mergeApprovedContent(BASE_PACK, approved);
for (const duplicate of duplicates) {
  errors.push(`ID 与现有内容重复：${duplicate}`);
}
for (const issue of auditPack(buildContentIndex(pack))) {
  errors.push(
    `${issue.level === 'error' ? '[错误]' : '[警告]'} ${issue.code}: ${issue.message}`,
  );
}

if (errors.length > 0) {
  console.error('content validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  const count = (kind: string) =>
    drafts.filter(({ draft }) => draft.kind === kind).length;
  console.log(
    `content validation passed: ${count('activity')} activities, ${count('event')} events, ${count('job')} jobs, ${count('dialogue')} dialogues, ${count('story')} stories`,
  );
}
