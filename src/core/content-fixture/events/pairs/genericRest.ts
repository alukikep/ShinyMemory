import type { EventDef } from '../../../types';

/**
 * 双人剧情切片（泛化模板）：从在场偶像里随机挑两人。
 * 同一对重复触发由组合冷却压制。
 */
const card: EventDef = {
  id: 'evt.pair_generic_rest',
  title: '两个人的休息室',
  when: [{ kind: 'flag', key: 'test_pair_scenes', value: true }],
  castSize: 2,
  pairCooldownActions: 20,
  weight: 1,
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
