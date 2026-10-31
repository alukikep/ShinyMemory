import type { LocationDef } from '../../types.js';

/**
 * 大学医院。
 *
 * 依据（霧子）：她家就在大学医院的宿舍，父母都在这里工作；她在中庭学习、
 * 在屋顶晒床单、给孩子们开「おはなし会」。制作人能去的是中庭和门口。
 * 和泳池同属地图东南角的一片（从公园走进去），不单独做「区」的 UI。
 */
const location: LocationDef = {
  id: 'hospital',
  name: '医院',
  description: '大学医院的中庭。长椅旁边有一小片花坛，风从走廊那头吹过来。',
  kind: 'place',
  mapX: 470,
  mapY: 215,
};

export default location;
