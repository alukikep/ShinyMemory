import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CONTENT_INDEX } from './contentIndex';
import { FACILITIES } from './content/facilities';
import { canReplaceDay, getSchedulesForDay } from './schedule';
import { buildJobBoard } from './scene';
import {
  acceptJob,
  cancelJob,
  jobSlotCap,
  newGame,
  upgradeFacility,
} from './sim';
import { getDay } from './time';
import type { GameState } from './types';

const DAY = 7;
const OFFICE_JOBS = FACILITIES.find((facility) => facility.id === 'office_jobs');

function setup(): GameState {
  const state = newGame(7);
  state.pendingDialogueId = undefined;
  state.dialogueNodeId = undefined;
  state.locationId = 'office';
  state.clock.absoluteMinutes = 9 * 60;
  state.phase = 'plan';
  state.idols.mano!.status = 'recruited';
  state.idols.hiori!.status = 'recruited';
  return state;
}

beforeEach(() => {
  if (!OFFICE_JOBS) throw new Error('缺少 office_jobs 设施');
  CONTENT_INDEX.facilities.set(OFFICE_JOBS.id, OFFICE_JOBS);
});

afterEach(() => {
  if (OFFICE_JOBS) CONTENT_INDEX.facilities.delete(OFFICE_JOBS.id);
});

describe('office job slots', () => {
  it('starts with one slot and rejects a second pending job', () => {
    const state = setup();
    expect(jobSlotCap(state)).toBe(1);

    const first = acceptJob(state, 'job_magazine', DAY, 'mano');
    expect(first.jobs).toHaveLength(1);

    const rejected = acceptJob(first, 'job_radio', DAY, 'hiori');
    expect(rejected).toBe(first);
    expect(rejected.jobs).toHaveLength(1);
  });

  it('counts jobs on different days against the same total', () => {
    const state = setup();
    const first = acceptJob(state, 'job_magazine', DAY, 'mano');
    const rejected = acceptJob(first, 'job_radio', DAY + 1, 'hiori');

    expect(rejected).toBe(first);
    expect(rejected.jobs).toHaveLength(1);
  });

  it('opens a second slot after upgrading the office workroom', () => {
    const state = setup();
    state.money = 20000;
    const upgraded = upgradeFacility(state, 'office_jobs');
    expect(jobSlotCap(upgraded)).toBe(2);

    const first = acceptJob(upgraded, 'job_magazine', DAY, 'mano');
    const second = acceptJob(first, 'job_radio', DAY, 'hiori');

    expect(second.jobs).toHaveLength(2);
    expect(second.jobs.map((job) => job.idolId).sort()).toEqual([
      'hiori',
      'mano',
    ]);
  });

  it('cancels before the job starts and frees both the slot and the day', () => {
    const state = setup();
    const accepted = acceptJob(state, 'job_magazine', DAY, 'mano');
    const actor = CONTENT_INDEX.actors.get('mano');
    if (!actor) throw new Error('缺少 mano');

    expect(
      canReplaceDay(actor, DAY, accepted.actors.mano!.scheduleOverrides).ok,
    ).toBe(false);

    const cancelled = cancelJob(accepted, accepted.jobs[0]!.id);
    expect(cancelled.jobs).toHaveLength(0);
    expect(cancelled.actors.mano!.scheduleOverrides).toHaveLength(0);
    expect(
      canReplaceDay(actor, DAY, cancelled.actors.mano!.scheduleOverrides).ok,
    ).toBe(true);

    const next = acceptJob(cancelled, 'job_radio', DAY, 'mano');
    expect(next.jobs).toHaveLength(1);
  });

  it('restores the weekly schedule after cancellation', () => {
    const state = setup();
    const accepted = acceptJob(state, 'job_magazine', DAY, 'mano');
    const actor = CONTENT_INDEX.actors.get('mano');
    if (!actor) throw new Error('缺少 mano');

    const during = getSchedulesForDay(
      actor,
      DAY,
      accepted.actors.mano!.scheduleOverrides,
    );
    expect(during.some((slot) => slot.label === '杂志拍摄')).toBe(true);

    const cancelled = cancelJob(accepted, accepted.jobs[0]!.id);
    const after = getSchedulesForDay(
      actor,
      DAY,
      cancelled.actors.mano!.scheduleOverrides,
    );
    expect(after.some((slot) => slot.label === '杂志拍摄')).toBe(false);
    expect(after.length).toBeGreaterThan(0);
  });

  it('refuses cancellation once the job has started', () => {
    const state = setup();
    const accepted = acceptJob(state, 'job_magazine', DAY, 'mano');
    accepted.clock.absoluteMinutes = (DAY - 1) * 1440 + 10 * 60;
    expect(getDay(accepted.clock.absoluteMinutes)).toBe(DAY);

    const cancelled = cancelJob(accepted, accepted.jobs[0]!.id);
    expect(cancelled).toBe(accepted);
    expect(cancelled.jobs).toHaveLength(1);
  });

  it('exposes slot state to the job board', () => {
    const state = setup();
    const open = buildJobBoard(state);
    expect(open.slots).toEqual({ used: 0, cap: 1, full: false });

    const accepted = acceptJob(state, 'job_magazine', DAY, 'mano');
    const full = buildJobBoard(accepted);
    expect(full.slots).toEqual({ used: 1, cap: 1, full: true });
  });
});
