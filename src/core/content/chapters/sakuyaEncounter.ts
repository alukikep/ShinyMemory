import type { StoryChainDef } from '../../types';

/**
 * 咲耶的招募链（偶遇型）。
 *
 * 依据：
 * - W.I.N.G. 第一篇：街头杂志拍摄刚收工，制作人被她的站姿吸住，
 *   她主动开口「私に何か用かな？」并接受招募 [100600101]。
 * - W.I.N.G. 第二篇：第一份工作是唇膏广告，她第一次拍广告，先问制作人的意见 [100600102]。
 * 招募链不占位（lockScope: 'none'）。
 */
export const sakuyaEncounter: StoryChainDef = {
  id: 'sakuya-encounter',
  kind: 'arc',
  lockScope: 'none',
  idolId: 'sakuya',
  priority: 10,
  title: '街边的拍摄现场',
  steps: [
    {
      id: 'sakuya-street-1',
      locationId: 'shopping_street',
      timeWindow: { fromMinute: 720, toMinute: 1080 },
      dialogueId: 'dialogue.sakuya.first',
      actionLabel: '街边有人在拍杂志',
      source: '100600101',
      complete: { status: 'known', nextStepDelayDays: 2 },
    },
    {
      id: 'sakuya-studio-1',
      locationId: 'studio',
      timeWindow: { fromMinute: 900, toMinute: 1080 },
      dialogueId: 'dialogue.sakuya.second',
      actionLabel: '她在准备第一支广告',
      source: '100600102',
      complete: { status: 'recruited' },
    },
  ],
};

export default sakuyaEncounter;
