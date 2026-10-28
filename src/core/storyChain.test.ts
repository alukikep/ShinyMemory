import { describe, expect, it } from 'vitest';
import { buildScene } from './scene';
import { CONTENT_INDEX } from './contentIndex';
import { FIXTURE_CHAIN, FIXTURE_DIALOGUE } from './content/fixtures/secondEncounter';
import {
  advanceDialogue,
  chooseDialogue,
  getDialogueText,
  getEligibleStories,
  getEligibleStory,
  newGame,
  startStory,
} from './sim';
import type { StoryChainDef } from './types';

function atPark(day = 1, minute = 12 * 60) {
  const state = newGame(1);
  state.clock.absoluteMinutes = (day - 1) * 1440 + minute;
  state.locationId = 'park';
  return state;
}

function registerFixture() {
  CONTENT_INDEX.dialogues.set(FIXTURE_DIALOGUE.id, FIXTURE_DIALOGUE);
  CONTENT_INDEX.storyChains.set(FIXTURE_CHAIN.id, FIXTURE_CHAIN);
}

function unregisterFixture() {
  CONTENT_INDEX.dialogues.delete(FIXTURE_DIALOGUE.id);
  CONTENT_INDEX.storyChains.delete(FIXTURE_CHAIN.id);
}

function play(state: ReturnType<typeof newGame>) {
  for (let i = 0; i < 50 && state.pendingDialogueId; i += 1) {
    const dialogue = CONTENT_INDEX.dialogues.get(state.pendingDialogueId)!;
    const node = dialogue.nodes[state.dialogueNodeId!];
    state = node.choices?.length
      ? chooseDialogue(state, 0)
      : advanceDialogue(state);
  }
  return state;
}

describe('Hiori story chain', () => {
  it('offers the first step at the park', () => {
    expect(getEligibleStory(atPark())?.step.id).toBe('hiori-park-1');
  });

  it('does not offer it outside the time window', () => {
    expect(getEligibleStory(atPark(1, 9 * 60))).toBeUndefined();
  });

  it('adds a startStory action in the plan scene', () => {
    const scene = buildScene(atPark());
    expect(
      scene.actions.some(
        (action) =>
          action.command.type === 'startStory' &&
          action.command.chainId === 'hiori-encounter',
      ),
    ).toBe(true);
  });

  it('starts the first dialogue at n01', () => {
    const next = startStory(atPark(), 'hiori-encounter');
    expect(next.pendingDialogueId).toBe('dialogue.hiori.first');
    expect(next.dialogueNodeId).toBe('n01');
    expect(next.dialogueTargetIdolId).toBe('hiori');
  });

  it('uses the first-meeting flag for the second opening', () => {
    const state = atPark(3);
    state.dialogueTargetIdolId = 'hiori';
    state.flags.hiori_helped_paper = true;
    const dialogue = CONTENT_INDEX.dialogues.get('dialogue.hiori.second')!;
    expect(getDialogueText(state, dialogue.nodes.n02!)).toContain('上次的纸');
  });

  it('marks Hiori known and schedules the second step two days later', () => {
    const state = play(startStory(atPark(1), 'hiori-encounter'));
    expect(state.idols.hiori?.status).toBe('known');
    expect(state.storyChains['hiori-encounter']?.nextEligibleDay).toBe(3);

    const day2 = structuredClone(state);
    day2.clock.absoluteMinutes = 1440 + 12 * 60;
    day2.locationId = 'park';
    expect(getEligibleStory(day2)).toBeUndefined();

    const day3 = structuredClone(state);
    day3.clock.absoluteMinutes = 2 * 1440 + 12 * 60;
    day3.locationId = 'park';
    expect(getEligibleStory(day3)?.step.id).toBe('hiori-park-2');
  });

  it('completes the second step and recruits Hiori', () => {
    const first = play(startStory(atPark(1), 'hiori-encounter'));
    const secondStart = structuredClone(first);
    secondStart.clock.absoluteMinutes = 2 * 1440 + 12 * 60;
    secondStart.locationId = 'park';

    const state = play(startStory(secondStart, 'hiori-encounter'));
    expect(state.idols.hiori?.status).toBe('recruited');
    expect(state.storyChains['hiori-encounter']?.completed).toBe(true);
    expect(state.selectedIdolId).toBe('mano');
  });

  it('unlocks Meguru through the second story chain', () => {
    const first = newGame(1);
    first.clock.absoluteMinutes = 12 * 60;
    first.locationId = 'shopping_street';
    expect(getEligibleStory(first)?.step.id).toBe('meguru-street-1');

    const known = play(startStory(first, 'meguru-encounter'));
    expect(known.idols.meguru?.status).toBe('known');
    expect(known.storyChains['meguru-encounter']?.nextEligibleDay).toBe(3);

    const second = structuredClone(known);
    second.clock.absoluteMinutes = 2 * 1440 + 12 * 60;
    second.locationId = 'park';
    expect(getEligibleStory(second)?.step.id).toBe('meguru-park-2');

    const recruited = play(startStory(second, 'meguru-encounter'));
    expect(recruited.idols.meguru?.status).toBe('recruited');
    expect(recruited.storyChains['meguru-encounter']?.completed).toBe(true);
    expect(recruited.selectedIdolId).toBe('mano');
  });

  it('uses story priority and supports a second idol fixture', () => {
    registerFixture();
    try {
      const state = atPark();
      state.idols['fixture-idol'] = {
        ...structuredClone(state.idols.hiori!),
        id: 'fixture-idol',
        status: 'unknown',
      };
      expect(getEligibleStory(state)?.chain.id).toBe(FIXTURE_CHAIN.id);
      // 同一地点两条链都在，按 priority 降序：后加的那条不会静默消失
      expect(getEligibleStories(state).map((entry) => entry.chain.id)).toEqual([
        FIXTURE_CHAIN.id,
        'hiori-encounter',
      ]);

      const next = play(startStory(state, FIXTURE_CHAIN.id));
      expect(next.idols['fixture-idol']?.status).toBe('known');
      expect(next.selectedIdolId).toBe('mano');

      const scene = buildScene(state);
      const ids = scene.actions.map((action) => action.id);
      expect(ids).toContain(`story:${FIXTURE_CHAIN.id}`);
      expect(ids).toContain('story:hiori-encounter');
    } finally {
      unregisterFixture();
    }
  });
});

describe('story chain step gates and rewards', () => {
  function withChain<T>(chain: StoryChainDef, run: () => T): T {
    CONTENT_INDEX.dialogues.set(FIXTURE_DIALOGUE.id, FIXTURE_DIALOGUE);
    CONTENT_INDEX.storyChains.set(chain.id, chain);
    try {
      return run();
    } finally {
      CONTENT_INDEX.storyChains.delete(chain.id);
      CONTENT_INDEX.dialogues.delete(FIXTURE_DIALOGUE.id);
    }
  }

  const gated: StoryChainDef = {
    id: 'fixture-when',
    idolId: 'fixture-idol',
    priority: 20,
    steps: [
      {
        id: 'fixture-when-1',
        locationId: 'park',
        timeWindow: { fromMinute: 600, toMinute: 1080 },
        dialogueId: FIXTURE_DIALOGUE.id,
        actionLabel: 'fixture gated',
        when: [{ kind: 'moneyAtLeast', value: 5000 }],
        complete: { status: 'known' },
      },
    ],
  };

  const rewarded: StoryChainDef = {
    id: 'fixture-reward',
    idolId: 'fixture-idol',
    priority: 20,
    steps: [
      {
        id: 'fixture-reward-1',
        locationId: 'park',
        timeWindow: { fromMinute: 600, toMinute: 1080 },
        dialogueId: FIXTURE_DIALOGUE.id,
        actionLabel: 'fixture reward',
        effects: [{ kind: 'money', delta: 1000 }],
        complete: { status: 'known' },
      },
    ],
  };

  it('hides a step whose when conditions fail', () => {
    withChain(gated, () => {
      const poor = atPark();
      poor.money = 1000;
      expect(
        getEligibleStories(poor).some((entry) => entry.chain.id === gated.id),
      ).toBe(false);

      const rich = atPark();
      rich.money = 6000;
      expect(
        getEligibleStories(rich).some((entry) => entry.chain.id === gated.id),
      ).toBe(true);
    });
  });

  it('applies step effects exactly once on completion', () => {
    withChain(rewarded, () => {
      const state = atPark();
      const before = state.money;
      const after = play(startStory(state, rewarded.id));

      expect(after.storyChains[rewarded.id]?.completed).toBe(true);
      expect(after.money).toBe(before + 1000);
    });
  });
});
