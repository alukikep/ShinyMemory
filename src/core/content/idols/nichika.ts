import type { IdolDef } from '../../types';

const idol: IdolDef = {
  id: 'nichika',
  name: '七草にちか',
  unit: 'SHHis',
  color: '#ccf3dc',
  profile:
    'SHHis 的成员。ですます＋拖长的句尾＋带刺；偶像宅、唱片店店员，嘴上从不认输。',
  avatar: './assets/idols/q/nichika.png',
  age: 16,
  school: 'high',
  // 她是自己练出来的：舞蹈起步不高但上限高；信任最慢（她习惯先刺人）。
  growth: {
    vocal: { initial: 'D', max: 'A' },
    dance: { initial: 'D', max: 'S' },
    expression: { initial: 'C', max: 'S' },
    trust: { initial: 'F', max: 'S' },
  },
};

export default idol;
