import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildHandbook } from './handbook';
import { getSchedulesForDay } from './schedule';
import { CONTENT_INDEX } from './contentIndex';
import {
  advanceDialogue,
  applyEventChoice,
  checkEventCandidates,
  getActor,
  isActorPresent,
  newGame,
  startStory,
} from './sim';
import type { DialogueDef, EventDef, GameState, StoryChainDef } from './types';

type State = GameState;

function dialogue(id: string): DialogueDef {
  return {
    id,
    startNodeId: 'n1',
    nodes: { n1: { id: 'n1', text: id } },
  };
}

const DIALOGUES = [
  dialogue('test.dlg.rift.office'),
  dialogue('test.dlg.rift.shop'),
  dialogue('test.dlg.rift.park'),
];

const quarrel: EventDef = {
  id: 'evt.test_mano_rift',
  title: '话说重了',
  when: [],
  after: { ids: ['vocal'] },
  chance: 1,
  once: true,
  text: '你说完之后，练习室里安静下来。',
  choices: [
    { label: '再解释一下', effects: [], result: '你解释了几句，她只是点了点头。' },
    {
      label: '沉默',
      effects: [
        { kind: 'flag', key: 'test_mano_rift', value: true },
        { kind: 'actorAffinity', actorId: 'mano', delta: -10 },
        {
          kind: 'scheduleOverride',
          actorId: 'mano',
          id: 'rift-quiet',
          days: 2,
        },
      ],
      result: '她收起谱子，说了声先走了。',
    },
  ],
};

const riftChain: StoryChainDef = {
  id: 'test.mano-rift',
  idolId: 'mano',
  priority: 20,
  title: '闹别扭的真乃',
  revealWhen: [{ kind: 'flag', key: 'test_mano_rift' }],
  steps: [
    {
      id: 'rift-1',
      locationId: 'office',
      timeWindow: { fromMinute: 600, toMinute: 1080 },
      dialogueId: 'test.dlg.rift.office',
      actionLabel: '和社长商量',
      when: [{ kind: 'flag', key: 'test_mano_rift' }],
      complete: {},
    },
    {
      id: 'rift-2',
      locationId: 'shopping_street',
      timeWindow: { fromMinute: 600, toMinute: 1080 },
      dialogueId: 'test.dlg.rift.shop',
      actionLabel: '挑一束花',
      when: [{ kind: 'hasItem', itemId: 'gift.flower' }],
      effects: [
        {
          kind: 'scheduleOverride',
          actorId: 'mano',
          id: 'rift-return',
          dayOffset: 2,
          locationId: 'park',
          fromMinute: 600,
          toMinute: 1080,
          label: '一个人在公园',
        },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'rift-3',
      locationId: 'park',
      timeWindow: { fromMinute: 600, toMinute: 1080 },
      dialogueId: 'test.dlg.rift.park',
      actionLabel: '在公园找她',
      when: [{ kind: 'castPresent', idolIds: ['mano'] }],
      complete: {},
    },
  ],
};

function register(): void {
  for (const entry of DIALOGUES) {
    CONTENT_INDEX.dialogues.set(entry.id, entry);
  }
  CONTENT_INDEX.events.set(quarrel.id, quarrel);
  CONTENT_INDEX.storyChains.set(riftChain.id, riftChain);
}

function unregister(): void {
  for (const entry of DIALOGUES) {
    CONTENT_INDEX.dialogues.delete(entry.id);
  }
  CONTENT_INDEX.events.delete(quarrel.id);
  CONTENT_INDEX.storyChains.delete(riftChain.id);
}

function at(state: State, day: number, minute: number, locationId: string): State {
  const next = structuredClone(state);
  next.clock.absoluteMinutes = (day - 1) * 1440 + minute;
  next.locationId = locationId;
  // 相当于玩家把事件结果页按掉，回到计划阶段
  next.phase = 'plan';
  next.pendingEventId = undefined;
  next.pendingEventIdolId = undefined;
  next.lastResult = undefined;
  return next;
}

function playDialogue(state: State): State {
  let current = state;
  for (let i = 0; i < 30 && current.pendingDialogueId; i += 1) {
    current = advanceDialogue(current);
  }
  return current;
}

function startQuarrel(state: State): State {
  const result = checkEventCandidates(state, [quarrel], {
    lastActivityId: 'vocal',
    lastActivityKind: 'training',
  });
  expect(result.event?.id).toBe('evt.test_mano_rift');
  return applyEventChoice(result.state, 1);
}

describe('complex quest: a fall-out with Mano', () => {
  beforeEach(register);
  afterEach(unregister);

  it('clears her schedule for the cooldown days', () => {
    const base = newGame(1);
    base.actors.mano!.affinity = 30;
    const state = startQuarrel(base);

    expect(state.flags.test_mano_rift).toBe(true);
    expect(state.actors.mano?.affinity).toBe(20);

    const mano = getActor('mano')!;
    const day2 = at(state, 2, 12 * 60, 'park');
    expect(isActorPresent(day2, mano)).toBe(false);
    expect(
      getSchedulesForDay(mano, 2, state.actors.mano?.scheduleOverrides),
    ).toHaveLength(1);
  });

  it('puts the thread in the handbook as soon as the flag is set', () => {
    const state = startQuarrel(newGame(1));
    const entry = buildHandbook(at(state, 1, 12 * 60, 'office')).active[0];

    expect(entry.title).toBe('闹别扭的真乃');
    expect(entry.status).toBe('available');
    expect(entry.steps[0]).toMatchObject({ label: '和社长商量', current: true });
  });

  it('gates the gift step and explains what is missing', () => {
    const state = startQuarrel(newGame(1));
    const office = at(state, 1, 12 * 60, 'office');

    const afterOffice = playDialogue(startStory(office, 'test.mano-rift'));
    expect(afterOffice.storyChains['test.mano-rift']?.stepIndex).toBe(1);

    const shop = at(afterOffice, 1, 13 * 60, 'shopping_street');
    const blocked = buildHandbook(shop).active[0];
    expect(blocked.status).toBe('blocked');
    expect(blocked.reason).toBe('还缺 花束 ×1');
  });

  it('waits two days, then finds her in the park', () => {
    let state = startQuarrel(newGame(1));
    state = playDialogue(startStory(at(state, 1, 12 * 60, 'office'), 'test.mano-rift'));

    state.inventory['gift.flower'] = 1;
    const shop = at(state, 1, 13 * 60, 'shopping_street');
    state = playDialogue(startStory(shop, 'test.mano-rift'));
    expect(state.storyChains['test.mano-rift']?.stepIndex).toBe(2);
    expect(state.storyChains['test.mano-rift']?.nextEligibleDay).toBe(3);

    const waiting = buildHandbook(at(state, 2, 12 * 60, 'park')).active[0];
    expect(waiting.status).toBe('waiting');
    expect(waiting.daysLeft).toBe(1);

    const mano = getActor('mano')!;
    const day3 = at(state, 3, 12 * 60, 'park');
    expect(isActorPresent(day3, mano)).toBe(true);
    expect(buildHandbook(day3).active[0]?.status).toBe('available');

    state = playDialogue(startStory(day3, 'test.mano-rift'));
    expect(state.storyChains['test.mano-rift']?.completed).toBe(true);
    expect(buildHandbook(state).active).toHaveLength(0);
    expect(buildHandbook(state).archive).toHaveLength(1);
  });
});
