import { CONTENT_INDEX } from './contentIndex';
import { evaluateStorySteps } from './sim';
import type { GameState } from './types';

/**
 * 地图提示：告诉玩家"这里有还没遇见的事"，但不剧透。
 *
 * 只对 `revealMode: 'triggered'` 的链生成（每张卡的开头）。
 * 后面的章节一旦卡被发现就会进手册，不需要再提示。
 *
 * 一个地点只出一条聚合结果——28 个偶像时不会出现"一个地点挂四个亮点"。
 */
export type StoryHint = {
  chainId: string;
  idolId: string;
  locationId: string;
  /** 现在的时间在不在她的窗口里 */
  inWindow: boolean;
  text: string;
};

export type LocationHint = {
  locationId: string;
  /** 这个地点有几段还没遇见的剧情 */
  count: number;
  /** 其中现在时间对的几条 */
  inWindowCount: number;
  hints: StoryHint[];
};

export function storyHints(state: GameState): StoryHint[] {
  const hints: StoryHint[] = [];

  for (const evaluation of evaluateStorySteps(state)) {
    const { chain, step } = evaluation;
    if (!step || chain.revealMode !== 'triggered' || !chain.hint) continue;
    // 已经触发过（进过手册）就不再提示
    if (state.storyChains[chain.id]) continue;

    const kinds = new Set(evaluation.blocks.map((block) => block.kind));
    if (kinds.has('completed')) continue;
    // 她正在别的剧情里 —— 这时候指路没意义
    if (kinds.has('idol-busy')) continue;
    // 前置条件没满足（还没招募 / 上一章没做完）也不提示
    if (kinds.has('conditions')) continue;
    // 地点和时段不对是我们要提示的，不算失败

    hints.push({
      chainId: chain.id,
      idolId: chain.idolId,
      locationId: step.locationId,
      inWindow: !kinds.has('off-hours'),
      text: chain.hint,
    });
  }

  return hints;
}

/** 按地点聚合。空数组表示没有任何提示。 */
export function locationHints(state: GameState): LocationHint[] {
  const byLocation = new Map<string, StoryHint[]>();
  for (const hint of storyHints(state)) {
    byLocation.set(hint.locationId, [
      ...(byLocation.get(hint.locationId) ?? []),
      hint,
    ]);
  }
  return [...byLocation.entries()].map(([locationId, hints]) => ({
    locationId,
    count: hints.length,
    inWindowCount: hints.filter((hint) => hint.inWindow).length,
    hints,
  }));
}

/** UI 用：某个地点有没有提示。 */
export function hintForLocation(
  state: GameState,
  locationId: string,
): LocationHint | undefined {
  return locationHints(state).find((hint) => hint.locationId === locationId);
}

export function hintIdolName(hint: StoryHint): string {
  return CONTENT_INDEX.idols.get(hint.idolId)?.name ?? hint.idolId;
}
