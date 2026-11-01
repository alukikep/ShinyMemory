import type { StoryChainDef } from '../../types';

/**
 * 樹里的招募链（偶遇型）。
 *
 * 依据：
 * - W.I.N.G. 第一篇：街头搭话，她以为是在说她头发；最后报名字、下战书 [101100101]。
 * - W.I.N.G. 第二篇：第一次工作是宣材写真，她担心自己没有偶像那种笑 [101100102]。
 * 招募链不占位（lockScope: 'none'）。
 */
export const juriEncounter: StoryChainDef = {
  id: 'juri-encounter',
  kind: 'arc',
  lockScope: 'none',
  idolId: 'juri',
  priority: 10,
  title: '街上的金发',
  steps: [
    {
      id: 'juri-street-1',
      locationId: 'shopping_street',
      timeWindow: { fromMinute: 720, toMinute: 1080 },
      dialogueId: 'dialogue.juri.first',
      actionLabel: '街上有个金发的女孩子',
      source: '101100101',
      complete: { status: 'known', nextStepDelayDays: 2 },
    },
    {
      id: 'juri-studio-1',
      locationId: 'studio',
      timeWindow: { fromMinute: 600, toMinute: 1080 },
      dialogueId: 'dialogue.juri.second',
      actionLabel: '她在等宣材写真的拍摄',
      source: '101100102',
      complete: { status: 'recruited' },
    },
  ],
};

export default juriEncounter;
