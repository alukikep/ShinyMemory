import type { TransitRouteDef } from '../types';
import { LOCATIONS } from './locations';

/**
 * 公共交通：全图可用，固定 15 分钟到任意"入口/独立地点"，不再区分出租车。
 *
 * 上车点不限（在楼里也能出门坐车）；目的地只列地图上画得出的节点，
 * 不会出现"坐车去练习室"这种把房间当站点的选项。
 */
const AREA_MEMBER_IDS = new Set(
  LOCATIONS.flatMap((location) => location.members ?? []),
);

const DEPARTURES = LOCATIONS.filter(
  (location) => location.reachable !== false && location.id !== 'school',
);
const DESTINATIONS = DEPARTURES.filter(
  (location) => !AREA_MEMBER_IDS.has(location.id),
);

const FARE = 100;
/** 公共交通统一 5 分钟；步行跨地区要 15 分钟，所以坐车有取舍。 */
const MINUTES = 5;

const nameOf = (id: string) =>
  LOCATIONS.find((location) => location.id === id)?.name ?? id;

export const TRANSIT_ROUTES: TransitRouteDef[] = DEPARTURES.flatMap((from) =>
  DESTINATIONS.filter((to) => to.id !== from.id).map((to) => ({
    id: `transit_${from.id}_${to.id}`,
    from: from.id,
    to: to.id,
    fare: FARE,
    minutes: MINUTES,
    label: nameOf(to.id),
    kind: 'bus' as const,
  })),
);
