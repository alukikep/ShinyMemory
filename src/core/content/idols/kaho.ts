import type { IdolDef } from '../../types';

const idol: IdolDef = {
  id: 'kaho',
  name: '小宮果穂',
  unit: "放課後クライマックスガールズ",
  color: '#ffdcd3',
  profile: "放学后 Climax Girls 的成员。小学六年级，身高像个高中生，满脑子是英雄片。",
  avatar: './assets/idols/q/kaho.png',
  // 定位：Vo（API hirameki）——嗓子是主场；表现其次，舞蹈是短板（小学生身体还没长开）。
  growth: {
    vocal: { initial: 'D', max: 'S' },
    dance: { initial: 'E', max: 'B' },
    expression: { initial: 'E', max: 'A' },
    trust: { initial: 'E', max: 'S' },
  },
};

export default idol;
