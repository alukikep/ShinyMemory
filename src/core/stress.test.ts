import { describe, expect, it } from 'vitest';
import { applyActivity, jobCheckChance, newGame } from './sim';
import { PRODUCTION_PACK } from './productionPack';

const job = PRODUCTION_PACK.jobs.find((j) => j.check)!;

function stateAtStress(stress: number) {
  const state = newGame(1);
  state.shared.stress = stress;
  state.phase = 'plan';
  state.pendingDialogueId = undefined;
  state.locationId = 'practice_room';
  if (state.idols.mano) state.idols.mano.status = 'recruited';
  return state;
}

describe('stress consequences', () => {
  it('lowers job success chance by 15% above 70', () => {
    const calm = jobCheckChance(stateAtStress(0), job)!;
    const tense = jobCheckChance(stateAtStress(70), job)!;
    expect(calm - tense).toBeCloseTo(0.15, 5);
  });

  it('forces rest once stress hits the cap', () => {
    const state = stateAtStress(96);
    const idol = state.idols.mano;
    if (idol) idol.status = 'recruited';
    const after = applyActivity(state, 'vocal', 'mano');
    expect(after.shared.stress).toBe(100);
    expect(after.flags.forced_rest).toBe(true);
  });

  it('blocks training while forced to rest', () => {
    const state = stateAtStress(100);
    state.flags.forced_rest = true;
    const after = applyActivity(state, 'vocal', 'mano');
    expect(after).toBe(state);
  });

  it('releases the rest flag once stress recovers below 70', () => {
    const state = stateAtStress(100);
    state.flags.forced_rest = true;
    state.shared.stress = 40;
    // 休息在事务所才能做
    state.locationId = 'office';
    const after = applyActivity(state, 'rest');
    expect(after.shared.stress).toBeLessThan(70);
    expect(after.flags.forced_rest).toBe(false);
  });
});
