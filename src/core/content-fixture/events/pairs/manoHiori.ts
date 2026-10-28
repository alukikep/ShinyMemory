import type { EventDef } from '../../../types';

/** 双人剧情（专属文案）：挂在「统一训练」之后。 */
const card: EventDef = {
  id: 'evt.pair_mano_hiori',
  title: '两个人的午饭',
  when: [
    { kind: 'castPresent', idolIds: ['mano', 'hiori'] },
  ],
  after: { ids: ['group_training'] },
  cast: ['mano', 'hiori'],
  chance: 0.6,
  weight: 3,
  pairCooldownActions: 20,
  text: '{a}把便当盒推到中间，{b}没有客气，先夹了一块。',
  choices: [
    {
      label: '看着她们吃',
      effects: [{ kind: 'attributeExp', ref: 'trust', tier: 1 }],
      result: '{a}把最后一块留给了{b}，{b}说了一句“下次我来买”。',
    },
  ],
};

export default card;
