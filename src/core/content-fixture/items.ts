import type { ItemDef, ShopDef } from '../types';

export const ITEMS: ItemDef[] = [
  {
    id: 'gift.flower',
    name: '花束',
    description: '用浅色包装纸扎好的小花束，适合在见面时递过去。',
    category: 'gift',
    price: 500,
    icon: 'sparkle',
    shopId: 'shopping_street_gift',
    maxPurchases: 3,
    gift: {
      defaultTrustTier: 1,
      preferences: [
        {
          idolId: 'mano',
          trustTier: 3,
          reaction: '真乃把花抱在怀里，低头闻了很久。',
        },
        {
          idolId: 'hiori',
          trustTier: 1,
          reaction: '灯织接过花，认真地说了声谢谢。',
        },
      ],
    },
  },
  {
    id: 'gift.hairclip',
    name: '发饰',
    description: '一枚小小的银色发饰，在灯下会闪一下。',
    category: 'gift',
    price: 800,
    icon: 'star',
    shopId: 'shopping_street_gift',
    maxPurchases: 1,
    gift: {
      defaultTrustTier: 1,
      preferences: [
        {
          idolId: 'mano',
          trustTier: 1,
          reaction: '真乃把发饰别在头发上，对着橱窗照了照。',
        },
        {
          idolId: 'hiori',
          trustTier: 3,
          reaction: '灯织捏着发饰看了很久，最后小心地收进了口袋。',
        },
      ],
    },
  },
  {
    id: 'gift.letter',
    name: '信纸',
    description: '一张带细纹的信纸，可以写些不适合当面说的话。',
    category: 'gift',
    price: 200,
    icon: 'book',
    shopId: 'shopping_street_gift',
    maxPurchases: 3,
    gift: {
      defaultTrustTier: 1,
      preferences: [
        {
          idolId: 'mano',
          trustTier: 1,
          reaction: '真乃把信纸贴在胸口，笑得有点不好意思。',
        },
        {
          idolId: 'hiori',
          trustTier: 3,
          reaction: '灯织把信纸折好，夹进了随身带着的笔记本。',
        },
      ],
    },
  },
  {
    id: 'keepsake.photo',
    name: '演唱会照片',
    description: '一张从街角照相馆买到的照片，边角有点翘。',
    category: 'keepsake',
    price: 300,
    icon: 'star',
    shopId: 'shopping_street_gift',
    maxPurchases: 1,
  },
];

export const SHOPS: ShopDef[] = [
  {
    id: 'shopping_street_gift',
    name: '街角礼品店',
    description: '卖些小礼物和旧照片的店，店主不太打扰客人。',
    locationId: 'shopping_street',
    itemIds: ITEMS.filter((item) => item.shopId === 'shopping_street_gift').map(
      (item) => item.id,
    ),
  },
];
