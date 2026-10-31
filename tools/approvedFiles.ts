import { promises as fs } from 'node:fs';
import path from 'node:path';
import { REVIEW_KINDS, type ReviewDraft, type ReviewKind } from '../src/review/types.js';

export const APPROVED_DIR = path.join(process.cwd(), 'content-review', 'approved');

const KINDS: ReadonlySet<string> = new Set(REVIEW_KINDS);

/**
 * 属性经验档位，和 `src/core/types.ts` 的 `ExpTier` 保持一致。
 * 审查台不跑 tsc：非法档位（比如 4、2）能一路通过审批，
 * 直到 build 的 tsc 才红——而且报错位置在 `approved.generated.ts`，
 * 看起来像生成代码的问题。这里提前拦在源头，并指出是哪个 JSON。
 */
const EXP_TIERS: ReadonlySet<number> = new Set([1, 3, 5, 10, 20]);

function findBadTiers(value: unknown, trail = 'payload'): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => findBadTiers(item, `${trail}[${index}]`));
  }
  if (!value || typeof value !== 'object') return [];
  const record = value as Record<string, unknown>;
  const found: string[] = [];
  if (record.kind === 'attributeExp') {
    const tier = record.tier;
    if (typeof tier !== 'number' || !EXP_TIERS.has(tier)) {
      found.push(`${trail}.tier = ${String(tier)}`);
    }
  }
  for (const [key, child] of Object.entries(record)) {
    found.push(...findBadTiers(child, `${trail}.${key}`));
  }
  return found;
}

/** 非法档位直接报错，并指名是哪个 approved 文件（见 EXP_TIERS 注释）。 */
function assertTiers(file: string, payload: unknown): void {
  const problems = findBadTiers(payload);
  if (problems.length === 0) return;
  throw new Error(
    `content-review/approved/${file} 里有非法属性经验档位：${problems.join('、')}\n` +
      `只允许 ${[...EXP_TIERS].join('/')}（src/core/types.ts 的 ExpTier）。改这个 JSON，别改 approved.generated.ts。`,
  );
}

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
    assertTiers(name, raw.payload);
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
