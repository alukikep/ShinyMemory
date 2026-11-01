import type { IdolDef } from '../../types';

const idol: IdolDef = {
  id: 'chiyoko',
  name: '園田智代子',
  unit: "放課後クライマックスガールズ",
  color: '#ffd8e9',
  profile: "放学后 Climax Girls 的成员。普通的女高中生，把「チョコアイドル」当成自己选的武器。",
  avatar: './assets/idols/q/chiyoko.png',
  // 定位：Me（API hirameki）——表现（亲和力/接话）是主场；歌唱其次，舞蹈是短板。
  growth: {
    vocal: { initial: 'E', max: 'A' },
    dance: { initial: 'E', max: 'B' },
    expression: { initial: 'D', max: 'S' },
    trust: { initial: 'E', max: 'S' },
  },
};

export default idol;
