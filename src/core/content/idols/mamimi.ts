import type { IdolDef } from '../../types';

const idol: IdolDef = {
  id: 'mamimi',
  name: '田中摩美々',
  unit: "L'Antica",
  color: '#b79bd1',
  profile: "L'Antica 的成员。高中生，放学后要练习；说话总带拖长音。",
  avatar: './assets/idols/q/mamimi.png',
  quote: 'ふふー、まぁいいですけどー',
  age: 18,
  school: 'high',
  growth: {
    vocal: { initial: 'E', max: 'A' },
    dance: { initial: 'D', max: 'B' },
    expression: { initial: 'D', max: 'S' },
    trust: { initial: 'F', max: 'S' },
  },
};

export default idol;
