import type { StoryChainDef } from '../../types';

/**
 * あさひ的招募链（偶遇型）。
 *
 * 依据：
 * - 相遇：街边大屏前，她把广告里的舞看一遍就跳了；被挖时只问"偶像做什么" [101700101]。
 * - 第一次课：她提前到、自己先跳，制作人叫都听不见（三分支）[101700102]。
 *
 * 两段戏、两个地点（playbook §4.6）：商业街 → 练习室。
 */
export const asahiEncounter: StoryChainDef = {
  id: 'asahi-encounter',
  kind: 'arc',
  lockScope: 'none',
  idolId: 'asahi',
  priority: 10,
  title: '見たまま、踊る',
  steps: [
    {
      id: 'asahi-street-1',
      locationId: 'shopping_street',
      timeWindow: { fromMinute: 720, toMinute: 1080 },
      dialogueId: 'dialogue.asahi.first',
      actionLabel: '大屏下面有人在跳',
      source: '101700101',
      complete: { status: 'known', nextStepDelayDays: 2 },
    },
    {
      id: 'asahi-lesson-1',
      locationId: 'practice_room',
      timeWindow: { fromMinute: 840, toMinute: 1140 },
      dialogueId: 'dialogue.asahi.second',
      actionLabel: '她比上课时间早到了一个多小时',
      source: '101700102',
      complete: { status: 'recruited' },
    },
  ],
};

export default asahiEncounter;
