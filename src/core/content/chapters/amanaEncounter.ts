import type { StoryChainDef } from '../../types';

/**
 * 甘奈的招募链（偶遇型）。
 *
 * 依据：
 * - W.I.N.G. 第一篇：试镜。辣妹打扮的理由、想和甜花一起当偶像、被提醒后自己收住 [101400101]。
 * - W.I.N.G. 第二篇：新人联合 live，她上台前不紧张、下台后问"甘奈能当好偶像吗"（三分支）[101400102]。
 *
 * 两段戏、两个地点（playbook §4.6）：事务所试镜 → 录音棚的新人 live。
 */
export const amanaEncounter: StoryChainDef = {
  id: 'amana-encounter',
  kind: 'arc',
  lockScope: 'none',
  idolId: 'amana',
  priority: 10,
  title: '今天しかできないこと',
  steps: [
    {
      id: 'amana-audition',
      locationId: 'office',
      timeWindow: { fromMinute: 600, toMinute: 1080 },
      dialogueId: 'dialogue.amana.first',
      actionLabel: '叫到下一个试镜的人',
      source: '101400101',
      complete: { status: 'known', nextStepDelayDays: 2 },
    },
    {
      id: 'amana-live',
      locationId: 'studio',
      timeWindow: { fromMinute: 780, toMinute: 1140 },
      dialogueId: 'dialogue.amana.second',
      actionLabel: '新人联合 live 的后台',
      source: '101400102',
      complete: { status: 'recruited' },
    },
  ],
};

export default amanaEncounter;
