import type { LocationDef } from '../../types.js';
import office from './office.js';
import station from './station.js';
import practiceRoom from './practiceRoom.js';
import studio from './studio.js';
import home from './home.js';
import park from './park.js';
import shoppingStreet from './shoppingStreet.js';
import pool from './pool.js';
import school from './school.js';
import hospital from './hospital.js';
import ekimae from './ekimae.js';
import studioDistrict from './studioDistrict.js';
import seaside from './seaside.js';
import university from './university.js';

/**
 * 地点分两层：
 * - 入口（kind: 'area'）：地图上只画它，里面有 `members`，进入 0 分钟。
 * - 成员：原来的地点，行动/事件/日程/章节继续引用它们，引擎判定不变。
 */
export const LOCATIONS: LocationDef[] = [
  office,
  home,
  university,
  ekimae,
  studioDistrict,
  seaside,
  station,
  practiceRoom,
  studio,
  park,
  shoppingStreet,
  pool,
  hospital,
  school,
];
