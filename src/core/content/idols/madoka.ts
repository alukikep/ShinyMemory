import type { IdolDef } from '../../types';

const idol: IdolDef = {
  id: 'madoka',
  name: '樋口円香',
  unit: "noctchill",
  color: '#ffd9e1',
  profile: "noctchill 的成员。说话冷、句尾带刺，对制作人一律ですます；看得最清的是别人，最不想看清的是自己。",
  avatar: './assets/idols/q/madoka.png',
  age: 17,
  school: 'high',
  // 她对唱歌最较真、也最别扭：vocal 上限最高；expression 起步不低但要她肯露。
  growth: {
    vocal: { initial: 'C', max: 'S' },
    dance: { initial: 'D', max: 'A' },
    expression: { initial: 'D', max: 'S' },
    trust: { initial: 'F', max: 'S' },
  },
};

export default idol;
