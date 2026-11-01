import type { IdolDef } from '../../types';

const idol: IdolDef = {
  id: 'juri',
  name: '西城樹里',
  unit: "放課後クライマックスガールズ",
  color: '#ffe794',
  profile: "放学后 Climax Girls 的成员。金发、说话冲，被夸就会结巴。",
  avatar: './assets/idols/q/juri.png',
  // 定位：Da（API hirameki）——舞蹈是主场；表现其次，歌唱是短板。
  age: 17,
  school: 'high',
  growth: {
    vocal: { initial: 'E', max: 'A' },
    dance: { initial: 'D', max: 'S' },
    expression: { initial: 'E', max: 'B' },
    trust: { initial: 'E', max: 'S' },
  },
};

export default idol;
