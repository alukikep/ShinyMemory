import type { StoryChainDef } from '../../types';

/**
 * 霧子的招募链（偶遇型）。
 *
 * 依据：
 * - WING 第一篇：她通过试镜后第一天来事务所，在会客室缠绷带 [100800101]。
 * - WING 第二篇：第二天清晨她一个人在练习室擦地板 [100800102]。
 * 招募链不占位（lockScope: 'none'）。
 */
export const kirikoEncounter: StoryChainDef = {
  id: 'kiriko-encounter',
  kind: 'arc',
  lockScope: 'none',
  idolId: 'kiriko',
  priority: 10,
  title: '会客室里的她',
  steps: [
    {
      id: 'kiriko-office-1',
      locationId: 'office',
      timeWindow: { fromMinute: 600, toMinute: 1080 },
      dialogueId: 'dialogue.kiriko.first',
      actionLabel: '会客室里有人在缠绷带',
      source: '100800101',
      complete: { status: 'known', nextStepDelayDays: 2 },
    },
    {
      id: 'kiriko-practice-1',
      locationId: 'practice_room',
      timeWindow: { fromMinute: 480, toMinute: 660 },
      dialogueId: 'dialogue.kiriko.second',
      actionLabel: '她一个人在练习室擦地',
      source: '100800102',
      complete: { status: 'recruited' },
    },
  ],
};

export default kirikoEncounter;
