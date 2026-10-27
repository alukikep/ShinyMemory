import { describe, expect, it } from 'vitest';
import { newGame, applyActivity, buyItem, giveGift } from './sim';
import type { GameState } from './types';

function atShop(seed = 1): GameState {
  const state = newGame(seed);
  state.phase = 'plan';
  state.locationId = 'shopping_street';
  state.money = 3000;
  return state;
}

describe('item economy', () => {
  it('buys an item at its shop and records the purchase', () => {
    const next = buyItem(atShop(), 'gift.flower');
    expect(next.money).toBe(2500);
    expect(next.inventory['gift.flower']).toBe(1);
    expect(next.shopPurchases['gift.flower']).toBe(1);
  });

  it('does not buy outside the shop, without money, or past the limit', () => {
    const outside = atShop();
    outside.locationId = 'home';
    expect(buyItem(outside, 'gift.flower')).toBe(outside);

    const poor = atShop();
    poor.money = 100;
    expect(buyItem(poor, 'gift.flower')).toBe(poor);

    let state = atShop();
    for (let index = 0; index < 3; index += 1) {
      state = buyItem(state, 'gift.flower');
    }
    const capped = buyItem(state, 'gift.flower');
    expect(capped.shopPurchases['gift.flower']).toBe(3);
    expect(capped.inventory['gift.flower']).toBe(3);
    expect(capped.money).toBe(1500);
  });

  it('gives a gift to the selected idol and consumes it', () => {
    const state = atShop();
    state.inventory['gift.flower'] = 1;
    const before = state.idols.hiori!.stats.trust.exp;

    const next = giveGift(state, 'gift.flower', 'hiori');
    expect(next.inventory['gift.flower']).toBeUndefined();
    expect(next.idols.hiori!.stats.trust.exp).toBeGreaterThan(before);
    expect(next.log.some((entry) => entry.text.includes('花束'))).toBe(true);
  });

  it('does not give keepsakes, missing inventory, or to an unknown idol', () => {
    const state = atShop();
    state.inventory['keepsake.photo'] = 1;
    expect(giveGift(state, 'keepsake.photo', 'hiori')).toBe(state);
    expect(giveGift(state, 'gift.flower', 'hiori')).toBe(state);

    state.inventory['gift.flower'] = 1;
    expect(giveGift(state, 'gift.flower', 'missing')).toBe(state);
  });

  it('charges for a one-time advanced lesson', () => {
    const state = newGame(1);
    state.phase = 'plan';
    state.locationId = 'practice_room';
    state.clock.absoluteMinutes = 720;
    state.money = 3000;
    state.idols.mano!.stats.vocal.rank = 'D';

    const next = applyActivity(state, 'lesson_vocal_advanced', 'mano');
    expect(next.money).toBe(2200);
    expect(next.flags.lesson_vocal_advanced_done).toBe(true);
    expect(applyActivity(next, 'lesson_vocal_advanced', 'mano')).toBe(next);
  });

  it('charges for a meal and restores stress', () => {
    const state = atShop();
    state.shared.stress = 50;

    const next = applyActivity(state, 'cafe_lunch', 'mano');
    expect(next.money).toBe(2700);
    expect(next.shared.stress).toBe(42);
  });
});
