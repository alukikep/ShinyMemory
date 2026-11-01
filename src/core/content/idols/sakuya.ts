import type { IdolDef } from '../../types';

const idol: IdolDef = {
  id: 'sakuya',
  name: '白瀬咲耶',
  unit: "L'Antica",
  color: '#c7f4e8',
  profile: "L'Antica 的成员。模特出身，被人叫作「咲耶様」。说话礼貌、带着一点戏，最怕被人只当成「帅」。",
  avatar: './assets/idols/q/sakuya.png',
  // 定位：Vi（API hirameki）——表现（镜头感）是主场；舞蹈其次，歌唱是短板。
  age: 18,
  school: 'high',
  growth: {
    vocal: { initial: 'E', max: 'B' },
    dance: { initial: 'E', max: 'A' },
    expression: { initial: 'D', max: 'S' },
    trust: { initial: 'E', max: 'S' },
  },
};

export default idol;
