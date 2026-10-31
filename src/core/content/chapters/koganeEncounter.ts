import type { StoryChainDef } from '../../types';

/**
 * 恋鐘的招募链（偶遇型）。
 *
 * 依据：
 * - WING 第一篇：她在事务所参加面试，方言和长崎口音一开口就漏出来 [100400101]。
 * - WING 第二篇：第一次工作（キャンペーンガール），她毫不紧张 [100400102]。
 * 招募链不占位（lockScope: 'none'）。
 */
export const koganeEncounter: StoryChainDef = {
  id: 'kogane-encounter',
  kind: 'arc',
  lockScope: 'none',
  idolId: 'kogane',
  priority: 10,
  title: '面试室里的长崎口音',
  steps: [
    {
      id: 'kogane-office-1',
      locationId: 'office',
      timeWindow: { fromMinute: 600, toMinute: 1020 },
      dialogueId: 'dialogue.kogane.first',
      actionLabel: '面试室里有人在报名字',
      source: '100400101',
      complete: { status: 'known', nextStepDelayDays: 2 },
    },
    {
      id: 'kogane-studio-1',
      locationId: 'studio',
      timeWindow: { fromMinute: 600, toMinute: 1080 },
      dialogueId: 'dialogue.kogane.second',
      actionLabel: '她第一天上班',
      source: '100400102',
      complete: { status: 'recruited' },
    },
  ],
};

export default koganeEncounter;
