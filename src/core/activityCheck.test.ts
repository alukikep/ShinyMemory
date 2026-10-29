import { describe, expect, it } from 'vitest';
import { activityCheckChance, applyActivityDef, newGame, travelTo } from './sim';
import type { ActivityDef, GameState } from './types';

function activity(overrides: Partial<ActivityDef> = {}): ActivityDef {
  return {
    id: 'test.check',
    name: '试镜',
    description: '检定用',
    kind: 'training',
    locations: ['practice_room'],
    durationMinutes: 60,
    timeWindows: [{ fromMinute: 8 * 60, toMinute: 22 * 60 }],
    cost: { stamina: 5 },
    effects: [{ kind: 'money', delta: 100 }],
    failureEffects: [{ kind: 'money', delta: -50 }],
    resultTexts: ['过了。'],
    failureTexts: ['没过。'],
    check: { ref: 'vocal', difficulty: 'F' },
    ...overrides,
  };
}

function prepared(seed = 1): GameState {
  const state = travelTo(newGame(seed), 'practice_room');
  state.idols.mano!.stats.vocal.rank = 'S';
  return state;
}

describe('activity checks', () => {
  it('maps rank gaps to 15% steps', () => {
    const state = prepared();
    const even = activity({ check: { ref: 'vocal', difficulty: 'S' } });

    expect(activityCheckChance(state, even)).toBeCloseTo(0.5);
    expect(
      activityCheckChance(
        state,
        activity({ check: { ref: 'vocal', difficulty: 'A' } }),
      ),
    ).toBeCloseTo(0.65);
  });

  it('clamps and applies shift', () => {
    const state = prepared();

    expect(
      activityCheckChance(
        state,
        activity({ check: { ref: 'vocal', difficulty: 'F' } }),
      ),
    ).toBeCloseTo(0.95);
    expect(
      activityCheckChance(
        state,
        activity({ check: { ref: 'vocal', difficulty: 'S', shift: 100 } }),
      ),
    ).toBeCloseTo(0.95);
    expect(
      activityCheckChance(
        state,
        activity({ check: { ref: 'vocal', difficulty: 'F', shift: -100 } }),
      ),
    ).toBeCloseTo(0.4);
  });

  it('returns undefined without a check', () => {
    expect(activityCheckChance(prepared(), activity({ check: undefined }))).toBe(
      undefined,
    );
  });

  it('uses failure effects and texts when the roll fails', () => {
    const practice = activity();
    let failed: { state: GameState; before: number } | undefined;
    for (let seed = 1; seed <= 300 && !failed; seed += 1) {
      const state = prepared(seed);
      state.idols.mano!.stats.vocal.rank = 'F';
      const before = state.money;
      const next = applyActivityDef(state, {
        ...practice,
        check: { ref: 'vocal', difficulty: 'S' },
      });
      if (next.pendingActivityPassed === false) failed = { state: next, before };
    }

    expect(failed).toBeDefined();
    expect(failed!.state.money).toBe(failed!.before - 50);
    expect(failed!.state.lastResult).toBe('没过。');
    // 失败也照扣体力与时间
    expect(failed!.state.shared.stamina).toBeLessThan(100);
    expect(failed!.state.clock.absoluteMinutes).toBeGreaterThan(8 * 60);
  });

  it('uses success effects when the roll passes', () => {
    const state = prepared(1);
    const before = state.money;
    const next = applyActivityDef(state, activity());

    expect(next.pendingActivityPassed).toBe(true);
    expect(next.money).toBe(before + 100);
    expect(next.lastResult).toBe('过了。');
  });
});
