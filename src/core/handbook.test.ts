import { describe, expect, it } from 'vitest';
import { describeCondition } from './handbook';
import { newGame } from './sim';

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
