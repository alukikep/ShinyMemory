import type { IdolDef } from '../../types';

const idol: IdolDef = {
  id: 'fuyuko',
  name: '黛冬優子',
  unit: "Straylight",
  color: '#d7f4bf',
  profile: "Straylight 的队长。专门学校 1 年，对外是可爱的ふゆ，对内嘴很毒。",
  avatar: './assets/idols/q/fuyuko.png',
  age: 19,
  school: 'specialised',
  growth: {
    vocal: { initial: 'D', max: 'S' },
    dance: { initial: 'E', max: 'A' },
    expression: { initial: 'D', max: 'S' },
    trust: { initial: 'E', max: 'S' },
  },
};

export default idol;
