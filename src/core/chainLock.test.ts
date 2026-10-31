import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { evaluateStoryChain, newGame } from './sim';
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

function state() {
  const state = newGame(3);
  state.pendingDialogueId = undefined;
  state.phase = 'plan';
  state.locationId = 'park';
  state.clock.absoluteMinutes = 8 * 1440 + 14 * 60;
  if (state.idols.mano) state.idols.mano.status = 'recruited';
  state.selectedIdolId = 'mano';
  state.focusIdolId = 'mano';
  return state;
}

const chain = (id: string) => CONTENT_INDEX.storyChains.get(id)!;

describe('one chain per idol', () => {
  it('blocks another chain while one is in progress', () => {
    const game = state();
    game.storyChains['mano-smile'] = { chainId: 'mano-smile', stepIndex: 1 };
    const slump = evaluateStoryChain(game, chain('mano-slump'));
    expect(slump.blocks.some((block) => block.kind === 'idol-busy')).toBe(true);
  });

  it('does not block the chain that is itself in progress', () => {
    const game = state();
    game.storyChains['mano-smile'] = { chainId: 'mano-smile', stepIndex: 1 };
    const smile = evaluateStoryChain(game, chain('mano-smile'));
    expect(smile.blocks.some((block) => block.kind === 'idol-busy')).toBe(false);
  });

  it('does not let recruitment chains lock the idol', () => {
    const game = state();
    // 招募链（lockScope: 'none'）进行中，卡面照样能开
    game.storyChains['mano-encounter'] = {
      chainId: 'mano-encounter',
      stepIndex: 1,
    };
    const smile = evaluateStoryChain(game, chain('mano-smile'));
    expect(smile.blocks.some((block) => block.kind === 'idol-busy')).toBe(false);
  });

  it('keeps chains of different idols independent', () => {
    const game = state();
    game.storyChains['mano-smile'] = { chainId: 'mano-smile', stepIndex: 1 };
    const hiori = evaluateStoryChain(game, chain('hiori-smile-card'));
    expect(hiori.blocks.some((block) => block.kind === 'idol-busy')).toBe(false);
  });
});
