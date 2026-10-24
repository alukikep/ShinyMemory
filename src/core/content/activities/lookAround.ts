import type { ActivityDef } from '../../types';

const card: ActivityDef = {
  id: 'look_around',
  name: '环顾四周',
  description: '花一点时间看看这个地方。也许会发现什么。',
  kind: 'explore',
  cost: { stamina: 5 },
  effects: [{ kind: 'stat', stat: 'stress', delta: -2 }],
  resultTexts: ['你环顾四周，没发现什么特别的。'],
  resultVariants: [
    {
      when: [{ kind: 'atLocation', locationId: 'office' }],
      text: '事务所里很安静，只有打印机偶尔响一声。',
    },
    {
      when: [{ kind: 'atLocation', locationId: 'practice_room' }],
      text: '练习室的镜子映出走廊的灯，地板上多了几道新的鞋印。',
    },
    {
      when: [{ kind: 'atLocation', locationId: 'studio' }],
      text: '录音棚的隔音门半掩着，里面传来设备冷却的风声。',
    },
  ],
};

export default card;
