import { describe, expect, it } from 'vitest';
import { EXP_TIER_VALUES, reduceExpTier } from './growth';

describe('exp tiers', () => {
  it('supports the widened 1/2/3/4/5/10/20 set', () => {
    expect(EXP_TIER_VALUES).toEqual({
      1: 1,
      2: 2,
      3: 3,
      4: 4,
      5: 5,
      10: 10,
      20: 20,
    });
  });

  it('reduces a failed tier to the previous meaningful tier', () => {
    expect(reduceExpTier(20)).toBe(10);
    expect(reduceExpTier(10)).toBe(5);
    expect(reduceExpTier(5)).toBe(3);
    expect(reduceExpTier(4)).toBe(3);
    expect(reduceExpTier(3)).toBe(1);
    expect(reduceExpTier(2)).toBe(1);
    expect(reduceExpTier(1)).toBe(1);
  });
});
