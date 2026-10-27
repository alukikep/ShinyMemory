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

export const meguruEncounter: StoryChainDef = {
  id: 'meguru-encounter',
  idolId: 'meguru',
  priority: 5,
  steps: [
    {
      id: 'meguru-street-1',
      locationId: 'shopping_street',
      timeWindow: { fromMinute: 600, toMinute: 1080 },
      dialogueId: 'dialogue.meguru.first',
      actionLabel: '和巡搭话',
      complete: {
        status: 'known',
        nextStepDelayDays: 2,
      },
    },
    {
      id: 'meguru-park-2',
      locationId: 'park',
      timeWindow: { fromMinute: 600, toMinute: 1080 },
      dialogueId: 'dialogue.meguru.second',
      actionLabel: '去公园找巡',
      complete: {
        status: 'recruited',
      },
    },
  ],
};

export const STORY_CHAINS = [hioriEncounter, meguruEncounter];
