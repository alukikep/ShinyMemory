import type { IdolDef } from '../../types';

const idol: IdolDef = {
  id: 'koito',
  name: '福丸小糸',
  unit: "noctchill",
  color: '#e6e1ff',
  profile: "noctchill 的成员。个子最小、声音也小，怕被人看着；随身带着糖，一慌就『ぴゃ！？』",
  avatar: './assets/idols/q/koito.png',
  age: 16,
  school: 'high',
  // 努力型：各项起步低但都能爬上去；表现最弱（她怕被看），信任最需要时间。
  growth: {
    vocal: { initial: 'D', max: 'S' },
    dance: { initial: 'E', max: 'A' },
    expression: { initial: 'F', max: 'A' },
    trust: { initial: 'F', max: 'S' },
  },
};

export default idol;
