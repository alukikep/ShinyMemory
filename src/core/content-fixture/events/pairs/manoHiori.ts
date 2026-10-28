import type { EventDef } from '../../../types';

/**
 * 双人剧情切片（专用文案）。flag 门控，正常游玩不会触发。
 */
const card: EventDef = {
  id: 'evt.pair_mano_hiori',
  title: '两个人的午饭',
  when: [
    { kind: 'flag', key: 'test_pair_scenes', value: true },
    { kind: 'castPresent', idolIds: ['mano', 'hiori'] },
  ],
  cast: ['mano', 'hiori'],
  pairCooldownActions: 20,
  weight: 2,
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
