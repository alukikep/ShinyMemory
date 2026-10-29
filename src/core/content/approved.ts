import type {
  ActivityDef,
  DialogueDef,
  EventDef,
  JobDef,
  StoryChainDef,
} from '../types';

export type ApprovedContent = {
  activities: ActivityDef[];
  events: EventDef[];
  jobs: JobDef[];
  dialogues: DialogueDef[];
  storyChains: StoryChainDef[];
};

type ApprovedDraftFile = {
  kind?: unknown;
  payload?: unknown;
};

/** 审查台写出的 approved 文件长这样：`{ id, kind, payload, ... }`。 */
function unwrap(raw: unknown): ApprovedDraftFile | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const record = raw as Record<string, unknown>;
  // Vite 的 JSON 模块是 `{ default: json }`；直接读文件时是 json 本身。
  if ('default' in record && record.default && typeof record.default === 'object') {
    return record.default as ApprovedDraftFile;
  }
  return record as ApprovedDraftFile;
}

function payloadId(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  const id = (payload as Record<string, unknown>).id;
  return typeof id === 'string' && id.length > 0 ? id : undefined;
}

/**
 * 把 approved 目录里的文件按 kind 分组。
 * 读不了或没有 id 的直接跳过——构建门（content:validate）负责把它们拦下来，
 * 运行时不因为一条坏内容整页白屏。
 */
export function packApprovedFiles(files: Record<string, unknown>): ApprovedContent {
  const result: ApprovedContent = {
    activities: [],
    events: [],
    jobs: [],
    dialogues: [],
    storyChains: [],
  };

  for (const key of Object.keys(files).sort()) {
    const draft = unwrap(files[key]);
    const payload = draft?.payload;
    if (!payload || !payloadId(payload)) continue;
    if (draft?.kind === 'activity') {
      result.activities.push(payload as ActivityDef);
    } else if (draft?.kind === 'event') {
      result.events.push(payload as EventDef);
    } else if (draft?.kind === 'job') {
      result.jobs.push(payload as JobDef);
    } else if (draft?.kind === 'dialogue') {
      result.dialogues.push(payload as DialogueDef);
    } else if (draft?.kind === 'story') {
      result.storyChains.push(payload as StoryChainDef);
    }
  }

  return result;
}

/**
 * Vite 在构建/开发时把 glob 展开成静态导入；`tsx`（内容体检等脚本）里没有
 * `import.meta.glob`，这时退化成空表——那些脚本自己从文件系统读 approved。
 */
const APPROVED_FILES: Record<string, unknown> =
  typeof import.meta.glob === 'function'
    ? (import.meta.glob('../../../content-review/approved/*.json', {
        eager: true,
      }) as Record<string, unknown>)
    : {};

export const APPROVED_CONTENT: ApprovedContent = packApprovedFiles(APPROVED_FILES);
