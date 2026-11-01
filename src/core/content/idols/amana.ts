import type { IdolDef } from '../../types';

const idol: IdolDef = {
  id: 'amana',
  name: '大崎甘奈',
  unit: "ALSTROEMERIA",
  color: '#ffd9e4',
  profile: "ALSTROEMERIA 的双胞胎妹妹。辣妹打扮，句尾带星号，想和姐姐一起闪耀。",
  avatar: './assets/idols/q/amana.png',
  // 定位：Vi（API hirameki）——歌唱是主场；表现也好，舞蹈一般。
  growth: {
    vocal: { initial: 'D', max: 'S' },
    dance: { initial: 'E', max: 'A' },
    expression: { initial: 'D', max: 'A' },
    trust: { initial: 'F', max: 'S' },
  },
};

export default idol;
