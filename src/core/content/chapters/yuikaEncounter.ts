import type { StoryChainDef } from '../../types';

/**
 * 結華的招募链（偶遇型）。
 *
 * 依据：
 * - W.I.N.G. 第一篇：雨天在街角躲雨，她抱着一包周边，制作人捡到她掉的限定徽章 [100700101]。
 * - W.I.N.G. 第二篇：第一份工作是广播，她进棚前还在追星 [100700102]。
 * 招募链不占位（lockScope: 'none'）。
 */
export const yuikaEncounter: StoryChainDef = {
  id: 'yuika-encounter',
  kind: 'arc',
  lockScope: 'none',
  idolId: 'yuika',
  priority: 10,
  title: '雨里的那条街',
  steps: [
    {
      id: 'yuika-street-1',
      locationId: 'shopping_street',
      timeWindow: { fromMinute: 900, toMinute: 1140 },
      dialogueId: 'dialogue.yuika.first',
      actionLabel: '雨里有人抱着周边躲雨',
      source: '100700101',
      complete: { status: 'known', nextStepDelayDays: 2 },
    },
    {
      id: 'yuika-studio-1',
      locationId: 'studio',
      timeWindow: { fromMinute: 1080, toMinute: 1260 },
      dialogueId: 'dialogue.yuika.second',
      actionLabel: '她第一次进录音间',
      source: '100700102',
      complete: { status: 'recruited' },
    },
  ],
};

export default yuikaEncounter;
