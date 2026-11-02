import type { StoryChainDef } from '../../types';

/**
 * 雛菜的招募链（偶遇型）。
 *
 * 依据：
 * - 相遇：面试。她说只想当"开心担当"，理由只有一个——透先辈要当偶像 [102300101]。
 * - 第一次去练习室看课：她在课上回头喊、要制作人"集中看雛菜"（三分支）[102300102]。
 *
 * 两段戏、两个地点（playbook §4.6）：事务所 → 练习室。
 */
export const hinanaEncounter: StoryChainDef = {
  id: 'hinana-encounter',
  kind: 'arc',
  lockScope: 'none',
  idolId: 'hinana',
  priority: 10,
  title: '楽しい担当',
  revealWhen: [{ kind: 'idolStatus', idolId: 'toru', status: 'recruited' }],
  steps: [
    {
      id: 'hinana-interview-1',
      locationId: 'office',
      timeWindow: { fromMinute: 14 * 60, toMinute: 18 * 60 },
      dialogueId: 'dialogue.hinana.first',
      actionLabel: '面试室的门被很响地推开',
      source: '102300101',
      when: [{ kind: 'idolStatus', idolId: 'toru', status: 'recruited' }],
      complete: { status: 'known', nextStepDelayDays: 2 },
    },
    {
      id: 'hinana-lesson-1',
      locationId: 'practice_room',
      timeWindow: { fromMinute: 16 * 60 + 30, toMinute: 20 * 60 + 30 },
      dialogueId: 'dialogue.hinana.second',
      actionLabel: '第一次去看她的课',
      source: '102300102',
      when: [{ kind: 'idolStatus', idolId: 'toru', status: 'recruited' }],
      complete: { status: 'recruited' },
    },
  ],
};

export default hinanaEncounter;
