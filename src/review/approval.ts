import type { ContentPack } from '../core/contentIndexCore';
import type { ApprovedContent } from '../core/content/approved';

export type MergeResult = {
  pack: ContentPack;
  /** 与已有内容或彼此撞车的 id，格式是 `<类别> <id>`。 */
  duplicates: string[];
};

function mergeList<T extends { id: string }>(
  base: T[],
  extra: T[],
  label: string,
  duplicates: string[],
): T[] {
  const seen = new Set(base.map((item) => item.id));
  const merged = [...base];
  for (const item of extra) {
    if (!item || typeof item.id !== 'string' || !item.id) {
      duplicates.push(`${label} (缺少 id)`);
      continue;
    }
    if (seen.has(item.id)) {
      duplicates.push(`${label} ${item.id}`);
      continue;
    }
    seen.add(item.id);
    merged.push(item);
  }
  return merged;
}

/**
 * 把 approved 内容并进一个内容包。审查台校验单条草稿、构建门校验整批，
 * 都走这里，重叠 id 只在这里判一次。
 */
export function mergeApprovedContent(
  base: ContentPack,
  approved: ApprovedContent,
): MergeResult {
  const duplicates: string[] = [];

  return {
    pack: {
      ...base,
      activities: mergeList(base.activities, approved.activities, '行动', duplicates),
      events: mergeList(base.events, approved.events, '事件', duplicates),
      jobs: mergeList(base.jobs, approved.jobs, '工作', duplicates),
      dialogues: mergeList(base.dialogues, approved.dialogues, '对话', duplicates),
      storyChains: mergeList(
        base.storyChains,
        approved.storyChains,
        '剧情链',
        duplicates,
      ),
    },
    duplicates,
  };
}
