import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { acceptJob, newGame } from './sim';
import { buildJobBoard, jobDatesFor } from './scene';
import { CONTENT_INDEX } from './contentIndex';
import { buildContentIndex } from './contentIndexCore';
import { PRODUCTION_PACK } from './productionPack';
import type { JobDef } from './types';

const LEAD_JOB_ID = 'test.lead.job';

let original: typeof CONTENT_INDEX;
beforeEach(() => {
  original = CONTENT_INDEX;
  Object.assign(CONTENT_INDEX, buildContentIndex(PRODUCTION_PACK));
});
afterEach(() => {
  CONTENT_INDEX.jobs.delete(LEAD_JOB_ID);
  Object.assign(CONTENT_INDEX, original);
});

function stateWithTwoIdols() {
  const state = newGame(3);
  state.pendingDialogueId = undefined;
  state.phase = 'plan';
  state.locationId = 'office';
  state.clock.absoluteMinutes = 4 * 1440 + 12 * 60;
  for (const id of ['mano', 'hiori']) {
    const idol = state.idols[id];
    if (idol) idol.status = 'recruited';
  }
  state.selectedIdolId = 'mano';
  state.focusIdolId = 'mano';
  return state;
}

describe('job offers per idol', () => {
  it('lists every recruited idol, not just the focused one', () => {
    const state = stateWithTwoIdols();
    const board = buildJobBoard(state);
    const job = board.entries.find((entry) => entry.offers.length > 0)!;
    const ids = job.offers.map((offer) => offer.idolId);
    expect(ids.length).toBeGreaterThan(1);
  });

  it('keeps a job open for the idol who meets the requirement', () => {
    const state = stateWithTwoIdols();
    // 电台收录要表现 D：让真乃达标、灯织不达标
    state.idols.mano!.stats.expression.rank = 'D';
    state.idols.hiori!.stats.expression.rank = 'E';
    const board = buildJobBoard(state);
    const radio = board.entries.find((entry) => entry.jobId === 'job.radio_recording')!;
    const mano = radio.offers.find((offer) => offer.idolId === 'mano')!;
    const hiori = radio.offers.find((offer) => offer.idolId === 'hiori')!;
    expect(mano.command).toBeDefined();
    expect(hiori.command).toBeUndefined();
    expect(hiori.locked).toBe(true);
  });

  it('refuses to assign an idol who fails the requirement', () => {
    const state = stateWithTwoIdols();
    state.idols.hiori!.stats.expression.rank = 'E';
    const after = acceptJob(state, 'job.radio_recording', 6, 'hiori');
    expect(after.jobs ?? []).toHaveLength(0);
  });

  it('offers a seven-day window and respects a lead time', () => {
    const state = stateWithTwoIdols();
    const base = PRODUCTION_PACK.jobs.find((job) => job.id === 'job.studio_shoot')!;
    const leadJob: JobDef = {
      ...base,
      id: LEAD_JOB_ID,
      name: '远期大工作',
      leadDays: 7,
      requires: [],
      cooldownDays: 7,
    };
    CONTENT_INDEX.jobs.set(leadJob.id, leadJob);

    const dates = jobDatesFor(state, leadJob, 'mano');
    expect(dates).toHaveLength(7);
    expect(dates[0]?.day).toBe(12);
    expect(dates[0]?.available).toBe(true);
    expect(dates.every((date) => date.day >= 12)).toBe(true);

    const board = buildJobBoard(state);
    const entry = board.entries.find((item) => item.jobId === LEAD_JOB_ID)!;
    const offer = entry.offers.find((item) => item.idolId === 'mano')!;
    expect(offer.dates).toHaveLength(7);
    expect(offer.dates[0]?.dayLabel).toContain('4月');

    expect(acceptJob(state, leadJob.id, 11, 'mano').jobs).toHaveLength(0);
    expect(acceptJob(state, leadJob.id, 12, 'mano').jobs).toHaveLength(1);
  });
});
