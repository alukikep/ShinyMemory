import type { LocationDef } from '../../types.js';

/**
 * 望丘台：大学所在的学生街。
 *
 * 入口只负责"这一带有什么"和进门；进入里面的地点是 0 分钟移动。
 * 现在里面只有「望丘大学」；以后要加旧书店、喫茶店、学生食堂，
 * 直接往 members 里加成员 + 一条 0 分钟边就行，不用动引擎。
 */
const location: LocationDef = {
  id: 'university_district',
  name: '望丘台',
  description:
    '坡道上去是大学正门，坡下一排旧书店和咖啡店。学生一整天都在上下坡，银杏季有人专门来拍照。',
  kind: 'area',
  members: ['university'],
  mapX: 310,
  mapY: 215,
};

export default location;
