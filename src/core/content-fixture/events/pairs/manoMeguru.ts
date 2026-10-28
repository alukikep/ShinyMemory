import type { EventDef } from '../../../types';

/** 双人剧情（专属文案）：挂在「统一训练」之后。 */
const card: EventDef = {
  id: 'evt.pair_mano_meguru',
  title: '镜子前面',
  when: [
    { kind: 'castPresent', idolIds: ['mano', 'meguru'] },
  ],
  after: { ids: ['group_training'] },
  cast: ['mano', 'meguru'],
  chance: 0.6,
  weight: 3,
  pairCooldownActions: 20,
  text: '{b}对着镜子重新扎了一遍头发，{a}在旁边看着，没有说话。',
  choices: [
    {
      label: '等她们收拾好',
      effects: [{ kind: 'attributeExp', ref: 'trust', tier: 1 }],
      result: '{b}转过头来问了一句“这样可以吗”。{a}点了下头。',
    },
  ],
};

export default card;
