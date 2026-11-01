import type { IdolDef } from '../../types';

const idol: IdolDef = {
  id: 'haruki',
  name: '郁田はるき',
  unit: 'CoMETIK',
  color: '#dcc571',
  profile:
    'CoMETIK 的成员。美术科高二，借住在姐姐家；说话软、笑点低，一说到想做的事就停不下来。',
  avatar: './assets/idols/q/haruki.png',
  age: 17,
  school: 'high',
  growth: {
    vocal: { initial: 'E', max: 'S' },
    dance: { initial: 'E', max: 'S' },
    expression: { initial: 'B', max: 'S' },
    trust: { initial: 'E', max: 'S' },
  },
};

export default idol;
