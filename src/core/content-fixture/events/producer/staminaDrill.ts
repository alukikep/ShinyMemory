import type { EventDef } from '../../../types';

/**
 * 测试用事件：只用于验证制作人属性链路（EXP → rank → 体力上限/消耗倍率）。
 * 通过 flag 门控，正常游玩不会触发。
 */
const card: EventDef = {
  id: 'evt.producer_stamina_drill',
  title: '制作人训练',
  when: [{ kind: 'flag', key: 'test_producer_drill', value: true }],
  text: '你在练习室角落里做了一组体能训练，汗顺着下巴落到地板上。',
  choices: [
    {
      label: '再做一组',
      effects: [
        {
          kind: 'attributeExp',
          ref: { scope: 'producer', key: 'stamina' },
          tier: 5,
        },
      ],
      result: '肌肉在发抖，但你觉得还能再撑一组。',
    },
    {
      label: '收工',
      effects: [],
      result: '你收拾好东西，决定明天再来。',
    },
  ],
};

export default card;
