import type { IdolDef } from '../../types';

const idol: IdolDef = {
  id: 'hinana',
  name: '市川雛菜',
  unit: "noctchill",
  color: '#ffecb9',
  profile: "noctchill 的成员。用自己的名字自称，句子尾巴永远拖长；认定『雛菜がしあわせなのがいちばん』",
  avatar: './assets/idols/q/hinana.png',
  age: 15,
  school: 'high',
  // 舞蹈是她的强项，体力是短板；表现天生能打（她不怕被看）。
  growth: {
    vocal: { initial: 'E', max: 'A' },
    dance: { initial: 'C', max: 'S' },
    expression: { initial: 'C', max: 'S' },
    trust: { initial: 'E', max: 'S' },
  },
};

export default idol;
