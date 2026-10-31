import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { newGame } from './sim';
import { CONTENT_INDEX } from './contentIndex';
import { buildContentIndex } from './contentIndexCore';
import { PRODUCTION_PACK } from './productionPack';
import { locationHints, storyHints } from './storyHints';
import { buildHandbook } from './handbook';

// 卡面章的链只在生产包里（它们是 approved 内容），单测跑夹具，
// 所以这里把索引换成生产包。
let original: typeof CONTENT_INDEX;
beforeEach(() => {
  original = CONTENT_INDEX;
  Object.assign(CONTENT_INDEX, buildContentIndex(PRODUCTION_PACK));
});
afterEach(() => {
  Object.assign(CONTENT_INDEX, original);
});

function playableState() {
  const state = newGame(1);
  state.pendingDialogueId = undefined;
  state.phase = 'plan';
  state.locationId = 'office';
  state.clock.absoluteMinutes = 4 * 1440 + 12 * 60;
  for (const id of ['mano', 'hiori', 'meguru']) {
    const idol = state.idols[id];
    if (idol) idol.status = 'recruited';
  }
  return state;
}

describe('discovery', () => {
  it('keeps card chapter one out of the handbook until triggered', () => {
    const state = playableState();
    const handbook = buildHandbook(state);
    const ids = [...handbook.active, ...handbook.archive].map((entry) => entry.id);
    expect(ids).not.toContain('chain:mano-smile');
    expect(ids).not.toContain('chain:hiori-smile-card');
    expect(ids).not.toContain('chain:meguru-picarte');
  });

  it('shows a hint for each unfound card opening', () => {
    const state = playableState();
    const hints = storyHints(state);
    const chains = hints.map((hint) => hint.chainId).sort();
    // 三个偶像的第一章都还没遇见
    expect(chains).toEqual(['hiori-smile-card', 'mano-smile', 'meguru-picarte']);
  });

  it('aggregates hints per location', () => {
    const state = playableState();
    const locations = locationHints(state);
    for (const entry of locations) {
      expect(entry.count).toBe(entry.hints.length);
      expect(entry.hints.length).toBeGreaterThan(0);
    }
  });

  it('drops the hint once the chapter is triggered', () => {
    const state = playableState();
    state.storyChains['mano-smile'] = {
      chainId: 'mano-smile',
      stepIndex: 1,
      completed: true,
    };
    const hints = storyHints(state).map((hint) => hint.chainId);
    expect(hints).not.toContain('mano-smile');
  });
});
