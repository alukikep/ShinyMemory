import type { IdolDef } from '../../types';

const idol: IdolDef = {
  id: 'toru',
  name: '浅倉透',
  unit: "noctchill",
  color: '#bcf8f8',
  profile: "noctchill 的成员。说话短、常倒装，对什么都不太在意，只有『看见光』这件事会认真。",
  avatar: './assets/idols/q/tooru.png',
  age: 17,
  school: 'high',
  // 她不太擅长站在镜头前——expression 起步低；但上限高（她的透明感是武器）。
  growth: {
    vocal: { initial: 'D', max: 'A' },
    dance: { initial: 'E', max: 'B' },
    expression: { initial: 'D', max: 'S' },
    trust: { initial: 'E', max: 'S' },
  },
};

export default idol;
