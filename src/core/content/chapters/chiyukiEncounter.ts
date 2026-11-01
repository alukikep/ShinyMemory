import type { StoryChainDef } from '../../types';

/**
 * 千雪的招募链（偶遇型）。
 *
 * 依据：
 * - W.I.N.G. 第一篇前半：街上被叫住，替他缝快掉的袖扣，被邀请后说要考虑 [101600101]。
 * - W.I.N.G. 第一篇后半：几天后她来事务所，说"想试试" [101600101]。
 * - W.I.N.G. 第二篇：第一次工作，去活动挨拶（三分支）[101600102]。
 *
 * 三段戏、三个地点（playbook §4.6）：商店街 → 事务所 → 录音棚。
 */
export const chiyukiEncounter: StoryChainDef = {
  id: 'chiyuki-encounter',
  kind: 'arc',
  lockScope: 'none',
  idolId: 'chiyuki',
  priority: 10,
  title: '落ちそうなボタン',
  steps: [
    {
      id: 'chiyuki-street-1',
      locationId: 'shopping_street',
      timeWindow: { fromMinute: 720, toMinute: 1080 },
      dialogueId: 'dialogue.chiyuki.first',
      actionLabel: '有人叫住了你',
      source: '101600101',
      complete: { status: 'known', nextStepDelayDays: 2 },
    },
    {
      id: 'chiyuki-office-1',
      locationId: 'office',
      timeWindow: { fromMinute: 600, toMinute: 1080 },
      dialogueId: 'dialogue.chiyuki.second',
      actionLabel: '她来给出答复',
      source: '101600101',
      complete: { status: 'recruited', nextStepDelayDays: 2 },
    },
    {
      id: 'chiyuki-greet',
      locationId: 'studio',
      timeWindow: { fromMinute: 780, toMinute: 1140 },
      dialogueId: 'dialogue.chiyuki.greet',
      actionLabel: '第一次工作，挨拶まわり',
      source: '101600102',
      complete: {},
    },
  ],
};

export default chiyukiEncounter;
