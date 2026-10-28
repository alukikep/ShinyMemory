import { describe, expect, it } from 'vitest';
import { checkCondition, newGame } from './sim';

describe('handbook conditions', () => {
  it('compares money in both directions', () => {
    const state = newGame(1);
    state.money = 5000;

    expect(checkCondition({ kind: 'moneyAtLeast', value: 5000 }, state)).toBe(
      true,
    );
    expect(checkCondition({ kind: 'moneyAtLeast', value: 5001 }, state)).toBe(
      false,
    );
  });

  it('orders idol status so recruited satisfies known', () => {
    const state = newGame(1);

    expect(
      checkCondition(
        { kind: 'idolStatus', idolId: 'mano', status: 'known' },
        state,
      ),
    ).toBe(true);
    expect(
      checkCondition(
        { kind: 'idolStatus', idolId: 'mano', status: 'recruited' },
        state,
      ),
    ).toBe(true);
  });

  it('falls back to the selected idol, then to the context idol', () => {
    const state = newGame(1);

    // 当前偶像是真乃（已招募），所以省略 idolId 时按她判定
    expect(
      checkCondition({ kind: 'idolStatus', status: 'known' }, state),
    ).toBe(true);
    // 上下文里的偶像优先于当前偶像
    expect(
      checkCondition({ kind: 'idolStatus', status: 'known' }, state, {
        idolId: 'hiori',
      }),
    ).toBe(false);
  });

  it('treats an unknown idol as failing any status requirement', () => {
    const state = newGame(1);

    expect(
      checkCondition(
        { kind: 'idolStatus', idolId: 'hiori', status: 'known' },
        state,
      ),
    ).toBe(false);
    expect(
      checkCondition({ kind: 'idolStatus', idolId: 'nobody', status: 'known' }, state),
    ).toBe(false);
  });

  it('defaults hasItem to a single item', () => {
    const state = newGame(1);
    state.inventory.birthday_gift = 1;

    expect(
      checkCondition({ kind: 'hasItem', itemId: 'birthday_gift' }, state),
    ).toBe(true);
    expect(
      checkCondition(
        { kind: 'hasItem', itemId: 'birthday_gift', count: 2 },
        state,
      ),
    ).toBe(false);
    expect(checkCondition({ kind: 'hasItem', itemId: 'missing' }, state)).toBe(
      false,
    );
  });
});
