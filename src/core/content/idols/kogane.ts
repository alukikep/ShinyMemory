import type { IdolDef } from '../../types';

const idol: IdolDef = {
  id: 'kogane',
  name: '月岡恋鐘',
  unit: "L'Antica",
  color: '#ffd7ed',
  profile: "L'Antica 的成员。爱操心的食堂女儿，说话带长崎口音。",
  avatar: './assets/idols/q/kogane.png',
  // 定位：Me（API hirameki，メンタル）——表现与信任起步高一点，舞蹈是短板。
  growth: {
    vocal: { initial: 'E', max: 'A' },
    dance: { initial: 'E', max: 'B' },
    expression: { initial: 'D', max: 'S' },
    trust: { initial: 'E', max: 'S' },
  },
};

export default idol;
