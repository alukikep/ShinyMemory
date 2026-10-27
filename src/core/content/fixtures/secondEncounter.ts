import type { DialogueDef, StoryChainDef } from '../../types';

// Test-only fixture. Never import this from the production content index.
export const FIXTURE_DIALOGUE: DialogueDef = {
  id: 'dialogue.fixture.second',
  idolId: 'fixture-idol',
  startNodeId: 'n1',
  nodes: {
    n1: { id: 'n1', text: 'fixture start', nextNodeId: 'n2' },
    n2: {
      id: 'n2',
      text: 'fixture choice',
      choices: [
        { label: 'continue', nextNodeId: 'n3' },
        { label: 'also continue', nextNodeId: 'n3' },
      ],
    },
    n3: { id: 'n3', text: 'fixture end' },
  },
};

export const FIXTURE_CHAIN: StoryChainDef = {
  id: 'fixture-second-encounter',
  idolId: 'fixture-idol',
  priority: 10,
  steps: [
    {
      id: 'fixture-step-1',
      locationId: 'park',
      timeWindow: { fromMinute: 600, toMinute: 1080 },
      dialogueId: FIXTURE_DIALOGUE.id,
      actionLabel: 'fixture encounter',
      complete: { status: 'known' },
    },
  ],
};
