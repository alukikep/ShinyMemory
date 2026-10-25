import type { IdolDef } from '../../types';

const idol: IdolDef = {
  id: 'mano',
  name: '樱木真乃',
  unit: 'illumination STARS',
  color: '#f1b7c5',
  profile: 'illumination STARS 的成员。温柔、认真，喜欢小动物。',
  portrait: './assets/idols/mano-portrait.png',
  quote: '制作人，今天也请多关照……',
  isStart: true,
  growth: {
    vocal: { initial: 'D', max: 'S' },
    dance: { initial: 'F', max: 'B' },
    expression: { initial: 'E', max: 'A' },
    trust: { initial: 'E', max: 'A' },
  },
};

export default idol;
