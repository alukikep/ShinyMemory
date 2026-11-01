import type { StoryChainDef } from '../../types';

/**
 * 果穂的招募链（偶遇型）。
 *
 * 依据：
 * - W.I.N.G. 第一篇：她在公园和附近的孩子玩，制作人误以为是高中生 [100900101]。
 * - W.I.N.G. 第二篇：第二天她自己跑到事务所，说查过偶像了 [100900102]。
 * 招募链不占位（lockScope: 'none'）。
 *
 * TODO（2026-11 记录，待修）：`dialogue.kaho.first` 把两天的戏写成了一段——
 * node 01–22 在公园（当天），node 23 起已经是"第二天她来事务所"，而这一步挂在公园。
 * 再加上她在这段尾巴上就把"想当偶像"说完了，第 2 步却还在演第一次参观。
 * 修法：在 node 23 处拆成 `dialogue.kaho.visit`（事务所 / 第二天），链改成
 * 公园(known) → 事务所(recruited)；`100900102` 并进第 2 步或单独做第 3 步。
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
