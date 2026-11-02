import { describe, expect, it } from 'vitest';
import type { ContentPack } from '../contentIndexCore';
import { PENDING_CHAPTERS } from './chapters';
import { attachPendingChapters } from './assemblePack';

function emptyPack(): ContentPack {
  return {
    activities: [],
    actors: [],
    idols: [],
    equips: [],
    events: [],
    jobs: [],
    items: [],
    shops: [],
    dialogues: [],
    storyChains: [],
    locations: [],
    transitRoutes: [],
    walkEdges: [],
    starting: { activeIdolId: '', idolStatus: {} },
  };
}

describe('attachPendingChapters', () => {
  it('drops chapters whose dialogue is not in the pack', () => {
    expect(attachPendingChapters(emptyPack()).storyChains).toEqual([]);
  });

  it('attaches every chapter once all step dialogues exist', () => {
    const dialogueIds = new Set(
      PENDING_CHAPTERS.flatMap((chain) =>
        chain.steps.map((step) => step.dialogueId),
      ),
    );
    const pack = emptyPack();
    pack.dialogues = [...dialogueIds].map((id) => ({ id }) as never);

    expect(attachPendingChapters(pack).storyChains).toHaveLength(
      PENDING_CHAPTERS.length,
    );
  });
});
