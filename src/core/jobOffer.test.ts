import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { acceptJob, newGame } from './sim';
import { buildJobBoard } from './scene';
import { CONTENT_INDEX } from './contentIndex';
import { buildContentIndex } from './contentIndexCore';
import { PRODUCTION_PACK } from './productionPack';

let original: typeof CONTENT_INDEX;
beforeEach(() => {
  original = CONTENT_INDEX;
  Object.assign(CONTENT_INDEX, buildContentIndex(PRODUCTION_PACK));
});
afterEach(() => {
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
});
