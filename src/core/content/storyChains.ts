import type { StoryChainDef } from '../types';

export const manoEncounter: StoryChainDef = {
  id: 'mano-encounter',
  idolId: 'mano',
  priority: 10,
  title: '公园的歌声',
  steps: [
    {
      id: 'mano-park-1',
      locationId: 'park',
      timeWindow: { fromMinute: 600, toMinute: 1080 },
      dialogueId: 'dialogue.mano.first',
      actionLabel: '循着歌声',
      complete: {
        status: 'known',
        nextStepDelayDays: 2,
      },
    },
    {
      id: 'mano-park-2',
      locationId: 'park',
      timeWindow: { fromMinute: 600, toMinute: 1080 },
      dialogueId: 'dialogue.mano.second',
      actionLabel: '再次听见歌声',
      complete: {
        status: 'recruited',
      },
    },
  ],
};

export const STORY_CHAINS = [manoEncounter];
