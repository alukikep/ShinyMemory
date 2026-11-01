import type { IdolDef } from '../../types';

const idol: IdolDef = {
  id: 'asahi',
  name: '芹沢あさひ',
  unit: "Straylight",
  color: '#ffdbdb',
  profile: "Straylight 的センター。初中 2 年，好奇心比纪律先动。",
  avatar: './assets/idols/q/asahi.png',
  age: 14,
  school: 'junior',
  growth: {
    vocal: { initial: 'E', max: 'A' },
    dance: { initial: 'D', max: 'S' },
    expression: { initial: 'E', max: 'A' },
    trust: { initial: 'F', max: 'S' },
  },
};

export default idol;
