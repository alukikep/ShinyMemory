import type { StoryChainDef } from '../../types';

/**
 * 愛依的招募链（偶遇型）。
 *
 * 依据：
 * - 相遇：街上撞到人，自来熟、报名字 [101900101]。
 * - 第一次上课：练习室，制作人按她"什么都不知道"排了基础课（三分支）[101900102]。
 *
 * 两段戏、两个地点（playbook §4.6）：商业街 → 练习室。
 */
export const meiEncounter: StoryChainDef = {
  id: 'mei-encounter',
  kind: 'arc',
  lockScope: 'none',
  idolId: 'mei',
  priority: 10,
  title: 'うち、和泉愛依～',
  steps: [
    {
      id: 'mei-street-1',
      locationId: 'shopping_street',
      timeWindow: { fromMinute: 720, toMinute: 1080 },
      dialogueId: 'dialogue.mei.first',
      actionLabel: '有人撞到了你，然后笑了',
      source: '101900101',
      complete: { status: 'known', nextStepDelayDays: 2 },
    },
    {
      id: 'mei-lesson-1',
      locationId: 'practice_room',
      timeWindow: { fromMinute: 840, toMinute: 1140 },
      dialogueId: 'dialogue.mei.second',
      actionLabel: '第一次基础课',
      source: '101900102',
      complete: { status: 'recruited' },
    },
  ],
};

export default meiEncounter;
