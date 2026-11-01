import type { IdolDef } from '../../types';

const idol: IdolDef = {
  id: 'yuika',
  name: '三峰結華',
  unit: "L'Antica",
  color: '#ceecff',
  profile: "L'Antica 的成员。大学生，偶像宅出身。说话快、爱开玩笑，越认真的话越要笑着说。",
  avatar: './assets/idols/q/yuika.png',
  // 定位：Da（API hirameki）——舞蹈是主场；表现（接话/镜头）其次，歌唱是短板。
  age: 19,
  school: 'university',
  growth: {
    vocal: { initial: 'E', max: 'B' },
    dance: { initial: 'D', max: 'S' },
    expression: { initial: 'E', max: 'A' },
    trust: { initial: 'E', max: 'S' },
  },
};

export default idol;
