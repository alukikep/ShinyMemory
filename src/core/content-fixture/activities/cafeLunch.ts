import type { ActivityDef } from '../../types';

const card: ActivityDef = {
  id: 'cafe_lunch',
  name: '咖啡店午餐',
  description: '在商业街尽头的小店坐一会儿，吃点热的东西。',
  kind: 'rest',
  locations: ['shopping_street'],
  durationMinutes: 60,
  cost: {
    money: 300,
  },
  effects: [
    { kind: 'sharedStat', stat: 'stress', delta: -8 },
    { kind: 'sharedStat', stat: 'stamina', delta: 5 },
  ],
  resultTexts: [
    '窗边的位置刚好有太阳。她把汤喝得很慢，紧绷的肩膀终于松下来一点。',
    '店里放着很轻的旧歌。她没有说话，只是把最后一口面包吃完。',
  ],
};

export default card;
