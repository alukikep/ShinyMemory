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
    version: raw.version ?? 1,
    rootId: raw.rootId ?? raw.id ?? fallbackId,
    supersedes: raw.supersedes,
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
    const directory = path.join(CONTENT_ROOT, entry.dir);
    let names: string[] = [];
    try {
      names = await fs.readdir(directory);
    } catch {
      continue;
    }

    for (const name of names.filter((file) => file.endsWith('.json'))) {
      const filePath = path.join(directory, name);
      const draft = await readDraftFile(filePath, entry.status);
      if (draft.id === id) {
        return { draft, filePath, status: entry.status };
      }
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
  if (kind === 'activity') {
    return {
      id: `activity.draft.${slug}`,
      name: title,
      description: '',
      kind: 'training',
      locations: ['practice_room'],
      durationMinutes: 60,
      timeWindows: [{ fromMinute: 8 * 60, toMinute: 20 * 60 }],
      cost: { stamina: 10 },
      effects: [],
      resultTexts: ['……'],
    };
  }
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
  if (kind === 'dialogue') {
    return {
      id: `dialogue.draft.${slug}`,
      idolId: 'mano',
      startNodeId: 'n01',
      nodes: {
        n01: {
          id: 'n01',
          text: '',
          nextNodeId: 'n02',
        },
        n02: {
          id: 'n02',
          text: '',
        },
      },
    };
  }
  if (kind === 'story') {
    return {
      id: `story.draft.${slug}`,
      idolId: 'mano',
      priority: 0,
      steps: [
        {
          id: `step-${slug}`,
          locationId: 'park',
          timeWindow: { fromMinute: 10 * 60, toMinute: 18 * 60 },
          dialogueId: `dialogue.draft.${slug}`,
          actionLabel: title,
          complete: { status: 'known' },
        },
      ],
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

function defaultTitle(kind: ReviewKind): string {
  if (kind === 'activity') return '未命名行动';
  if (kind === 'job') return '未命名工作';
  if (kind === 'dialogue') return '未命名对话';
  if (kind === 'story') return '未命名剧情链';
  return '未命名事件';
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
    title: title.trim() || defaultTitle(kind),
    status: 'review',
    version: 1,
    rootId: id,
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

export async function reviseReviewDraft(id: string): Promise<ReviewDraft> {
  const located = await locateDraft(id);
  if (!located) throw new Error('草稿不存在');
  if (located.status !== 'approved') {
    throw new Error('只有已通过内容可以修订为新版本');
  }

  const now = new Date().toISOString();
  const nextId = `draft.${located.draft.kind}.${Date.now()}`;
  const next: ReviewDraft = {
    ...located.draft,
    id: nextId,
    status: 'review',
    version: (located.draft.version ?? 1) + 1,
    rootId: located.draft.rootId ?? located.draft.id,
    supersedes: located.draft.id,
    annotations: [],
    createdAt: now,
    updatedAt: now,
    reviewedAt: undefined,
    history: [
      {
        status: 'review',
        at: now,
        note: `由 ${located.draft.id} 修订而来`,
      },
    ],
  };
  await writeJson(fileFor('review', nextId), next);
  return next;
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
