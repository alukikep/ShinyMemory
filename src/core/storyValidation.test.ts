import { describe, expect, it } from 'vitest';
import { CONTENT_INDEX } from './contentIndex';
import { validateStoryContent } from './storyValidation';
import type { DialogueDef, StoryChainDef } from './types';

function validate(
  dialogues: Map<string, DialogueDef>,
  chains: Map<string, StoryChainDef>,
) {
  return validateStoryContent({
    dialogues,
    chains,
    idols: CONTENT_INDEX.idols,
    locations: CONTENT_INDEX.locations,
  });
}

describe('story content validation', () => {
  it('accepts the current Hiori content', () => {
    expect(
      validate(CONTENT_INDEX.dialogues, CONTENT_INDEX.storyChains).errors,
    ).toEqual([]);
  });

  it('rejects missing node references, unreachable nodes, and no terminal', () => {
    const dialogue: DialogueDef = {
      id: 'dialogue.test.bad',
      idolId: 'hiori',
      startNodeId: 'n1',
      nodes: {
        n1: {
          id: 'n1',
          text: 'start',
          choices: [{ label: 'go', nextNodeId: 'missing' }],
        },
        orphan: { id: 'orphan', text: 'orphan', nextNodeId: 'n1' },
      },
    };
    const result = validate(new Map([[dialogue.id, dialogue]]), new Map());
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('missing'))).toBe(true);
    expect(result.errors.some((error) => error.includes('不可达'))).toBe(true);
    expect(result.errors.some((error) => error.includes('terminal'))).toBe(true);
  });

  it('rejects invalid story step references', () => {
    const chain: StoryChainDef = {
      id: 'chain.test.bad',
      idolId: 'missing',
      steps: [
        {
          id: 'step-1',
          locationId: 'missing-place',
          dialogueId: 'missing-dialogue',
          actionLabel: 'test',
        },
      ],
    };
    const result = validate(
      CONTENT_INDEX.dialogues,
      new Map([[chain.id, chain]]),
    );
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('偶像不存在'))).toBe(true);
    expect(result.errors.some((error) => error.includes('地点不存在'))).toBe(true);
    expect(result.errors.some((error) => error.includes('对话不存在'))).toBe(true);
  });
});
