import type { ActivityDef } from '../../types';

// 测试用：一次行动同时发放饰品和一个额外槽位，用于验证装备管线。
const card: ActivityDef = {
  id: 'test_old_drawer',
  name: '整理旧物',
  description: '把练习室抽屉里的东西翻一遍。',
  kind: 'explore',
  locations: ['practice_room'],
  durationMinutes: 30,
  timeWindows: [{ fromMinute: 8 * 60, toMinute: 22 * 60 }],
  cost: { stamina: 2 },
  effects: [
    { kind: 'grantEquip', equipId: 'equip.test.watch' },
    { kind: 'unlockSlot', slot: 'charm' },
  ],
  resultTexts: ['你在抽屉最里面翻出一块旧怀表，旁边还多出一格空位。'],
};

export default card;
