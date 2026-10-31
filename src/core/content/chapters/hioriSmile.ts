import type { StoryChainDef } from '../../types';

/**
 * 灯织的卡面第一章（剧本 200200401）。
 *
 * 一章 = 一段 commu = 1 步；本段无分支。
 * 状态：待接入——对话在审查台待审。
 */
const hioriSmile: StoryChainDef = {
  id: 'hiori-smile',
  idolId: 'hiori',
  title: '君のことを教えてほしい',
  kind: 'card',
  priority: 5,
  workPolicy: 'open',
  revealWhen: [
    { kind: 'idolStatus', idolId: 'hiori', status: 'recruited' },
  ],
  steps: [
    {
      id: 'hiori-smile-1',
      locationId: 'station',
      timeWindow: { fromMinute: 9 * 60, toMinute: 15 * 60 },
      dialogueId: 'dialogue.hiori.smile',
      actionLabel: '去面试会场的路上',
      when: [
        { kind: 'idolStatus', idolId: 'hiori', status: 'recruited' },
        { kind: 'dayAtLeast', day: 3 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.hiori.smile', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
  ],
};

export default hioriSmile;
