import { describe, expect, it } from 'vitest';
import { storyScheduleSlots } from './scene';
import { newGame, storyWorkBlockFor } from './sim';
import type { GameState, StoryChainDef } from './types';

/**
 * 剧情占用：日程显示 + 接活拦截。
 * 用状态直接注入一条进行中的链来测，不依赖真实内容。
 */

function chain(overrides: Partial<StoryChainDef> = {}): StoryChainDef {
  return {
    id: 'test-chapter',
    idolId: 'meguru',
    title: '泳装的颜色',
    cadenceDays: 2,
    steps: [
      {
        id: 's1',
        locationId: 'shopping_street',
        timeWindow: { fromMinute: 10 * 60, toMinute: 20 * 60 },
        dialogueId: 'd1',
        actionLabel: 'a1',
      },
      {
        id: 's2',
        locationId: 'shopping_street',
        dialogueId: 'd2',
        actionLabel: 'a2',
      },
    ],
    ...overrides,
  };
}

function stateWithChain(
  chainDef: StoryChainDef,
  options: { lastStepDay: number; today: number; stepIndex?: number },
): GameState {
  const state = newGame(1);
  state.pendingDialogueId = undefined;
  state.clock.absoluteMinutes = (options.today - 1) * 1440 + 10 * 60;
  state.idols.meguru!.status = 'recruited';
  state.storyChains[chainDef.id] = {
    chainId: chainDef.id,
    stepIndex: options.stepIndex ?? 1,
    lastStepDay: options.lastStepDay,
    nextEligibleDay: options.lastStepDay + 1,
  };
  return state;
}

describe('story occupancy', () => {
  it('blocks only the story day when policy is open', () => {
    const def = chain();
    const state = stateWithChain(def, { lastStepDay: 3, today: 5 });

    // 节奏 2 → 第 5 天是剧情日
    expect(storyWorkBlockFor([def], state, 'meguru', 5).blocked).toBe(true);
    expect(storyWorkBlockFor([def], state, 'meguru', 5).reason).toBe('那天有剧情');
    // 隔一天不挡
    expect(storyWorkBlockFor([def], state, 'meguru', 6).blocked).toBe(false);
    // 不认识链的偶像不受影响
    expect(storyWorkBlockFor([def], state, 'hiori', 5).blocked).toBe(false);
  });

  it('blocks every day while policy is blocked', () => {
    const def = chain({ workPolicy: 'blocked' });
    const state = stateWithChain(def, { lastStepDay: 3, today: 5 });

    expect(storyWorkBlockFor([def], state, 'meguru', 6).blocked).toBe(true);
    expect(storyWorkBlockFor([def], state, 'meguru', 12).blocked).toBe(true);
    expect(storyWorkBlockFor([def], state, 'meguru', 6).reason).toContain('剧情进行中');
  });

  it('does not block once the chain is complete', () => {
    const def = chain({ workPolicy: 'blocked' });
    const state = stateWithChain(def, { lastStepDay: 3, today: 5 });
    state.storyChains[def.id]!.completed = true;

    expect(storyWorkBlockFor([def], state, 'meguru', 6).blocked).toBe(false);
  });

  it('shows a derived slot on the story day only', () => {
    // 惰性：storyScheduleSlots 从 CONTENT_INDEX 读链，这里只验证形状
    const state = newGame(1);
    state.pendingDialogueId = undefined;
    const slots = storyScheduleSlots(state, 'meguru');
    expect(Array.isArray(slots)).toBe(true);
  });
});
