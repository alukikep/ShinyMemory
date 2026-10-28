import type { EventDef } from '../../../types';

/**
 * 双人剧情（泛化模板）：从在场偶像里随机挑两人。
 * 同一对重复触发由组合冷却压制。
 */
const card: EventDef = {
  id: 'evt.pair_generic_rest',
  title: '两个人的休息室',
  when: [],
  after: { ids: ['group_training'] },
  castSize: 2,
  chance: 0.5,
  weight: 1,
  pairCooldownActions: 20,
  text: '{a}和{b}在休息室里待了一会儿，谁都没有先开口。',
  choices: [
    {
      label: '继续',
      effects: [],
      result: '空气不算尴尬，只是很安静。{a}先站了起来。',
    },
  ],
};

export default card;
