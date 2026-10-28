import { auditContent } from '../src/core/contentAudit.js';

const issues = auditContent();
const errors = issues.filter((issue) => issue.level === 'error');
const warnings = issues.filter((issue) => issue.level === 'warning');
const strict = process.argv.includes('--strict');

console.log(`内容体检：${errors.length} 个错误，${warnings.length} 个警告`);

for (const issue of errors) {
  console.log(`  [错误] ${issue.code}: ${issue.message}`);
}
for (const issue of warnings) {
  console.log(`  [警告] ${issue.code}: ${issue.message}`);
}

if (errors.length > 0 || (strict && warnings.length > 0)) {
  process.exit(1);
}
