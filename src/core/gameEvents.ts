import type { AttributeRef, GameState, Rank } from './types';

/**
 * 已经发生的游戏事实。成就系统将来订阅这些事件即可，
 * 不需要回头改 sim。事件只发不存，不进存档。
 */
export type GameEvent =
  | { kind: 'activityDone'; activityId: string; passed?: boolean }
  | { kind: 'skillLevelUp'; ref: AttributeRef; rank: Rank; idolId?: string }
  | { kind: 'storyCompleted'; chainId: string }
  | { kind: 'dayStarted'; day: number }
  | { kind: 'equipChanged'; slot: string; equipId?: string };

export type GameEventSink = (event: GameEvent, state: GameState) => void;

let sink: GameEventSink | undefined;

/** 传 undefined 注销。默认为未注册，零开销。 */
export function setGameEventSink(next?: GameEventSink): void {
  sink = next;
}

export function emitGameEvent(event: GameEvent, state: GameState): void {
  if (!sink) return;
  try {
    sink(event, state);
  } catch (error) {
    // 监听方出错不能中断游戏
    console.warn('game event sink failed', error);
  }
}
