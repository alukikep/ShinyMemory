import type { StoryChainDef } from '../../types';

/**
 * 美琴的招募链（偶遇型）。
 *
 * 依据：
 * - 相遇：她自己到事务所，第一句问的是"测试怎么做" [102500101]。
 * - 测试：练习室，她说出「……死ぬほど」（同一本的后半）。
 *
 * 两段戏、两个地点（playbook §4.6）：事务所 → 练习室。
 */
export const mikotoEncounter: StoryChainDef = {
  id: 'mikoto-encounter',
  kind: 'arc',
  lockScope: 'none',
  idolId: 'mikoto',
  priority: 10,
  title: 'テストを受けに来た',
  steps: [
    {
      id: 'mikoto-office-1',
      locationId: 'office',
      timeWindow: { fromMinute: 13 * 60, toMinute: 17 * 60 },
      dialogueId: 'dialogue.mikoto.first',
      actionLabel: '事务所里有个没见过的女人',
      source: '102500101',
      complete: { status: 'known', nextStepDelayDays: 1 },
    },
    {
      id: 'mikoto-audition-1',
      locationId: 'practice_room',
      timeWindow: { fromMinute: 15 * 60, toMinute: 19 * 60 },
      dialogueId: 'dialogue.mikoto.second',
      actionLabel: '她说想看测试',
      source: '102500101',
      complete: { status: 'recruited' },
    },
  ],
};

export default mikotoEncounter;
