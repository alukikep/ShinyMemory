import type { IdolDef } from '../../types';

const idol: IdolDef = {
  id: 'chiyuki',
  name: '桑山千雪',
  unit: "ALSTROEMERIA",
  color: '#e5e5e5',
  profile: "ALSTROEMERIA 的年长成员。事务所的姐姐，会缝东西，笑起来很温柔。",
  avatar: './assets/idols/q/chiyuki.png',
  // 定位：Vo（API hirameki）——歌唱是主场；表现（笑容）也强，舞蹈一般。
  age: 23,
  school: 'none',
  schoolNote: 'facts 未写学籍（23 岁，杂货店工作后转全职偶像）；按无学籍处理',
  growth: {
    vocal: { initial: 'D', max: 'S' },
    dance: { initial: 'E', max: 'A' },
    expression: { initial: 'D', max: 'S' },
    trust: { initial: 'E', max: 'S' },
  },
};

export default idol;
