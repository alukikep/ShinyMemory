import type { IdolDef } from '../../types';

const idol: IdolDef = {
  id: 'luca',
  name: '斑鳩ルカ',
  unit: 'CoMETIK',
  color: '#e9e3e1',
  profile:
    'CoMETIK 的成员。话短、火气大、大半句子只有省略号；一个人练到站不稳也不停。',
  avatar: './assets/idols/q/luca.png',
  age: 20,
  school: 'none',
  // facts 首行写 20 岁、出身神奈川、研究生出身并已出道：没有在读学段。
  schoolNote: 'facts 未写学段；本人已出道多年，不在学校',
  // 唱与舞都接近上限；表现是她的短板（本人不笑、也读不出表情）。
  growth: {
    vocal: { initial: 'A', max: 'S' },
    dance: { initial: 'A', max: 'S' },
    expression: { initial: 'D', max: 'S' },
    trust: { initial: 'E', max: 'S' },
  },
};

export default idol;
