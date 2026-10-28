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

/**
 * P0 切片：说完“还不够”之后的两天。
 *
 * 事件见 events/mano/quarrel.ts。链条从社长那里拿到建议，
 * 在商业街买花，等两天后去公园找她。
 */
export const manoRift: StoryChainDef = {
  id: 'mano-rift',
  idolId: 'mano',
  priority: 20,
  title: '话说重了',
  revealWhen: [{ kind: 'flag', key: 'mano_rift' }],
  steps: [
    {
      id: 'rift-office',
      locationId: 'office',
      timeWindow: { fromMinute: 600, toMinute: 1080 },
      dialogueId: 'dialogue.rift.office',
      actionLabel: '和社长商量',
      when: [{ kind: 'flag', key: 'mano_rift' }],
      effects: [{ kind: 'flag', key: 'mano_rift_advice', value: true }],
    },
    {
      id: 'rift-shop',
      locationId: 'shopping_street',
      timeWindow: { fromMinute: 600, toMinute: 1080 },
      dialogueId: 'dialogue.rift.shop',
      actionLabel: '挑一束花',
      when: [{ kind: 'flag', key: 'mano_rift_advice' }],
      effects: [
        {
          kind: 'scheduleOverride',
          actorId: 'mano',
          id: 'mano-rift-park',
          dayOffset: 2,
          locationId: 'park',
          fromMinute: 600,
          toMinute: 1080,
          label: '一个人在公园',
        },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'rift-park',
      locationId: 'park',
      timeWindow: { fromMinute: 600, toMinute: 1080 },
      dialogueId: 'dialogue.rift.park',
      actionLabel: '去公园',
      when: [{ kind: 'castPresent', idolIds: ['mano'] }],
      effects: [
        { kind: 'flag', key: 'mano_rift', value: false },
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
      ],
    },
  ],
};

export const STORY_CHAINS = [manoEncounter, manoRift];
