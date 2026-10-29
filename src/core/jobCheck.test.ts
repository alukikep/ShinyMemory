import { afterEach, describe, expect, it } from 'vitest';
import { CONTENT_INDEX } from './contentIndex';
import { acceptJob, attendJob, newGame } from './sim';
import type { GameState, JobDef } from './types';

const JOB_ID = 'test.job.checked';

const job: JobDef = {
  id: JOB_ID,
  name: '检定工作',
  description: '',
  locationId: 'studio',
  fromMinute: 10 * 60,
  toMinute: 12 * 60,
  pay: 1000,
  check: { ref: 'vocal', difficulty: 'E' },
  failurePayRatio: 0.4,
  effects: [
    { kind: 'fans', value: 100 },
    { kind: 'attributeExp', ref: 'expression', tier: 1 },
  ],
  failureEffects: [{ kind: 'sharedStat', stat: 'stress', delta: 12 }],
};

afterEach(() => {
  CONTENT_INDEX.jobs.delete(JOB_ID);
});

function setup(seed: number): GameState {
  const state = newGame(seed);
  state.pendingDialogueId = undefined;
  state.dialogueNodeId = undefined;
  state.idols.mano!.status = 'recruited';
  state.locationId = 'office';
  state.clock.absoluteMinutes = 9 * 60;
  state.phase = 'plan';
  return state;
}

function attend(seed: number): {
  pay: number;
  fans: number;
  stress: number;
} {
  let state = setup(seed);
  // 夹具里的真乃只有周日（第 7 天）的行程可以被工作替换。
  const day = 7;
  state = acceptJob(state, JOB_ID, day);
  if (state.jobs.length === 0) throw new Error('job was not accepted');

  state.clock.absoluteMinutes = (day - 1) * 1440 + 10 * 60;
  state.locationId = 'studio';
  state.selectedIdolId = 'mano';
  const before = {
    money: state.money,
    fans: state.idols.mano!.fans,
    stress: state.shared.stress,
  };
  const after = attendJob(state, state.jobs[0]!.id);
  return {
    pay: after.money - before.money,
    fans: after.idols.mano!.fans - before.fans,
    stress: after.shared.stress - before.stress,
  };
}

describe('jobs with a check', () => {
  it('settles full pay with effects on success, partial pay with failure effects on failure', () => {
    CONTENT_INDEX.jobs.set(JOB_ID, job);

    const outcomes = Array.from({ length: 40 }, (_, index) => attend(index + 1));
    const full = outcomes.filter((entry) => entry.pay === 1000);
    const partial = outcomes.filter((entry) => entry.pay === 400);

    // 两次结果都要出现，否则说明检定没生效。
    expect(full.length).toBeGreaterThan(0);
    expect(partial.length).toBeGreaterThan(0);
    expect(full.length + partial.length).toBe(outcomes.length);

    // 成功：拿满钱、涨粉、不走失败分支。
    for (const entry of full) {
      expect(entry.fans).toBe(100);
      expect(entry.stress).toBe(0);
    }
    // 失败：按比例结算、不涨粉、吃失败分支的压力。
    for (const entry of partial) {
      expect(entry.fans).toBe(0);
      expect(entry.stress).toBe(12);
    }
  });

  it('pays the full amount when the job has no check', () => {
    CONTENT_INDEX.jobs.set(JOB_ID, { ...job, check: undefined, effects: [] });

    for (const seed of [1, 2, 3]) {
      expect(attend(seed).pay).toBe(1000);
    }
  });
});
