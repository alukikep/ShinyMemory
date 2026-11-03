import { afterEach, describe, expect, it } from 'vitest';
import { CONTENT_INDEX } from './contentIndex';
import { FIXTURE_DIALOGUE } from './content-fixture/fixtures/secondEncounter';
import { TRUST_TOKEN } from './content/trustToken';
import {
  advanceDialogue,
  chooseDialogue,
  maxStamina,
  newGame,
  startStory,
  useItem,
} from './sim';
import type { GameState, StoryChainDef } from './types';

const CHAIN: StoryChainDef = {
  id: 'test.trust-reward',
  idolId: 'mano',
  priority: 999,
  lockScope: 'none',
  revealWhen: [],
  steps: [
    {
      id: 'test.trust-reward-1',
      locationId: 'office',
      timeWindow: { fromMinute: 0, toMinute: 24 * 60 },
      dialogueId: FIXTURE_DIALOGUE.id,
      actionLabel: '测试信赖奖励',
      effects: [{ kind: 'grantItem', itemId: TRUST_TOKEN.id, count: 1 }],
    },
  ],
};

function setup(): GameState {
  const state = newGame(1);
  state.pendingDialogueId = undefined;
  state.dialogueNodeId = undefined;
  state.phase = 'plan';
  state.locationId = 'office';
  state.clock.absoluteMinutes = 12 * 60;
  state.idols.mano!.status = 'recruited';
  return state;
}

function play(state: GameState): GameState {
  let next = state;
  for (let index = 0; index < 30 && next.pendingDialogueId; index += 1) {
    const dialogue = CONTENT_INDEX.dialogues.get(next.pendingDialogueId)!;
    const node = dialogue.nodes[next.dialogueNodeId!];
    next = node.choices?.length
      ? chooseDialogue(next, 0)
      : advanceDialogue(next);
  }
  return next;
}

afterEach(() => {
  CONTENT_INDEX.dialogues.delete(FIXTURE_DIALOGUE.id);
  CONTENT_INDEX.storyChains.delete(CHAIN.id);
});

describe('trust reward item', () => {
  it('grants the unified item when the story completes', () => {
    CONTENT_INDEX.dialogues.set(FIXTURE_DIALOGUE.id, FIXTURE_DIALOGUE);
    CONTENT_INDEX.storyChains.set(CHAIN.id, CHAIN);
    const started = startStory(setup(), CHAIN.id);
    expect(started.pendingDialogueId).toBe(FIXTURE_DIALOGUE.id);

    const finished = play(started);
    expect(finished.storyChains[CHAIN.id]?.completed).toBe(true);
    expect(finished.inventory[TRUST_TOKEN.id]).toBe(1);
  });

  it('uses one or all tokens and raises the permanent cap', () => {
    const state = setup();
    state.inventory[TRUST_TOKEN.id] = 3;

    const one = useItem(state, TRUST_TOKEN.id);
    expect(one.inventory[TRUST_TOKEN.id]).toBe(2);
    expect(one.vars?.['stamina.trustBonus']).toBe(2);
    expect(maxStamina(one)).toBe(102);

    const all = useItem(one, TRUST_TOKEN.id, 2);
    expect(all.inventory[TRUST_TOKEN.id]).toBeUndefined();
    expect(all.vars?.['stamina.trustBonus']).toBe(6);
    expect(maxStamina(all)).toBe(106);
  });
});
