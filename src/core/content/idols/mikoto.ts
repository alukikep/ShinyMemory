import type { IdolDef } from '../../types';

const idol: IdolDef = {
  id: 'mikoto',
  name: '緋田美琴',
  unit: 'SHHis',
  color: '#ffdbdb',
  profile:
    'SHHis 的成员。说话平静、句子短、停顿多；十年的老手，一练起来就听不见人叫。',
  avatar: './assets/idols/q/mikoto.png',
  age: 24,
  school: 'none',
  // facts 首行只写年龄与出身，没有在读学段：24 岁，14 岁上京后边上学边练，现在不在学校。
  schoolNote: 'facts 未写学段；本人是已出道十年的偶像，不在学校',
  // 十年功底：歌与舞都接近上限；表现反而要她"松下来"才涨。
  growth: {
    vocal: { initial: 'B', max: 'S' },
    dance: { initial: 'A', max: 'S' },
    expression: { initial: 'D', max: 'S' },
    trust: { initial: 'E', max: 'S' },
  },
};

export default idol;
