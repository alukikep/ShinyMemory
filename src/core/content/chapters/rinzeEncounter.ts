import type { StoryChainDef } from '../../types';

/**
 * 凛世的招募链（偶遇型）。
 *
 * 依据：
 * - W.I.N.G. 第一篇前半：路边木屐鼻绪断了，制作人用手帕临时修好，递名片 [101200101]。
 * - W.I.N.G. 第一篇后半：几天后她来事务所还手帕，说"心已决" [101200101]。
 * - W.I.N.G. 第二篇：第一次课后，练习室（三分支）[101200102]。
 *
 * 三段戏、三个时间点（playbook §4.6）：
 *   第 1 天 商店街 → 第 3 天 事务所（答"一生跟随"）→ 第 5 天 练习室（课后告白式的话）
 * 原文里"几天后她来"是隔了一段时间，所以第 2 步比第 1 步晚 2 天。
 */
export const rinzeEncounter: StoryChainDef = {
  id: 'rinze-encounter',
  kind: 'arc',
  lockScope: 'none',
  idolId: 'rinze',
  priority: 10,
  title: '断了的鼻绪',
  steps: [
    {
      id: 'rinze-street-1',
      locationId: 'shopping_street',
      timeWindow: { fromMinute: 720, toMinute: 1080 },
      dialogueId: 'dialogue.rinze.first',
      actionLabel: '路边有人蹲着看木屐',
      source: '101200101',
      complete: { status: 'known', nextStepDelayDays: 2 },
    },
    {
      id: 'rinze-office-1',
      locationId: 'office',
      timeWindow: { fromMinute: 600, toMinute: 1080 },
      dialogueId: 'dialogue.rinze.visit',
      actionLabel: '她来还手帕',
      source: '101200101',
      complete: { status: 'recruited', nextStepDelayDays: 2 },
    },
    {
      id: 'rinze-practice-1',
      locationId: 'practice_room',
      timeWindow: { fromMinute: 900, toMinute: 1140 },
      dialogueId: 'dialogue.rinze.second',
      actionLabel: '课后的练习室',
      source: '101200102',
      complete: {},
    },
  ],
};

export default rinzeEncounter;
