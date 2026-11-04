import { CONTENT_INDEX } from './contentIndex';
import type { GameState, StoryChainDef } from './types';

export const STORY_CHAIN_LIMIT = 2;

/** Only existing, unfinished, non-exempt chains occupy a slot. No saved counter. */
export function occupyingStoryChains(state: GameState): StoryChainDef[] {
  return [...CONTENT_INDEX.storyChains.values()].filter((chain) => {
    if (chain.lockScope === 'none') return false;
    const progress = state.storyChains[chain.id];
    if (progress) return !progress.completed && Boolean(chain.steps[progress.stepIndex]);
    return Boolean(state.pendingDialogueId && state.dialogueChainId === chain.id);
  });
}
