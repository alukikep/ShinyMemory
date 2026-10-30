import type { IdolDef } from '../../types';

const idol: IdolDef = {
  id: 'meguru',
  name: '八宫巡',
  unit: 'illumination STARS',
  color: '#f2b04a',
  profile: 'illumination STARS 的成员。精力旺盛，什么忙都愿意帮。',
  portrait: './assets/idols/meguru-portrait.png',
  avatar: './assets/idols/q/meguru.png',
  quote: '诶嘿嘿，交给我吧！',
  growth: {
    vocal: { initial: 'E', max: 'A' },
    dance: { initial: 'F', max: 'B' },
    expression: { initial: 'D', max: 'S' },
    trust: { initial: 'E', max: 'S' },
  },
};

export default idol;
