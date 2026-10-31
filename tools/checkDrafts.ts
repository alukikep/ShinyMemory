import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { BASE_PACK } from '../src/core/content/basePack.js';
import { packApprovedFiles } from '../src/core/content/approvedPacking.js';
import { mergeApprovedContent } from '../src/review/approval.js';
import type { ReviewDraft } from '../src/review/types.js';
import { validateReviewDraft } from '../src/review/validation.js';
import { readApprovedDrafts } from './approvedFiles.js';

/**
 * 离线校验审查台里还没过的草稿。
 *
 * 为什么需要它：审查台只在**人点「通过」**时才跑 `validateReviewDraft`，
 * 而 AI 写完草稿直接落盘，交付前无法自检。批量生产时这点很致命——
 * 一个 dialogue-ref 要等人点到那一条才发现。
 *
 * 规则和审查台完全一致（同一个 `validateReviewDraft` + 同一个基准包算法），
 * 所以这里绿了，审查台就不会因为"校验"挡人。
 *
 * 用法：npm run content:drafts
 */

const CONTENT_ROOT = path.join(process.cwd(), 'content-review');
const DIRS: { dir: string; label: string }[] = [
  { dir: 'drafts', label: '待审' },
  { dir: 'revisions', label: '待修改' },
];

type PendingDraft = {
  file: string;
  dir: string;
  draft: ReviewDraft;
};

async function readPending(): Promise<PendingDraft[]> {
  const out: PendingDraft[] = [];
  for (const { dir } of DIRS) {
    const directory = path.join(CONTENT_ROOT, dir);
    let names: string[] = [];
    try {
      names = await readdir(directory);
    } catch {
      continue;
    }
    for (const name of names.filter((entry) => entry.endsWith('.json')).sort()) {
      const raw = await readFile(path.join(directory, name), 'utf8');
      let draft: ReviewDraft;
      try {
        draft = JSON.parse(raw) as ReviewDraft;
      } catch (error) {
        out.push({
          file: `${dir}/${name}`,
          dir,
          draft: {
            id: name,
            kind: 'activity',
            title: name,
            status: 'review',
            payload: {},
            annotations: [],
            createdAt: '',
            updatedAt: '',
            history: [],
          },
        });
        out[out.length - 1]!.draft.history = [
          {
            status: 'review',
            at: '',
            note: `JSON 解析失败：${error instanceof Error ? error.message : String(error)}`,
          },
        ];
        continue;
      }
      out.push({ file: `${dir}/${name}`, dir, draft });
    }
  }
  return out;
}

/** 和审查台一致的基准包：生产内容 + 其他 approved，排除自己（和要替换的旧版）。 */
async function basePackFor(excludeIds: string[]) {
  const skip = new Set(excludeIds.filter(Boolean));
  const drafts = await readApprovedDrafts();
  const approved = packApprovedFiles(
    Object.fromEntries(
      drafts
        .filter(
          ({ draft }) =>
            !skip.has(draft.id) &&
            !skip.has(
              String((draft.payload as { id?: string } | undefined)?.id ?? ''),
            ),
        )
        .map(({ file, draft }) => [file, draft]),
    ),
  );
  return mergeApprovedContent(BASE_PACK, approved).pack;
}

const pending = await readPending();
let errors = 0;
let warnings = 0;

console.log(
  `检查审查台草稿：${pending.length} 条（drafts ${pending.filter((p) => p.dir === 'drafts').length}，revisions ${pending.filter((p) => p.dir === 'revisions').length}）`,
);

for (const { file, draft } of pending) {
  const payloadId = (draft.payload as { id?: string } | undefined)?.id;
  let problems: string[] = [];
  let notes: string[] = [];

  if (typeof payloadId !== 'string' || payloadId.length === 0) {
    problems.push('[错误] payload.id 为空');
  } else {
    const base = await basePackFor([draft.id, draft.supersedes ?? '', payloadId]);
    const result = validateReviewDraft(draft, base);
    problems = result.errors;
    notes = result.warnings;
  }

  if (problems.length === 0 && notes.length === 0) {
    console.log(`  ✓ ${file}（${payloadId}）`);
    continue;
  }

  console.log(`  ${problems.length > 0 ? '×' : '!'} ${file}（${payloadId ?? '?'}）`);
  for (const line of problems) {
    console.log(`      ${line}`);
  }
  for (const line of notes) {
    console.log(`      ${line}`);
  }
  errors += problems.length;
  warnings += notes.length;
}

console.log('');
if (errors > 0) {
  console.log(
    `草稿校验失败：${errors} 个错误。\n` +
      '引用别的草稿时，必须**先通过被引用的那条**（基准包看不到队列里的草稿）。',
  );
  process.exitCode = 1;
} else if (pending.length === 0) {
  console.log('没有待审草稿。');
} else {
  console.log(
    `草稿校验通过${warnings > 0 ? `（${warnings} 条警告，不阻塞通过）` : ''}。`,
  );
}
