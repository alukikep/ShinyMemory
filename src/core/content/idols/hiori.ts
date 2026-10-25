import type { IdolDef } from '../../types';

const idol: IdolDef = {
  id: 'hiori',
  name: '风野灯织',
  unit: 'illumination STARS',
  color: '#8fa8d8',
  profile: 'illumination STARS 的成员。冷静、认真，对自己要求很高。',
  portrait: './assets/idols/hiori-portrait.png',
  avatar: './assets/idols/q/hiori.png',
  quote: '……我会认真做的。',
  growth: {
    vocal: { initial: 'F', max: 'B' },
    dance: { initial: 'D', max: 'S' },
    expression: { initial: 'E', max: 'A' },
    trust: { initial: 'E', max: 'S' },
  },
};

export default idol;
