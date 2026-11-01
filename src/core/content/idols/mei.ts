import type { IdolDef } from '../../types';

const idol: IdolDef = {
  id: 'mei',
  name: '和泉愛依',
  unit: "Straylight",
  color: '#ffd4ff',
  profile: "Straylight 的辣妹。平时用うち，一上台就切换成寡言模式。",
  avatar: './assets/idols/q/mei.png',
  age: 18,
  school: 'high',
  growth: {
    vocal: { initial: 'E', max: 'A' },
    dance: { initial: 'E', max: 'B' },
    expression: { initial: 'D', max: 'S' },
    trust: { initial: 'E', max: 'S' },
  },
};

export default idol;
