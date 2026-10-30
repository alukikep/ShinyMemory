import { describe, expect, it } from 'vitest';
import { newGame, storyDayFor } from './sim';
import type { GameState, StoryChainDef } from './types';

/**
 * 剧情日：下一次该演这条链的那一天。
 *
 * 三条性质最重要：
 *   1. 按节奏出现，错过是顺延一个周期，不是"明天"
 *   2. 只随时间前进——提前订了未来的工作也挤不走它
 *   3. 没开始的链不占用任何东西
 */

function chain(overrides: Partial<StoryChainDef> = {}): StoryChainDef {
  return {
    id: 'test-chapter',
    idolId: 'meguru',
    steps: [
      { id: 's1', locationId: 'office', dialogueId: 'd1', actionLabel: 'a1' },
      { id: 's2', locationId: 'office', dialogueId: 'd2', actionLabel: 'a2' },
    ],
    ...overrides,
  };
}

function stateOnDay(day: number, lastStepDay?: number, delay = 1): GameState {
  const state = newGame(1);
  state.pendingDialogueId = undefined;
  state.clock.absoluteMinutes = (day - 1) * 1440 + 10 * 60;
  state.storyChains['test-chapter'] = {
    chainId: 'test-chapter',
    stepIndex: 1,
    lastStepDay,
    nextEligibleDay: lastStepDay === undefined ? undefined : lastStepDay + delay,
  };
  return state;
}

describe('storyDayFor', () => {
  it('returns undefined before the chain starts', () => {
    const state = newGame(1);
    expect(storyDayFor(state, chain({ cadenceDays: 2 }))).toBeUndefined();
  });

  it('returns undefined once the chain is complete', () => {
    const state = stateOnDay(5, 3);
    state.storyChains['test-chapter']!.completed = true;
    expect(storyDayFor(state, chain({ cadenceDays: 2 }))).toBeUndefined();
  });

  it('appears every day when cadence is 1', () => {
    const state = stateOnDay(4, 3, 1);
    expect(storyDayFor(state, chain({ cadenceDays: 1 }))).toBe(4);
  });

  it('waits a full cadence after a miss, not just one day', () => {
    // 第 3 天完成第一步，节奏 2 天 → 剧情日 5
    const state = stateOnDay(6, 3, 1);
    expect(storyDayFor(state, chain({ cadenceDays: 2 }))).toBe(7);
  });

  it('does not move because of future bookings', () => {
    const state = stateOnDay(5, 3, 1);
    state.jobs.push({
      id: 'job-1',
      jobId: 'job_magazine',
      idolId: 'meguru',
      day: 9,
      locationId: 'studio',
      fromMinute: 10 * 60,
      toMinute: 16 * 60,
      pay: 1200,
    } as GameState['jobs'][number]);
    expect(storyDayFor(state, chain({ cadenceDays: 2 }))).toBe(5);
  });

  it('respects a delay longer than the cadence', () => {
    // 延迟 5 天 > 节奏 2 天 → 第一次候选是 8
    const state = stateOnDay(6, 3, 5);
    expect(storyDayFor(state, chain({ cadenceDays: 2 }))).toBe(8);
  });
});
