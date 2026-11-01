import type { StoryChainDef } from '../../types';

/**
 * 果穂的招募链（偶遇型）。
 *
 * 依据：
 * - W.I.N.G. 第一篇：她在公园和附近的孩子玩，制作人误以为是高中生，递名片 [100900101]。
 * - W.I.N.G. 第一篇后半：第二天她自己跑来事务所，说查过偶像了，想试试 [100900101]。
 * - W.I.N.G. 第二篇：第一次上课前，她在办公室转、看はづき打字、聊英雄（三选项）[100900102]。
 * 招募链不占位（lockScope: 'none'）。
 *
 * 三段戏、三个时间点（2026-11 修订）：
 * 原文把"公园当天"和"第二天事务所"写成了一段，玩家会在一段没有换场的对话里被瞬移到
 * 另一个地点、另一个时间。现在拆成：
 *   第 1 天 公园 → 第 2 天 事务所（决定）→ 第 3 天 事务所（参观 + 上课前）
 * 规则见 playbook §4.6「一段对话 = 一个地点、一段连续时间」。
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
      complete: { status: 'known', nextStepDelayDays: 1 },
    },
    {
      id: 'kaho-office-1',
      locationId: 'office',
      timeWindow: { fromMinute: 600, toMinute: 1020 },
      dialogueId: 'dialogue.kaho.visit',
      actionLabel: '第二天她自己跑来事务所',
      source: '100900101',
      complete: { status: 'recruited', nextStepDelayDays: 1 },
    },
    {
      id: 'kaho-office-2',
      locationId: 'office',
      timeWindow: { fromMinute: 600, toMinute: 1020 },
      dialogueId: 'dialogue.kaho.second',
      actionLabel: '第一次上课前她坐不住',
      source: '100900102',
      complete: {},
    },
  ],
};

export default kahoEncounter;
