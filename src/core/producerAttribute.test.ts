import { afterEach, describe, expect, it } from 'vitest';
import { CONTENT_INDEX, buildContentIndex } from './contentIndex';
import { FIXTURE_CONTENT_PACK } from './content-fixture/pack';
import { PRODUCER_STAT_KEYS } from './producer';
import { buildScene } from './scene';
import { applyActivity, handleCommand, newGame } from './sim';
import type { ActivityDef, GameState } from './types';

const ERRAND_ID = 'test.producer.errand';

const errand: ActivityDef = {
  id: ERRAND_ID,
  name: '测试零工',
  description: '',
  kind: 'work',
  target: 'none',
  locations: ['office'],
  durationMinutes: 30,
  timeWindows: [{ fromMinute: 480, toMinute: 1320 }],
  cost: { stamina: 5 },
  effects: [
    { kind: 'money', delta: 200 },
    {
      kind: 'attributeExp',
      ref: { scope: 'producer', key: 'planning' },
      tier: 3,
    },
  ],
  resultTexts: ['ok'],
};

afterEach(() => {
  CONTENT_INDEX.activities.delete(ERRAND_ID);
});

function setup(): GameState {
  const state = newGame(3);
  state.pendingDialogueId = undefined;
  state.dialogueNodeId = undefined;
  state.idols.mano!.status = 'recruited';
  state.locationId = 'office';
  state.clock.absoluteMinutes = 12 * 60;
  state.phase = 'plan';
  return state;
}

describe('producer attributes', () => {
  it('exposes the four check attributes plus stamina', () => {
    expect(PRODUCER_STAT_KEYS).toEqual([
      'photography',
      'negotiation',
      'planning',
      'insight',
      'stamina',
    ]);
  });

  it('grows from an activity effect', () => {
    CONTENT_INDEX.activities.set(ERRAND_ID, errand);
    const before = setup();
    expect(before.producer.planning.exp).toBe(0);

    const after = applyActivity(before, ERRAND_ID);
    expect(after.producer.planning.exp).toBe(3);
    expect(after.money - before.money).toBe(200);
  });

  it('shows a target-none work activity on the location page only', () => {
    // 场景用的是建索引时的 activitiesByLocation，所以要重建索引。
    const original = CONTENT_INDEX;
    Object.assign(
      CONTENT_INDEX,
      buildContentIndex({
        ...FIXTURE_CONTENT_PACK,
        activities: [...FIXTURE_CONTENT_PACK.activities, errand],
      }),
    );
    const state = setup();
    const locations = buildScene(state).actions.map((action) => action.label);
    expect(locations).toContain('测试零工');

    const idolPage = handleCommand(state, {
      type: 'enterIdol',
      idolId: 'mano',
    });
    // 偶像不在事务所的话进不去；无论如何不该把制作人的活列给她。
    if (idolPage.phase === 'idol') {
      const labels = buildScene(idolPage).actions.map((action) => action.label);
      expect(labels).not.toContain('测试零工');
    }
    Object.assign(original, CONTENT_INDEX);
  });
});
