import type { StoryChainDef } from '../../types';

/**
 * にちかの招募链（偶遇型）。
 *
 * 依据：
 * - 相遇：唱片店后台，她谎称经理叫人来，求制作人看她的歌和舞 [102400101]。
 * - 屋顶大喊：她要在屋顶喊到有回声，好让姐姐也不能反悔（同一本的后半）。
 *
 * 两段戏、两个地点（playbook §4.6）：唱片店 → 事务所屋顶。
 */
export const nichikaEncounter: StoryChainDef = {
  id: 'nichika-encounter',
  kind: 'arc',
  lockScope: 'none',
  idolId: 'nichika',
  priority: 10,
  title: 'ごーうーかーくー',
  steps: [
    {
      id: 'nichika-shop-1',
      locationId: 'record_shop',
      timeWindow: { fromMinute: 13 * 60, toMinute: 18 * 60 },
      dialogueId: 'dialogue.nichika.first',
      actionLabel: '店员说经理在后场叫你',
      source: '102400101',
      complete: { status: 'known', nextStepDelayDays: 1 },
    },
    {
      id: 'nichika-roof-1',
      locationId: 'office_roof',
      timeWindow: { fromMinute: 16 * 60, toMinute: 19 * 60 },
      dialogueId: 'dialogue.nichika.second',
      actionLabel: '屋顶上有个人在喊',
      source: '102400101',
      complete: { status: 'recruited' },
    },
  ],
};

export default nichikaEncounter;
