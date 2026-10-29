import { promises as fs } from 'node:fs';
import path from 'node:path';
import { REVIEW_KINDS, type ReviewDraft, type ReviewKind } from '../src/review/types.js';

export const APPROVED_DIR = path.join(process.cwd(), 'content-review', 'approved');

const KINDS: ReadonlySet<string> = new Set(REVIEW_KINDS);

/**
 * 读出 approved 目录。`tsx` 下没有 `import.meta.glob`，所以脚本侧
 * 自己走文件系统；浏览器/构建侧由 `src/core/content/approved.ts` 的 glob 负责。
 */
export async function readApprovedDrafts(): Promise<
  Array<{ file: string; draft: ReviewDraft }>
> {
  let names: string[] = [];
  try {
    names = await fs.readdir(APPROVED_DIR);
  } catch {
    return [];
  }

  const drafts: Array<{ file: string; draft: ReviewDraft }> = [];
  for (const name of names.filter((file) => file.endsWith('.json')).sort()) {
    const file = path.join(APPROVED_DIR, name);
    const raw = JSON.parse(await fs.readFile(file, 'utf8')) as Record<string, unknown>;
    const kind = typeof raw.kind === 'string' && KINDS.has(raw.kind)
      ? (raw.kind as ReviewKind)
      : 'event';
    drafts.push({
      file: name,
      draft: {
        id: typeof raw.id === 'string' ? raw.id : path.basename(name, '.json'),
        kind,
        title: typeof raw.title === 'string' ? raw.title : name,
        status: 'approved',
        version: typeof raw.version === 'number' ? raw.version : 1,
        rootId: typeof raw.rootId === 'string' ? raw.rootId : undefined,
        supersedes:
          typeof raw.supersedes === 'string' ? raw.supersedes : undefined,
        payload: raw.payload,
        annotations: Array.isArray(raw.annotations)
          ? (raw.annotations as ReviewDraft['annotations'])
          : [],
        createdAt:
          typeof raw.createdAt === 'string'
            ? raw.createdAt
            : new Date(0).toISOString(),
        updatedAt:
          typeof raw.updatedAt === 'string'
            ? raw.updatedAt
            : new Date(0).toISOString(),
        reviewedAt:
          typeof raw.reviewedAt === 'string' ? raw.reviewedAt : undefined,
        history: Array.isArray(raw.history)
          ? (raw.history as ReviewDraft['history'])
          : [],
      },
    });
  }
  return drafts;
}
