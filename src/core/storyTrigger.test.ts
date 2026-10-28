import { afterEach, describe, expect, it } from 'vitest';
import { CONTENT_INDEX } from './contentIndex';
import {
  advanceDialogue,
  chooseDialogue,
  getStoryTriggerReport,
  newGame,
  startStory,
} from './sim';
import type { GameState, StoryChainDef } from './types';

type State = GameState;

function atPark(day = 1, minute = 12 * 60): State {
  const state = newGame(1);
  state.clock.absoluteMinutes = (day - 1) * 1440 + minute;
  state.locationId = 'park';
  return state;
}

function play(state: State): State {
  let current = state;
  for (let i = 0; i < 50 && current.pendingDialogueId; i += 1) {
    const dialogue = CONTENT_INDEX.dialogues.get(current.pendingDialogueId)!;
    const node = dialogue.nodes[current.dialogueNodeId!];
    current = node.choices?.length
      ? chooseDialogue(current, 0)
      : advanceDialogue(current);
  }
  return current;
}

function report(state: State, chainId = 'hiori-encounter') {
  return getStoryTriggerReport(state).find((entry) => entry.chainId === chainId);
}

const temporary: StoryChainDef[] = [];

function withChain<T>(chain: StoryChainDef, run: () => T): T {
  temporary.push(chain);
  CONTENT_INDEX.storyChains.set(chain.id, chain);
  return run();
}

afterEach(() => {
  for (const chain of temporary.splice(0)) {
    CONTENT_INDEX.storyChains.delete(chain.id);
  }
});

describe('getStoryTriggerReport', () => {
  it('names the wrong location', () => {
    const state = newGame(1);
    expect(report(state)).toMatchObject({
      eligible: false,
      revealed: false,
      title: '风野灯织 · 在长椅旁停下',
      reason: '地点不对：要在公园（现在在事务所）',
    });
  });

  it('reports an untold-but-triggerable thread', () => {
    expect(report(atPark())).toMatchObject({
      eligible: true,
      revealed: false,
      reason: '可以触发（手册里还没显示）',
    });
  });

  it('counts the days left after the first meeting', () => {
    const state = play(startStory(atPark(1), 'hiori-encounter'));
    expect(report(state)).toMatchObject({
      eligible: false,
      revealed: true,
      reason: '还有 2 天（最早第 3 天）',
    });
  });

  it('reports the time window when the day and place are right', () => {
    const met = play(startStory(atPark(1), 'hiori-encounter'));
    const late = structuredClone(met);
    late.clock.absoluteMinutes = 2 * 1440 + 22 * 60;
    late.locationId = 'park';

    expect(report(late)).toMatchObject({
      eligible: false,
      reason: '不在时间窗（10:00–18:00）',
    });
  });

  it('is eligible once the day, place and window all line up', () => {
    const met = play(startStory(atPark(1), 'hiori-encounter'));
    const day3 = structuredClone(met);
    day3.clock.absoluteMinutes = 2 * 1440 + 12 * 60;
    day3.locationId = 'park';

    expect(report(day3)).toMatchObject({ eligible: true, revealed: true });
    expect(report(day3)?.reason).toBe('可以触发');
  });

  it('quotes the failing condition in plain language', () => {
    const gated: StoryChainDef = {
      id: 'test-gated',
      idolId: 'hiori',
      revealWhen: [],
      steps: [
        {
          id: 'test-gated-1',
          locationId: 'park',
          dialogueId: 'dialogue.hiori.first',
          actionLabel: '交报名费',
          when: [{ kind: 'moneyAtLeast', value: 5000 }],
        },
      ],
    };

    withChain(gated, () => {
      const state = atPark();
      state.money = 3800;
      expect(report(state, 'test-gated')).toMatchObject({
        eligible: false,
        reason: '条件未满足：还差 ¥1,200',
      });
    });
  });

  it('marks a finished chain as completed', () => {
    const met = play(startStory(atPark(1), 'hiori-encounter'));
    const day3 = structuredClone(met);
    day3.clock.absoluteMinutes = 2 * 1440 + 12 * 60;
    day3.locationId = 'park';
    const done = play(startStory(day3, 'hiori-encounter'));

    expect(report(done)).toMatchObject({
      eligible: false,
      reason: '已完成',
      stepIndex: 2,
      totalSteps: 2,
    });
  });
});
