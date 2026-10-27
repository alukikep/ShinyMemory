import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { ReviewDraft, ReviewKind } from '../src/review/types.js';
import { validateReviewDraft } from '../src/review/validation.js';

const ROOT = process.cwd();
const APPROVED_DIR = path.join(ROOT, 'content-review', 'approved');

type ApprovedFile = {
  file: string;
  draft: ReviewDraft;
};

async function listTsFiles(directory: string): Promise<string[]> {
  let entries: Awaited<ReturnType<typeof fs.readdir>>;
  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch {
    return [];
  }
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listTsFiles(full)));
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      files.push(full);
    }
  }
  return files;
}

async function sourceIds(directory: string): Promise<Set<string>> {
  const ids = new Set<string>();
  for (const file of await listTsFiles(directory)) {
    const text = await fs.readFile(file, 'utf8');
    for (const match of text.matchAll(/^\s*["']?id["']?\s*:\s*['"]([^'"]+)['"]/gm)) {
      if (match[1]) ids.add(match[1]);
    }
  }
  return ids;
}

async function fileIds(file: string): Promise<Set<string>> {
  const ids = new Set<string>();
  const text = await fs.readFile(file, 'utf8');
  for (const match of text.matchAll(/^\s*["']?id["']?\s*:\s*['"]([^'"]+)['"]/gm)) {
    if (match[1]) ids.add(match[1]);
  }
  return ids;
}

function asDraft(raw: unknown, file: string): ReviewDraft {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error(`${file}: approved 文件必须是对象`);
  }
  const record = raw as Record<string, unknown>;
  return {
    id: typeof record.id === 'string' ? record.id : '',
    kind:
      record.kind === 'event' ||
      record.kind === 'job' ||
      record.kind === 'dialogue' ||
      record.kind === 'story'
        ? (record.kind as ReviewKind)
        : 'event',
    title: typeof record.title === 'string' ? record.title : '',
    status: 'approved',
    payload: record.payload,
    annotations: Array.isArray(record.annotations)
      ? (record.annotations as ReviewDraft['annotations'])
      : [],
    createdAt:
      typeof record.createdAt === 'string'
        ? record.createdAt
        : new Date(0).toISOString(),
    updatedAt:
      typeof record.updatedAt === 'string'
        ? record.updatedAt
        : new Date(0).toISOString(),
    history: Array.isArray(record.history)
      ? (record.history as ReviewDraft['history'])
      : [],
  };
}

async function main(): Promise<void> {
  const errors: string[] = [];
  const approved: ApprovedFile[] = [];

  let names: string[] = [];
  try {
    names = await fs.readdir(APPROVED_DIR);
  } catch {
    names = [];
  }

  for (const name of names.filter((file) => file.endsWith('.json'))) {
    const file = path.join(APPROVED_DIR, name);
    let raw: unknown;
    try {
      raw = JSON.parse(await fs.readFile(file, 'utf8')) as unknown;
    } catch (error) {
      errors.push(`${name}: JSON 解析失败：${String(error)}`);
      continue;
    }

    try {
      const draft = asDraft(raw, name);
      approved.push({ file: name, draft });
      const result = validateReviewDraft(draft);
      for (const issue of result.errors) {
        errors.push(`${name}: ${issue}`);
      }
    } catch (error) {
      errors.push(`${name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const baseEvents = await sourceIds(
    path.join(ROOT, 'src', 'core', 'content', 'events'),
  );
  const baseJobs = await sourceIds(
    path.join(ROOT, 'src', 'core', 'content', 'jobs'),
  );
  const baseDialogues = await sourceIds(
    path.join(ROOT, 'src', 'core', 'content', 'dialogues'),
  );
  const baseStories = await fileIds(
    path.join(ROOT, 'src', 'core', 'content', 'storyChains.ts'),
  );
  const approvedEvents = approved
    .filter((entry) => entry.draft.kind === 'event')
    .map((entry) => entry.draft);
  const approvedJobs = approved
    .filter((entry) => entry.draft.kind === 'job')
    .map((entry) => entry.draft);
  const approvedDialogues = approved
    .filter((entry) => entry.draft.kind === 'dialogue')
    .map((entry) => entry.draft);
  const approvedStories = approved
    .filter((entry) => entry.draft.kind === 'story')
    .map((entry) => entry.draft);

  const eventIds = new Set(baseEvents);
  const jobIds = new Set(baseJobs);
  for (const draft of approvedEvents) {
    const payload = draft.payload as Record<string, unknown>;
    const id = typeof payload.id === 'string' ? payload.id : '';
    if (!id) continue;
    if (eventIds.has(id)) {
      errors.push(`${draft.id}: 事件 ID 重复：${id}`);
    }
    eventIds.add(id);
  }
  for (const draft of approvedJobs) {
    const payload = draft.payload as Record<string, unknown>;
    const id = typeof payload.id === 'string' ? payload.id : '';
    if (!id) continue;
    if (jobIds.has(id)) {
      errors.push(`${draft.id}: 工作 ID 重复：${id}`);
    }
    jobIds.add(id);
  }

  for (const draft of approvedJobs) {
    const payload = draft.payload as Record<string, unknown>;
    if (typeof payload.eventId === 'string' && payload.eventId) {
      if (!eventIds.has(payload.eventId)) {
        errors.push(`${draft.id}: 工作事件不存在：${payload.eventId}`);
      }
    }
  }

  for (const draft of approvedEvents) {
    const payload = draft.payload as Record<string, unknown>;
    const refs: string[] = [];
    if (typeof payload.nextEventId === 'string') refs.push(payload.nextEventId);
    if (Array.isArray(payload.choices)) {
      for (const choice of payload.choices) {
        if (
          typeof choice === 'object' &&
          choice !== null &&
          typeof (choice as Record<string, unknown>).nextEventId === 'string'
        ) {
          refs.push(
            (choice as Record<string, unknown>).nextEventId as string,
          );
        }
      }
    }
    for (const ref of refs) {
      if (!eventIds.has(ref)) {
        errors.push(`${draft.id}: 后续事件不存在：${ref}`);
      }
    }
  }

  const dialogueIds = new Set(baseDialogues);
  for (const draft of approvedDialogues) {
    const payload = draft.payload as Record<string, unknown>;
    const id = typeof payload.id === 'string' ? payload.id : '';
    if (!id) continue;
    if (dialogueIds.has(id)) {
      errors.push(`${draft.id}: 对话 ID 重复：${id}`);
    }
    dialogueIds.add(id);
  }

  const storyIds = new Set(baseStories);
  for (const draft of approvedStories) {
    const payload = draft.payload as Record<string, unknown>;
    const id = typeof payload.id === 'string' ? payload.id : '';
    if (!id) continue;
    if (storyIds.has(id)) {
      errors.push(`${draft.id}: 剧情链 ID 重复：${id}`);
    }
    storyIds.add(id);
    if (Array.isArray(payload.steps)) {
      for (const step of payload.steps) {
        if (
          typeof step === 'object' &&
          step !== null &&
          typeof (step as Record<string, unknown>).dialogueId === 'string'
        ) {
          const dialogueId = (step as Record<string, unknown>)
            .dialogueId as string;
          if (!dialogueIds.has(dialogueId)) {
            errors.push(`${draft.id}: 剧情链对话不存在：${dialogueId}`);
          }
        }
      }
    }
  }

  if (errors.length > 0) {
    console.error('content validation failed:');
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log(
    `content validation passed: ${approvedEvents.length} events, ${approvedJobs.length} jobs, ${approvedDialogues.length} dialogues, ${approvedStories.length} stories`,
  );
}

void main();
