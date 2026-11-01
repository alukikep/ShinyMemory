import type { IdolDef } from '../../types';

const idol: IdolDef = {
  id: 'tenka',
  name: '大崎甜花',
  unit: "ALSTROEMERIA",
  color: '#fed5ff',
  profile: "ALSTROEMERIA 的双胞胎姐姐。说话慢、怕生，被妹妹照顾着。",
  avatar: './assets/idols/q/tenka.png',
  // 定位：Vi（API hirameki）——慢热但声音是武器；舞蹈一般，表现靠"氛围"。
  age: 17,
  school: 'high',
  growth: {
    vocal: { initial: 'D', max: 'S' },
    dance: { initial: 'E', max: 'B' },
    expression: { initial: 'E', max: 'A' },
    trust: { initial: 'F', max: 'S' },
  },
};

export default idol;
