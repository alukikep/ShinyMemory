import type { StoryChainDef } from '../../types';

/**
 * 冬優子的招募链（偶遇型）。
 *
 * 依据：
 * - 相遇：站前盯着海报，被搭话后用营业式的"可爱的ふゆ"应答 [101800101]。
 * - 第一次拍摄：现场对 staff 全是笑脸，转头对制作人就换成毒舌 [101800102]。
 *
 * 两段戏、两个地点（playbook §4.6）：车站附近 → 录音棚。
 */
export const fuyukoEncounter: StoryChainDef = {
  id: 'fuyuko-encounter',
  kind: 'arc',
  lockScope: 'none',
  idolId: 'fuyuko',
  priority: 10,
  title: 'ふゆって呼んでください',
  steps: [
    {
      id: 'fuyuko-street-1',
      locationId: 'station',
      timeWindow: { fromMinute: 720, toMinute: 1080 },
      dialogueId: 'dialogue.fuyuko.first',
      actionLabel: '站前有人盯着海报',
      source: '101800101',
      complete: { status: 'known', nextStepDelayDays: 2 },
    },
    {
      id: 'fuyuko-shoot-1',
      locationId: 'studio',
      timeWindow: { fromMinute: 780, toMinute: 1140 },
      dialogueId: 'dialogue.fuyuko.second',
      actionLabel: '她第一次拍摄，笑得很标准',
      source: '101800102',
      complete: { status: 'recruited' },
    },
  ],
};

export default fuyukoEncounter;
