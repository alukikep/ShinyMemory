import type { ItemDef } from '../types';

/**
 * 信赖 A 级剧情的统一奖励。
 *
 * 28 个偶像共用这一种道具：剧情完成后自动进背包，
 * 使用后把 `stamina.trustBonus` 永久 +2。
 */
export const TRUST_TOKEN: ItemDef = {
  id: 'item.trust_token',
  name: '信赖的证明',
  description:
    '某位偶像在信赖达到 A 时送给你的纪念。使用后体力上限永久 +2。',
  category: 'consumable',
  price: 0,
  icon: 'star',
  useEffects: [
    { kind: 'var', key: 'stamina.trustBonus', op: 'add', value: 2 },
  ],
};
