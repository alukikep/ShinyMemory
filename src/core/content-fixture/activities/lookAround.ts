import type { ActivityDef } from '../../types';

const card: ActivityDef = {
  id: 'look_around',
  name: '环顾四周',
  description: '花一点时间看看这个地方。也许会发现什么。',
  kind: 'explore',
  locations: [
    'office',
    'practice_room',
    'studio',
    'home',
    'park',
    'shopping_street',
  ],
  durationMinutes: 30,
  timeWindows: [{ fromMinute: 8 * 60, toMinute: 22 * 60 }],
  cost: { stamina: 5 },
  effects: [{
        "kind": "sharedStat",
        "stat": "stress",
        "delta": -2
      }],
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
    {
      when: [{ kind: 'atLocation', locationId: 'home' }],
      text: '家里很安静，窗外偶尔有电车经过。你看见桌上摊着没写完的日程。',
    },
    {
      when: [{ kind: 'atLocation', locationId: 'park' }],
      text: '公园的长椅上晒着太阳，喷泉边有人喂鸽子。远处传来练习室方向的音乐声。',
    },
    {
      when: [{ kind: 'atLocation', locationId: 'shopping_street' }],
      text: '商业街的橱窗换了新海报。奶茶店门口排着队，街角有人抱着吉他试音。',
    },
  ],
};

export default card;
