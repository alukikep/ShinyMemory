import type { IdolDef } from '../../types';

const idol: IdolDef = {
  id: 'rinze',
  name: '杜野凛世',
  unit: "放課後クライマックスガールズ",
  color: '#d0ebff',
  profile: "放学后 Climax Girls 的成员。穿和服、说话慢，用名字自称。",
  avatar: './assets/idols/q/rinze.png',
  // 定位：Da（API hirameki）——舞踊打底，舞蹈最强；表现也不错但卡在"型"里，歌唱是短板。
  age: 16,
  school: 'high',
  growth: {
    vocal: { initial: 'E', max: 'B' },
    dance: { initial: 'D', max: 'S' },
    expression: { initial: 'D', max: 'A' },
    trust: { initial: 'F', max: 'S' },
  },
};

export default idol;
