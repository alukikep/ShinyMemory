import type { IdolDef } from '../../types';

const idol: IdolDef = {
  id: 'natsuha',
  name: '有栖川夏葉',
  unit: "放課後クライマックスガールズ",
  color: '#d2f5c1',
  profile: "放学后 Climax Girls 的最年长成员。大小姐口吻，目标只有顶点。",
  avatar: './assets/idols/q/natsuha.png',
  // 定位：Me（API hirameki）——表现力最强：她把每一秒都用在打磨自己；舞蹈也强，歌唱是短板。
  age: 20,
  school: 'university',
  growth: {
    vocal: { initial: 'E', max: 'B' },
    dance: { initial: 'D', max: 'A' },
    expression: { initial: 'D', max: 'S' },
    trust: { initial: 'F', max: 'S' },
  },
};

export default idol;
