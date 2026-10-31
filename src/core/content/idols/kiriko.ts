import type { IdolDef } from '../../types';

const idol: IdolDef = {
  id: 'kiriko',
  name: '幽谷霧子',
  unit: "L'Antica",
  color: '#d2ebf8',
  profile: "L'Antica 的成员。说话很轻，总在替别人着想。",
  avatar: './assets/idols/q/kiriko.png',
  // 定位：Vo（API hirameki），唱是她的长处；舞蹈和表现从低处起步。
  growth: {
    vocal: { initial: 'D', max: 'S' },
    dance: { initial: 'E', max: 'B' },
    expression: { initial: 'E', max: 'A' },
    trust: { initial: 'F', max: 'S' },
  },
};

export default idol;
