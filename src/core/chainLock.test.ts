import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { evaluateStoryChain, getEligibleStories, getStoryTriggerReport, newGame, startStory } from './sim';
import { occupyingStoryChains } from './storyCapacity';
import { storyHints } from './storyHints';
import { buildHandbook } from './handbook';
import { CONTENT_INDEX } from './contentIndex';
import { buildContentIndex } from './contentIndexCore';
import { PRODUCTION_PACK } from './productionPack';

let original: typeof CONTENT_INDEX;
beforeEach(() => {
  original = { ...CONTENT_INDEX };
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
  it('checks every active chain, not just the first chain from a different idol', () => {
    const game = state();
    game.storyChains['hiori-smile-card'] = { chainId: 'hiori-smile-card', stepIndex: 1 };
    game.storyChains['mano-smile'] = { chainId: 'mano-smile', stepIndex: 1 };
    expect(evaluateStoryChain(game, chain('mano-slump')).blocks).toContainEqual({ kind: 'idol-busy', chainId: 'mano-smile' });
  });

  it('blocks the third start and its hints while allowing existing chains to continue', () => {
    const game = state();
    game.idols.meguru!.status = 'recruited';
    game.locationId = 'shopping_street';
    game.storyChains['mano-smile'] = { chainId: 'mano-smile', stepIndex: 1 };
    game.storyChains['hiori-smile-card'] = { chainId: 'hiori-smile-card', stepIndex: 1 };
    const third = chain('meguru-picarte');
    expect(evaluateStoryChain(game, third).blocks).toContainEqual({ kind: 'story-capacity', used: 2, limit: 2 });
    expect(getEligibleStories(game).map((entry) => entry.chain.id)).not.toContain(third.id);
    expect(startStory(game, third.id)).toBe(game);
    expect(storyHints(game).filter((hint) => chain(hint.chainId).lockScope !== 'none')).toHaveLength(0);
    expect(getStoryTriggerReport(game).find((report) => report.chainId === third.id)?.reason).toContain('2/2');
    for (const id of ['mano-smile', 'hiori-smile-card']) {
      expect(evaluateStoryChain(game, chain(id)).blocks.some((block) => block.kind === 'story-capacity' || block.kind === 'idol-busy')).toBe(false);
    }
    game.storyChains['mano-smile']!.completed = true;
    expect(evaluateStoryChain(game, third).eligible).toBe(true);
    expect(startStory(game, third.id).dialogueChainId).toBe(third.id);
  });

  it('exempts recruitment from both counting and blocking even when full', () => {
    const game = state();
    game.storyChains['mano-smile'] = { chainId: 'mano-smile', stepIndex: 1 };
    game.storyChains['hiori-smile-card'] = { chainId: 'hiori-smile-card', stepIndex: 1 };
    game.storyChains['mano-encounter'] = { chainId: 'mano-encounter', stepIndex: 1 };
    expect(occupyingStoryChains(game).map((entry) => entry.id).sort()).toEqual(['hiori-smile-card', 'mano-smile']);
    expect(evaluateStoryChain(game, chain('mano-encounter')).blocks.some((block) => block.kind === 'story-capacity' || block.kind === 'idol-busy')).toBe(false);
    const view = buildHandbook(game);
    expect(view.slots).toEqual({ used: 2, limit: 2 });
    expect(view.recruitment.some((entry) => entry.id === 'chain:mano-encounter')).toBe(true);
    expect(view.active.map((entry) => entry.id).sort()).toEqual(['chain:hiori-smile-card', 'chain:mano-smile']);
  });

  it('preserves over-limit old progress and ignores deleted or exhausted chains', () => {
    const game = state();
    for (const id of ['mano-smile', 'hiori-smile-card', 'meguru-picarte']) {
      game.storyChains[id] = { chainId: id, stepIndex: 1 };
    }
    game.storyChains.deleted = { chainId: 'deleted', stepIndex: 1 };
    game.storyChains['mano-natural'] = { chainId: 'mano-natural', stepIndex: chain('mano-natural').steps.length };
    const before = structuredClone(game);
    expect(occupyingStoryChains(game)).toHaveLength(3);
    expect(buildHandbook(game).slots).toEqual({ used: 3, limit: 2 });
    for (const id of ['mano-smile', 'hiori-smile-card', 'meguru-picarte']) {
      expect(evaluateStoryChain(game, chain(id)).blocks.some((block) => block.kind === 'story-capacity' || block.kind === 'idol-busy')).toBe(false);
    }
    expect(game).toEqual(before);
  });

  it('puts revealed but unstarted chains in leads without reserving slots', () => {
    const game = state();
    const original = chain('mano-natural');
    CONTENT_INDEX.storyChains.set(original.id, { ...original, revealMode: 'conditions', revealWhen: [] });
    try {
      const view = buildHandbook(game);
      expect(view.leads.some((entry) => entry.id === `chain:${original.id}`)).toBe(true);
      expect(view.active.some((entry) => entry.id === `chain:${original.id}`)).toBe(false);
      expect(view.slots.used).toBe(0);
    } finally {
      CONTENT_INDEX.storyChains.set(original.id, original);
    }
  });

  it('counts an opening dialogue immediately and reveals it in the handbook', () => {
    const game = state();
    const opened = startStory(game, 'mano-smile');
    expect(opened.dialogueChainId).toBe('mano-smile');
    expect(occupyingStoryChains(opened).map((entry) => entry.id)).toEqual(['mano-smile']);
    expect(buildHandbook(opened).active.some((entry) => entry.id === 'chain:mano-smile')).toBe(true);
    expect(storyHints(opened).some((hint) => hint.chainId === 'mano-smile')).toBe(false);
  });
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
