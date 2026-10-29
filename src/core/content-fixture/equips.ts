import type { EquipDef } from '../types';

// 冻结的测试饰品：数值只用于验证管线，不参与正式平衡。
export const EQUIPS: EquipDef[] = [
  {
    id: 'equip.test.watch',
    name: '旧怀表',
    slot: 'charm',
    description: '祖父留下的怀表。握在手里，时间好像能省下一点。',
    modifiers: [{ key: 'staminaCost', value: 0.9 }],
  },
  {
    id: 'equip.test.ribbon',
    name: '练习用丝带',
    slot: 'charm',
    description: '扎头发用的丝带，戴上也许多练得进去一点。',
    modifiers: [{ key: 'trainingExp', value: 1.2 }],
  },
];
