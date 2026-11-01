import type { StoryChainDef } from '../../types';

/**
 * 甜花的招募链（偶遇型）。
 *
 * 依据：
 * - W.I.N.G. 第一篇：试镜。怕生、被吓到、"なーちゃん"、合格后先愣住 [101500101]。
 * - W.I.N.G. 第二篇：CD 手売り。她说自己没做好、靠了大家（三分支）[101500102]。
 *
 * 两段戏、两个地点（playbook §4.6）：事务所试镜 → 商业街的 CD 手売り。
 */
export const tenkaEncounter: StoryChainDef = {
  id: 'tenka-encounter',
  kind: 'arc',
  lockScope: 'none',
  idolId: 'tenka',
  priority: 10,
  title: 'なーちゃんのため',
  steps: [
    {
      id: 'tenka-audition',
      locationId: 'office',
      timeWindow: { fromMinute: 600, toMinute: 1080 },
      dialogueId: 'dialogue.tenka.first',
      actionLabel: '试镜室里很安静',
      source: '101500101',
      complete: { status: 'known', nextStepDelayDays: 2 },
    },
    {
      id: 'tenka-cd',
      locationId: 'shopping_street',
      timeWindow: { fromMinute: 720, toMinute: 1080 },
      dialogueId: 'dialogue.tenka.second',
      actionLabel: '街角的 CD 手売り',
      source: '101500102',
      complete: { status: 'recruited' },
    },
  ],
};

export default tenkaEncounter;
