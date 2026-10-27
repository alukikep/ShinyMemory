import type { StoryChainDef } from '../types';

export const hioriEncounter: StoryChainDef = {
  id: 'hiori-encounter',
  idolId: 'hiori',
  steps: [
    {
      id: 'hiori-park-1',
      locationId: 'park',
      timeWindow: { fromMinute: 600, toMinute: 1080 },
      dialogueId: 'dialogue.hiori.first',
      actionLabel: '在长椅旁停下',
      complete: {
        status: 'known',
        nextStepDelayDays: 2,
      },
    },
    {
      id: 'hiori-park-2',
      locationId: 'park',
      timeWindow: { fromMinute: 600, toMinute: 1080 },
      dialogueId: 'dialogue.hiori.second',
      actionLabel: '去公园看看',
      complete: {
        status: 'recruited',
      },
    },
  ],
};

export const STORY_CHAINS = [hioriEncounter];
