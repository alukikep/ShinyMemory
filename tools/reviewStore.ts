import { promises as fs } from 'node:fs';
import path from 'node:path';
import type {
  ReviewDraft,
  ReviewStatus,
} from '../src/review/types.js';

const CONTENT_ROOT = path.resolve(process.cwd(), 'content-review');

const STATUS_DIRS: Array<{ status: ReviewStatus; dir: string }> = [
  { status: 'review', dir: 'drafts' },
  { status: 'revision', dir: 'revisions' },
  { status: 'approved', dir: 'approved' },
  { status: 'discarded', dir: 'discarded' },
];

type StoredDraft = Partial<ReviewDraft> & {
  id?: string;
  kind?: ReviewDraft['kind'];
  title?: string;
  payload?: unknown;
};

async function readDraftFile(
  filePath: string,
  status: ReviewStatus,
): Promise<ReviewDraft> {
  const [text, stat] = await Promise.all([
    fs.readFile(filePath, 'utf8'),
    fs.stat(filePath),
  ]);
  const raw = JSON.parse(text) as StoredDraft;
  const fallbackId = path.basename(filePath, '.json');
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
    createdAt: raw.createdAt ?? stat.birthtime.toISOString(),
    updatedAt: raw.updatedAt ?? stat.mtime.toISOString(),
    reviewedAt: raw.reviewedAt,
    history: raw.history ?? [],
  };
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
  const drafts = await listReviewDrafts();
  return drafts.find((draft) => draft.id === id);
}

export function reviewContentRoot(): string {
  return CONTENT_ROOT;
}
