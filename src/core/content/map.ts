import type { MapEdgeDef } from '../types';

/**
 * 步行网络（正式内容）。
 *
 * 两层：
 * - 入口之间、入口与独立地点之间：正常分钟数。
 * - 入口 ↔ 入口里的地点：0 分钟（"进楼"不花时间）。
 *
 * 助手都接收 edges 参数——夹具包有自己的地图，引擎不能写死正式包的边。
 */
export const WALK_EDGES: MapEdgeDef[] = [
  // 地区之间统一 15 分钟（不然公交 5 分钟就没意义了）。
  { from: 'home', to: 'ekimae', minutes: 15 },
  // 南町：家与站前之间往南的一带，旧公寓和游乐园都在里面。
  { from: 'home', to: 'south_town', minutes: 10 },
  { from: 'ekimae', to: 'south_town', minutes: 15 },
  { from: 'ekimae', to: 'office', minutes: 15 },
  { from: 'office', to: 'university_district', minutes: 15 },
  { from: 'ekimae', to: 'studio_district', minutes: 15 },
  { from: 'studio_district', to: 'office', minutes: 15 },
  { from: 'office', to: 'seaside', minutes: 15 },
  { from: 'university_district', to: 'seaside', minutes: 15 },
  { from: 'office', to: 'dorm', minutes: 5 },
  // 事务所楼顶：同一栋楼，从办公室上去 0 分钟（喊一声有回声）。
  { from: 'office', to: 'office_roof', minutes: 0 },
  // 进楼：0 分钟
  { from: 'south_town', to: 'apartment', minutes: 0 },
  { from: 'south_town', to: 'theme_park', minutes: 0 },
  { from: 'ekimae', to: 'station', minutes: 0 },
  { from: 'ekimae', to: 'shopping_street', minutes: 0 },
  { from: 'ekimae', to: 'record_shop', minutes: 0 },
  { from: 'ekimae', to: 'hall', minutes: 0 },
  { from: 'studio_district', to: 'practice_room', minutes: 0 },
  { from: 'studio_district', to: 'studio', minutes: 0 },
  { from: 'seaside', to: 'park', minutes: 0 },
  { from: 'seaside', to: 'pool', minutes: 0 },
  { from: 'seaside', to: 'hospital', minutes: 0 },
  { from: 'university_district', to: 'university', minutes: 0 },
];

export function neighborsOf(
  edges: MapEdgeDef[],
  locationId: string,
): MapEdgeDef[] {
  return edges.filter(
    (edge) => edge.from === locationId || edge.to === locationId,
  );
}

export function walkEdge(
  edges: MapEdgeDef[],
  from: string,
  to: string,
): MapEdgeDef | undefined {
  return edges.find(
    (edge) =>
      (edge.from === from && edge.to === to) ||
      (edge.from === to && edge.to === from),
  );
}

export function walkPath(
  edges: MapEdgeDef[],
  from: string,
  to: string,
): string[] {
  if (from === to) return [from];
  const queue = [from];
  const previous = new Map<string, string | undefined>([[from, undefined]]);

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const edge of neighborsOf(edges, current)) {
      const next = edge.from === current ? edge.to : edge.from;
      if (previous.has(next)) continue;
      previous.set(next, current);
      if (next === to) {
        const path: string[] = [to];
        let cursor: string | undefined = to;
        while (cursor !== from) {
          cursor = previous.get(cursor);
          if (!cursor) return [];
          path.push(cursor);
        }
        return path.reverse();
      }
      queue.push(next);
    }
  }
  return [];
}
