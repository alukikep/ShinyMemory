import { describe, expect, it } from 'vitest';
import { CONTENT_INDEX } from './contentIndex';
import { buildHandbook, describeCondition } from './handbook';
import { advanceDialogue, chooseDialogue, newGame, startStory } from './sim';
import type { StoryChainDef } from './types';

type State = ReturnType<typeof newGame>;

function atPark(day = 1, minute = 12 * 60): State {
  const state = newGame(1);
  state.clock.absoluteMinutes = (day - 1) * 1440 + minute;
  state.locationId = 'park';
  return state;
}

function play(state: State): State {
  for (let i = 0; i < 50 && state.pendingDialogueId; i += 1) {
    const dialogue = CONTENT_INDEX.dialogues.get(state.pendingDialogueId)!;
    const node = dialogue.nodes[state.dialogueNodeId!];
    state = node.choices?.length ? chooseDialogue(state, 0) : advanceDialogue(state);
  }
  return state;
}

function meetHiori(): State {
  return play(startStory(atPark(1), 'hiori-encounter'));
}

function withChain<T>(chain: StoryChainDef, run: () => T): T {
  CONTENT_INDEX.storyChains.set(chain.id, chain);
  try {
    return run();
  } finally {
    CONTENT_INDEX.storyChains.delete(chain.id);
  }
}

describe('describeCondition', () => {
  it('reports the money gap, not the total', () => {
    const state = newGame(1);
    state.money = 3800;

    expect(describeCondition({ kind: 'moneyAtLeast', value: 5000 }, state)).toBe(
      '还差 ¥1,200',
    );
    expect(
      describeCondition({ kind: 'moneyAtLeast', value: 3800 }, state),
    ).toBeUndefined();
  });

  it('names the missing item with its display name', () => {
    const state = newGame(1);

    expect(
      describeCondition({ kind: 'hasItem', itemId: 'gift.flower' }, state),
    ).toBe('还缺 花束 ×1');
  });

  it('uses the attribute label and target rank', () => {
    const state = newGame(1);

    expect(
      describeCondition({ kind: 'attributeAtLeast', ref: 'vocal', rank: 'D' }, state),
    ).toBe('歌唱还得练到 D');
  });

  it('speaks differently for meeting and recruiting', () => {
    const state = newGame(1);
    state.idols.hiori!.status = 'known';

    expect(
      describeCondition(
        { kind: 'idolStatus', idolId: 'hiori', status: 'known' },
        state,
      ),
    ).toBe('还得先正式认识风野灯织');
    expect(
      describeCondition(
        { kind: 'idolStatus', idolId: 'hiori', status: 'recruited' },
        state,
      ),
    ).toBe('得先让风野灯织加入');
  });

  it('never names an idol the player has not met', () => {
    const state = newGame(1);

    expect(
      describeCondition(
        { kind: 'idolStatus', idolId: 'meguru', status: 'known' },
        state,
      ),
    ).toBeUndefined();
  });

  it('refuses to guess at conditions it cannot phrase', () => {
    const state = newGame(1);

    expect(describeCondition({ kind: 'flag', key: 'x' }, state)).toBeUndefined();
    expect(
      describeCondition(
        { kind: 'sharedStatAtLeast', stat: 'stress', value: 80 },
        state,
      ),
    ).toBeUndefined();
  });
});

describe('buildHandbook', () => {
  it('stays empty while nobody has been met', () => {
    const view = buildHandbook(newGame(1));

    expect(view.active).toHaveLength(0);
    expect(view.archive).toHaveLength(0);
  });

  it('shows the waiting step right after the first meeting', () => {
    const view = buildHandbook(meetHiori());
    const entry = view.active[0];

    expect(entry?.status).toBe('waiting');
    expect(entry?.daysLeft).toBe(2);
    expect(entry?.locationName).toBe('公园');
    expect(entry?.timeWindowText).toBe('10:00–18:00');
    expect(entry?.title).toBe('风野灯织 · 在长椅旁停下');
    expect(entry?.steps).toEqual([
      { label: '在长椅旁停下', done: true, current: false },
      { label: '去公园看看', done: false, current: true },
    ]);
  });

  it('turns available inside the window on the eligible day', () => {
    const state = meetHiori();
    state.clock.absoluteMinutes = 2 * 1440 + 12 * 60;

    expect(buildHandbook(state).active[0]?.status).toBe('available');
  });

  it('is off-hours on the eligible day outside the window', () => {
    const state = meetHiori();
    state.clock.absoluteMinutes = 2 * 1440 + 22 * 60;

    expect(buildHandbook(state).active[0]?.status).toBe('off-hours');
  });

  it('moves the finished chain to the archive', () => {
    const second = meetHiori();
    second.clock.absoluteMinutes = 2 * 1440 + 12 * 60;
    const done = play(startStory(second, 'hiori-encounter'));
    const view = buildHandbook(done);

    expect(view.active).toHaveLength(0);
    expect(view.archive).toHaveLength(1);
    expect(view.archive[0]?.status).toBe('done');
  });

  it('marks the entry blocked while the engine is refusing actions', () => {
    const state = meetHiori();
    state.flags.forced_rest = true;

    expect(buildHandbook(state).active[0]).toMatchObject({
      status: 'blocked',
      reason: '现在不行。',
    });
  });

  it('names the gap when a step condition is unmet', () => {
    const chain: StoryChainDef = {
      id: 'fixture-blocked',
      idolId: 'hiori',
      revealWhen: [],
      steps: [
        {
          id: 'fixture-blocked-1',
          locationId: 'park',
          actionLabel: '交报名费',
          dialogueId: 'dialogue.hiori.first',
          when: [{ kind: 'moneyAtLeast', value: 5000 }],
        },
      ],
    };

    withChain(chain, () => {
      const state = newGame(1);
      state.money = 3800;
      const entry = buildHandbook(state).active[0];

      expect(entry).toMatchObject({ status: 'blocked', reason: '还差 ¥1,200' });
    });
  });
});
