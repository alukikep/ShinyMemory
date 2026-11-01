import type { StoryChainDef } from '../../types';

/**
 * 夏葉的招募链（档案型）。
 *
 * 依据：
 * - W.I.N.G. 第一篇：她通过书面审查进了事务所，制作人去练习室见她；
 *   她练完主动出来认人，第一句就是"目标只有顶点" [101300101]。
 * - W.I.N.G. 第二篇：第一次工作前的空档，她在原地练片足立ち（三分支）[101300102]。
 *
 * 两段戏、两个地点（playbook §4.6）：练习室 → 事务所。她已经在籍，所以第 1 步
 * 只把她拉进制作名单（known），第 2 步才算正式"接手"（recruited）。
 */
export const natsuhaEncounter: StoryChainDef = {
  id: 'natsuha-encounter',
  kind: 'arc',
  lockScope: 'none',
  idolId: 'natsuha',
  priority: 10,
  title: '世界一以外ありえない',
  steps: [
    {
      id: 'natsuha-studio-1',
      locationId: 'practice_room',
      timeWindow: { fromMinute: 900, toMinute: 1140 },
      dialogueId: 'dialogue.natsuha.first',
      actionLabel: '练习室里有人在喊拍子',
      source: '101300101',
      complete: { nextStepDelayDays: 1 },
    },
    {
      id: 'natsuha-office-1',
      locationId: 'office',
      timeWindow: { fromMinute: 900, toMinute: 1140 },
      dialogueId: 'dialogue.natsuha.second',
      actionLabel: '等工作的空档她在练平衡',
      source: '101300102',
      complete: { status: 'recruited' },
    },
  ],
};

export default natsuhaEncounter;
