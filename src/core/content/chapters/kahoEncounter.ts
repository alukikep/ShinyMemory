import type { StoryChainDef } from '../../types';

/**
 * 果穂的招募链（偶遇型）。
 *
 * 依据：
 * - W.I.N.G. 第一篇：她在公园和附近的孩子玩，制作人误以为是高中生 [100900101]。
 * - W.I.N.G. 第二篇：第二天她自己跑到事务所，说查过偶像了 [100900102]。
 * 招募链不占位（lockScope: 'none'）。
 */
export const kahoEncounter: StoryChainDef = {
  id: 'kaho-encounter',
  kind: 'arc',
  lockScope: 'none',
  idolId: 'kaho',
  priority: 10,
  title: '公园里的英雄',
  steps: [
    {
      id: 'kaho-park-1',
      locationId: 'park',
      timeWindow: { fromMinute: 840, toMinute: 1080 },
      dialogueId: 'dialogue.kaho.first',
      actionLabel: '公园里有孩子在玩抓人',
      source: '100900101',
      complete: { status: 'known', nextStepDelayDays: 2 },
    },
    {
      id: 'kaho-office-1',
      locationId: 'office',
      timeWindow: { fromMinute: 600, toMinute: 1020 },
      dialogueId: 'dialogue.kaho.second',
      actionLabel: '她自己跑来事务所',
      source: '100900102',
      complete: { status: 'recruited' },
    },
  ],
};

export default kahoEncounter;
