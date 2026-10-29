import type {
  ActivityDef,
  DialogueDef,
  EventDef,
  ItemDef,
  JobDef,
  ShopDef,
  StoryChainDef,
} from '../types';

export type ApprovedContent = {
  activities: ActivityDef[];
  events: EventDef[];
  jobs: JobDef[];
  dialogues: DialogueDef[];
  storyChains: StoryChainDef[];
  items: ItemDef[];
  shops: ShopDef[];
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
 * 把一批 approved 文件按 kind 分组。
 *
 * 这个模块**不碰 import.meta.glob**：`tsx` 脚本（内容体检、构建门）也 import 它，
 * 那些环境里没有 Vite 的 glob。真正的文件读取放在 `approved.ts`。
 */
export function packApprovedFiles(files: Record<string, unknown>): ApprovedContent {
  const result: ApprovedContent = {
    activities: [],
    events: [],
    jobs: [],
    dialogues: [],
    storyChains: [],
    items: [],
    shops: [],
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
    } else if (draft?.kind === 'item') {
      result.items.push(payload as ItemDef);
    } else if (draft?.kind === 'shop') {
      result.shops.push(payload as ShopDef);
    }
  }

  return result;
}
