import { promises as fs } from 'node:fs';
import path from 'node:path';
import type {
  ReviewDraft,
  ReviewHistoryEntry,
  ReviewKind,
  ReviewStatus,
} from '../src/review/types.js';

const CONTENT_ROOT = path.resolve(process.cwd(), 'content-review');
const SAFE_ID = /^[a-zA-Z0-9._-]+$/;

const STATUS_DIRS: Array<{ status: ReviewStatus; dir: string }> = [
  { status: 'review', dir: 'drafts' },
  { status: 'revision', dir: 'revisions' },
  { status: 'approved', dir: 'approved' },
  { status: 'discarded', dir: 'discarded' },
];

type StoredDraft = Partial<ReviewDraft> & {
  id?: string;
  kind?: ReviewKind;
  title?: string;
  payload?: unknown;
};

type LocatedDraft = {
  draft: ReviewDraft;
  filePath: string;
  status: ReviewStatus;
};

function statusDir(status: ReviewStatus): string {
  const entry = STATUS_DIRS.find((item) => item.status === status);
  if (!entry) throw new Error(`未知审查状态：${status}`);
  return entry.dir;
}

function assertSafeId(id: string): void {
  if (!SAFE_ID.test(id)) throw new Error(`非法草稿 ID：${id}`);
}

function fileFor(status: ReviewStatus, id: string): string {
  assertSafeId(id);
  return path.join(CONTENT_ROOT, statusDir(status), `${id}.json`);
}

async function writeJson(filePath: string, value: unknown): Promise<void> {
  const temporary = `${filePath}.tmp-${process.pid}-${Date.now()}`;
  await fs.writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  await fs.rm(filePath, { force: true });
  await fs.rename(temporary, filePath);
}

function normalizeDraft(
  raw: StoredDraft,
  status: ReviewStatus,
  fallbackId: string,
  fallbackDate: string,
): ReviewDraft {
  const payload = raw.payload ?? {};
  const payloadRecord =
    typeof payload === 'object' && payload !== null
      ? (payload as Record<string, unknown>)
      : {};
  const title =
    raw.title ??
    (typeof payloadRecord.title === 'string' ? payloadRecord.title : undefined) ??
    (typeof payloadRecord.name === 'string' ? payloadRecord.name : undefined) ??
    fallbackId;

  return {
    id: raw.id ?? fallbackId,
    kind: raw.kind ?? 'event',
    title,
    status,
    payload,
    annotations: raw.annotations ?? [],
    createdAt: raw.createdAt ?? fallbackDate,
    updatedAt: raw.updatedAt ?? fallbackDate,
    reviewedAt: raw.reviewedAt,
    history: raw.history ?? [],
  };
}

async function readDraftFile(
  filePath: string,
  status: ReviewStatus,
): Promise<ReviewDraft> {
  const [text, stat] = await Promise.all([
    fs.readFile(filePath, 'utf8'),
    fs.stat(filePath),
  ]);
  const raw = JSON.parse(text) as StoredDraft;
  return normalizeDraft(
    raw,
    status,
    path.basename(filePath, '.json'),
    stat.birthtime.toISOString(),
  );
}

async function locateDraft(id: string): Promise<LocatedDraft | undefined> {
  assertSafeId(id);
  for (const entry of STATUS_DIRS) {
    const filePath = fileFor(entry.status, id);
    try {
      const draft = await readDraftFile(filePath, entry.status);
      return { draft, filePath, status: entry.status };
    } catch (error) {
      if (
        error instanceof Error &&
        'code' in error &&
        (error as NodeJS.ErrnoException).code === 'ENOENT'
      ) {
        continue;
      }
      throw error;
    }
  }
  return undefined;
}

export async function listReviewDrafts(): Promise<ReviewDraft[]> {
  const drafts: ReviewDraft[] = [];

  for (const entry of STATUS_DIRS) {
    const directory = path.join(CONTENT_ROOT, entry.dir);
    let names: string[] = [];
    try {
      names = await fs.readdir(directory);
    } catch {
      continue;
    }

    for (const name of names.filter((file) => file.endsWith('.json'))) {
      drafts.push(await readDraftFile(path.join(directory, name), entry.status));
    }
  }

  return drafts.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getReviewDraft(id: string): Promise<ReviewDraft | undefined> {
  return (await locateDraft(id))?.draft;
}

function defaultPayload(kind: ReviewKind, title: string): Record<string, unknown> {
  const slug = `${Date.now()}`;
  if (kind === 'job') {
    return {
      id: `job.draft.${slug}`,
      name: title,
      description: '',
      locationId: 'studio',
      fromMinute: 10 * 60,
      toMinute: 16 * 60,
      pay: 1000,
      effects: [],
    };
  }
  return {
    id: `evt.draft.${slug}`,
    title,
    text: '',
    when: [],
    chance: 1,
    priority: 0,
    choices: [
      {
        label: '选项一',
        effects: [],
        result: '',
      },
    ],
  };
}

export async function createReviewDraft(
  kind: ReviewKind,
  title: string,
): Promise<ReviewDraft> {
  const now = new Date().toISOString();
  const id = `draft.${kind}.${Date.now()}`;
  const draft: ReviewDraft = {
    id,
    kind,
    title: title.trim() || (kind === 'event' ? '未命名事件' : '未命名工作'),
    status: 'review',
    payload: defaultPayload(kind, title.trim()),
    annotations: [],
    createdAt: now,
    updatedAt: now,
    history: [{ status: 'review', at: now }],
  };
  await fs.mkdir(path.dirname(fileFor('review', id)), { recursive: true });
  await writeJson(fileFor('review', id), draft);
  return draft;
}

export async function saveReviewDraft(
  id: string,
  patch: { title?: string; payload?: unknown; annotations?: ReviewDraft['annotations'] },
): Promise<ReviewDraft> {
  const located = await locateDraft(id);
  if (!located) throw new Error('草稿不存在');
  const now = new Date().toISOString();
  const next: ReviewDraft = {
    ...located.draft,
    title: patch.title?.trim() || located.draft.title,
    payload: patch.payload ?? located.draft.payload,
    annotations: patch.annotations ?? located.draft.annotations,
    status: located.status,
    updatedAt: now,
  };
  await writeJson(located.filePath, next);
  return next;
}

export async function moveReviewDraft(
  id: string,
  status: ReviewStatus,
  note?: string,
): Promise<ReviewDraft> {
  const located = await locateDraft(id);
  if (!located) throw new Error('草稿不存在');
  if (located.status === status) return located.draft;

  const now = new Date().toISOString();
  const history: ReviewHistoryEntry[] = [
    ...(located.draft.history ?? []),
    { status, at: now, note },
  ];
  const next: ReviewDraft = {
    ...located.draft,
    status,
    updatedAt: now,
    reviewedAt:
      status === 'approved' || status === 'discarded'
        ? now
        : located.draft.reviewedAt,
    history,
  };

  const target = fileFor(status, id);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await writeJson(target, next);
  await fs.rm(located.filePath, { force: true });
  return next;
}

export function reviewContentRoot(): string {
  return CONTENT_ROOT;
}
