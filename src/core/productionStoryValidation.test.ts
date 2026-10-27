import { describe, expect, it } from 'vitest';
import { PRODUCTION_PACK, buildContentIndex } from './contentIndex';
import { validateStoryContent } from './storyValidation';

describe('production story content', () => {
  it('has valid production dialogue and story references', () => {
    const index = buildContentIndex(PRODUCTION_PACK);
    const result = validateStoryContent({
      dialogues: index.dialogues,
      chains: index.storyChains,
      idols: index.idols,
      locations: index.locations,
    });
    expect(result.errors).toEqual([]);
  });
});
