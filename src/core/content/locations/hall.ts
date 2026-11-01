import type { LocationDef } from '../../types.js';

/**
 * 会场（小型 live house）。
 *
 * 挂在站前一带（`ekimae` 的成员，进门 0 分钟），商店街尽头。
 *
 * 为什么值得单独建：这作里"上台"一直借录音棚和练习室带过，但
 * **致敬演出、感谢祭、单独 live 都是有观众的场地**——
 * - 八雲なみ 的致敬演出（セヴン＃ス）：にちか 在这里听不见自己的声音 [400105805/806]
 * - CoMETIK 的感谢祭、单独 live（后续单元内容）也都在"ハコ"里
 *
 * 录音棚有隔音门、练习室没有观众，都替不了它。
 */
const location: LocationDef = {
  id: 'hall',
  name: '会场',
  description:
    '商店街尽头的小型 live house。门口贴着今晚的出演者名单，站席能塞两百人左右，天花板垂着一排没对准的射灯。',
  kind: 'place',
  mapX: 150,
  mapY: 20,
};

export default location;
