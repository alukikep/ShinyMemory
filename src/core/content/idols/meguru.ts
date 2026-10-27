import type { IdolDef } from '../../types';

const idol: IdolDef = {
  id: 'meguru',
  name: '八宫巡',
  unit: 'illumination STARS',
  color: '#f2c35f',
  profile:
    'illumination STARS 的成员。开朗、行动力强，喜欢热闹和新鲜事物。',
  quote: '走吧走吧！今天也要开开心心的！',
  growth: {
    vocal: { initial: 'F', max: 'A' },
    dance: { initial: 'E', max: 'A' },
    expression: { initial: 'D', max: 'S' },
    trust: { initial: 'E', max: 'A' },
  },
};

export default idol;
