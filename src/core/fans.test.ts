import { afterEach, describe, expect, it } from 'vitest';
import { CONTENT_INDEX } from './contentIndex';
import { describeCondition } from './conditionText';
import { formatFans } from './labels';
import {
  applyActivity,
  applyActivityDef,
  getFans,
  newGame,
} from './sim';
import { migrateSave, createSaveEnvelope } from '../save/save';
import { SAVE_VERSION } from '../save/version';
import type { ActivityDef, Effect, GameState, IdolState } from './types';

const registeredActs: string[] = [];

afterEach(() => {
  for (const id of registeredActs.splice(0)) {
    CONTENT_INDEX.activities.delete(id);
  }
});

function activity(id: string, patch: Partial<ActivityDef>): ActivityDef {
  const def: ActivityDef = {
    id,
    name: id,
    description: id,
    kind: 'work',
    locations: ['practice_room'],
    durationMinutes: 30,
    cost: {},
    effects: [],
    resultTexts: ['ok'],
    ...patch,
  };
  CONTENT_INDEX.activities.set(id, def);
  registeredActs.push(id);
  return def;
}

/** 两个偶像都在练习室、都已招募。 */
function twoIdolsAtPracticeRoom(): GameState {
  const state = newGame(3);
  state.pendingDialogueId = undefined;
  state.locationId = 'practice_room';
  state.clock.absoluteMinutes = 12 * 60;
  for (const id of ['mano', 'hiori']) {
    state.idols[id]!.status = 'recruited';
  }
  return state;
}

function fansEffect(patch: Partial<Extract<Effect, { kind: 'fans' }>> = {}) {
  return { kind: 'fans' as const, value: 100, ...patch };
}

describe('fans', () => {
  it('starts at zero for a fresh game', () => {
    const state = newGame(1);
    expect(getFans(state, 'mano')).toBe(0);
    expect(state.idols.mano!.fans).toBe(0);
  });

  it('adds and sets', () => {
    const state = twoIdolsAtPracticeRoom();
    const add = activity('test.fans_add', {
      effects: [fansEffect({ value: 250 })],
    });
    const afterAdd = applyActivityDef(state, add, 'mano');
    expect(getFans(afterAdd, 'mano')).toBe(250);

    const set = activity('test.fans_set', {
      effects: [fansEffect({ op: 'set', value: 4000 })],
    });
    const afterSet = applyActivityDef(afterAdd, set, 'mano');
    expect(getFans(afterSet, 'mano')).toBe(4000);
  });

  it('applies once per target in a multi-target activity', () => {
    const state = twoIdolsAtPracticeRoom();
    const def = activity('test.fans_group', {
      target: 'all-present-idols',
      effects: [fansEffect({ value: 80 })],
    });

    const after = applyActivityDef(state, def);
    expect(getFans(after, 'mano')).toBe(80);
    expect(getFans(after, 'hiori')).toBe(80);
  });

  it('does not multiply an explicitly targeted effect', () => {
    const state = twoIdolsAtPracticeRoom();
    const def = activity('test.fans_explicit', {
      target: 'all-present-idols',
      effects: [fansEffect({ value: 300, idolId: 'mano' })],
    });

    const after = applyActivityDef(state, def);
    expect(getFans(after, 'mano')).toBe(300);
    expect(getFans(after, 'hiori')).toBe(0);
  });

  it('throws without an idol context', () => {
    const state = twoIdolsAtPracticeRoom();
    const def = activity('test.fans_orphan', {
      target: 'none',
      effects: [fansEffect()],
    });

    expect(() => applyActivityDef(state, def)).toThrow(/idol context/);
  });

  it('never goes below zero', () => {
    const state = twoIdolsAtPracticeRoom();
    const def = activity('test.fans_negative', {
      effects: [fansEffect({ value: -500 })],
    });

    const after = applyActivityDef(state, def, 'mano');
    expect(getFans(after, 'mano')).toBe(0);
  });

  it('survives a save round-trip and fills older saves with zero', () => {
    const state = twoIdolsAtPracticeRoom();
    state.idols.mano!.fans = 1234;

    const envelope = createSaveEnvelope(state);
    expect(migrateSave(envelope).state.idols.mano!.fans).toBe(1234);

    const legacy = structuredClone(envelope) as unknown as {
      schemaVersion: number;
      state: Omit<GameState, 'idols'> & {
        idols: Record<string, Omit<IdolState, 'fans'> & { fans?: number }>;
      };
    };
    legacy.schemaVersion = SAVE_VERSION - 1;
    delete legacy.state.idols.mano!.fans;

    const migrated = migrateSave(legacy as never);
    expect(migrated.state.idols.mano!.fans).toBe(0);
  });

  it('runs through the public activity entry', () => {
    const state = twoIdolsAtPracticeRoom();
    activity('test.fans_public', {
      timeWindows: [{ fromMinute: 0, toMinute: 24 * 60 }],
      effects: [fansEffect({ value: 60 })],
    });

    const after = applyActivity(state, 'test.fans_public', 'mano');
    expect(after.phase).toBe('activityResult');
    expect(getFans(after, 'mano')).toBe(60);
  });

  it('formats large counts for display only', () => {
    expect(formatFans(0)).toBe('0');
    expect(formatFans(9999)).toBe('9999');
    expect(formatFans(10000)).toBe('1万');
    expect(formatFans(12345)).toBe('1.2万');
    expect(formatFans(123456)).toBe('12.3万');
    expect(formatFans(1234567)).toBe('123万');
  });

  it('describes a fans gate in the handbook', () => {
    const state = twoIdolsAtPracticeRoom();
    state.idols.mano!.fans = 400;
    const text = describeCondition(
      { kind: 'fansAtLeast', idolId: 'mano', value: 1000 },
      state,
    );
    expect(text).toBe('樱木真乃的粉丝还差 600');
  });
});
