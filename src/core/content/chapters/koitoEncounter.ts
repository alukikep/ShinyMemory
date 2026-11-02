import type { StoryChainDef } from '../../types';

/**
 * 小糸的招募链（偶遇型）。
 *
 * 依据：
 * - 相遇：面试。她说不出"想成为什么样的偶像"，于是有了第一个课题 [102200101]。
 * - 交文件：父母并不知情，她要自己去确认（三分支）[102200102]。
 *
 * 两段戏、一个地点（playbook §4.6）：事务所——面试与文件是两次不同的工作日。
 */
export const koitoEncounter: StoryChainDef = {
  id: 'koito-encounter',
  kind: 'arc',
  lockScope: 'none',
  idolId: 'koito',
  priority: 10,
  title: '最初の課題',
  revealWhen: [{ kind: 'idolStatus', idolId: 'toru', status: 'recruited' }],
  steps: [
    {
      id: 'koito-interview-1',
      locationId: 'office',
      timeWindow: { fromMinute: 14 * 60, toMinute: 18 * 60 },
      dialogueId: 'dialogue.koito.first',
      actionLabel: '面试室的椅子上坐得笔直',
      source: '102200101',
      when: [{ kind: 'idolStatus', idolId: 'toru', status: 'recruited' }],
      complete: { status: 'known', nextStepDelayDays: 2 },
    },
    {
      id: 'koito-papers-1',
      locationId: 'office',
      timeWindow: { fromMinute: 15 * 60, toMinute: 19 * 60 },
      dialogueId: 'dialogue.koito.second',
      actionLabel: '她抱着一叠文件站在门口',
      source: '102200102',
      when: [{ kind: 'idolStatus', idolId: 'toru', status: 'recruited' }],
      complete: { status: 'recruited' },
    },
  ],
};

export default koitoEncounter;
