import { describe, expect, it } from 'vitest';
import { buildScene } from './scene';
import {
  activityAvailability,
  activityTargets,
  applyActivity,
  getActivity,
  newGame,
} from './sim';
import type { ActivityDef, GameState } from './types';

const EXCLUSIVE_ID = 'bond.mano.extra_practice';

/** 两个偶像都在练习室、都已招募，时间在窗口内。 */
function bothAtPracticeRoom(): GameState {
  const state = newGame(5);
  state.pendingDialogueId = undefined;
  state.locationId = 'practice_room';
  state.clock.absoluteMinutes = 12 * 60;
  for (const id of ['mano', 'hiori']) {
    state.idols[id]!.status = 'recruited';
  }
  state.selectedIdolId = 'mano';
  state.phase = 'plan';
  return state;
}

function enterIdol(state: GameState, idolId: string): GameState {
  const next = structuredClone(state);
  next.phase = 'idol';
  next.selectedIdolId = idolId;
  return next;
}

function activityLabels(state: GameState): string[] {
  return buildScene(state).actions.map((action) => action.label);
}

describe('idol-exclusive activities', () => {
  it('only lists the action on the owning idol page', () => {
    const state = bothAtPracticeRoom();
    expect(activityLabels(enterIdol(state, 'mano'))).toContain('陪她加练');
    expect(activityLabels(enterIdol(state, 'hiori'))).not.toContain('陪她加练');
  });

  it('never shows up on the location page', () => {
    const state = bothAtPracticeRoom();
    expect(activityLabels(state)).not.toContain('陪她加练');
    // 同一页上的通用行动还在
    expect(activityLabels(state)).toContain('环顾四周');
  });

  it('is hidden (not disabled) for the wrong idol', () => {
    const state = bothAtPracticeRoom();
    const activity = getActivity(EXCLUSIVE_ID)!;
    expect(activityAvailability(state, activity, 'mano').ok).toBe(true);
    expect(activityAvailability(state, activity, 'hiori')).toEqual({
      ok: false,
      display: 'hide',
      reason: '专属行动',
    });
  });

  it('refuses to run for another idol', () => {
    const state = enterIdol(bothAtPracticeRoom(), 'hiori');
    const after = applyActivity(state, EXCLUSIVE_ID, 'hiori');
    expect(after).toBe(state);
  });

  it('runs and grants fans to the owner', () => {
    const state = enterIdol(bothAtPracticeRoom(), 'mano');
    const after = applyActivity(state, EXCLUSIVE_ID, 'mano');
    expect(after.phase).toBe('activityResult');
    expect(after.idols.mano!.fans).toBe(5);
    expect(after.idols.hiori!.fans).toBe(0);
  });

  it('intersects targets for multi-idol activities', () => {
    const state = bothAtPracticeRoom();
    const group: ActivityDef = {
      id: 'test.exclusive.group',
      name: '只带真乃',
      description: '',
      kind: 'bond',
      target: 'all-present-idols',
      idolIds: ['mano'],
      durationMinutes: 30,
      cost: {},
      effects: [],
      resultTexts: ['ok'],
    };
    expect(activityTargets(state, group)).toEqual(['mano']);
    expect(activityTargets(state, { ...group, idolIds: undefined })).toEqual([
      'mano',
      'hiori',
    ]);
  });

  it('keeps generic activities untouched', () => {
    const state = bothAtPracticeRoom();
    const generic = getActivity('free')!;
    expect(generic.idolIds).toBeUndefined();
    expect(activityAvailability(state, generic, 'hiori').ok).toBe(true);
    expect(activityTargets(state, generic, 'hiori')).toEqual(['hiori']);
  });
});
