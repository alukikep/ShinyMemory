import type { StoryChainDef } from '../../types';

/**
 * 透的招募链（偶遇型）。
 *
 * 依据：
 * - 相遇：公交站，她说"走路更快"，被搭话后拒绝，又回来还胶带 [102000101]。
 * - 签约：事务所，签完立刻要去上课（半句话收回去）[102000101]。
 *
 * 两段戏、两个地点（playbook §4.6）：站前 → 事务所。
 */
export const toruEncounter: StoryChainDef = {
  id: 'toru-encounter',
  kind: 'arc',
  lockScope: 'none',
  idolId: 'toru',
  priority: 10,
  title: '名刺だけもらっとく',
  steps: [
    {
      id: 'toru-busstop-1',
      locationId: 'station',
      timeWindow: { fromMinute: 16 * 60, toMinute: 19 * 60 },
      dialogueId: 'dialogue.toru.first',
      actionLabel: '站前，一个女生看着公交站牌',
      source: '102000101',
      complete: { status: 'known', nextStepDelayDays: 2 },
    },
    {
      id: 'toru-contract-1',
      locationId: 'office',
      timeWindow: { fromMinute: 17 * 60, toMinute: 21 * 60 },
      dialogueId: 'dialogue.toru.second',
      actionLabel: '契约书摊在事务所的桌上',
      source: '102000101',
      complete: { status: 'recruited' },
    },
  ],
};

export default toruEncounter;
