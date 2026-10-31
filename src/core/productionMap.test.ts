import { describe, expect, it } from 'vitest';
import { PRODUCTION_PACK } from './productionPack';
import { WALK_EDGES, walkPath } from './content/map';

/**
 * 地图完整性：入口与独立地点要有坐标、接进步行网络、走得到；
 * 入口里的成员必须是 0 分钟可达，而且不能跑到地图上冒充独立节点。
 *
 * 事故 #33：泳池有坐标、有卡面剧情要用，但没有一条步行边——
 * 地图上是一座孤岛，只能靠巴士/出租车；后来加医院才发现这个问题。
 */
describe('production map', () => {
  const byId = new Map(
    PRODUCTION_PACK.locations.map((location) => [location.id, location]),
  );
  const memberIds = new Set(
    PRODUCTION_PACK.locations.flatMap((location) => location.members ?? []),
  );
  const visible = PRODUCTION_PACK.locations.filter(
    (location) => location.reachable !== false && !memberIds.has(location.id),
  );

  it('every visible node (area or standalone) has map coordinates', () => {
    for (const location of visible) {
      expect(
        location.mapX,
        `${location.id} 没有 mapX，地图上不会出现`,
      ).toBeTypeOf('number');
      expect(
        location.mapY,
        `${location.id} 没有 mapY，地图上不会出现`,
      ).toBeTypeOf('number');
    }
  });

  it('every visible node is wired into the walk network', () => {
    for (const location of visible) {
      expect(
        WALK_EDGES.some(
          (edge) => edge.from === location.id || edge.to === location.id,
        ),
        `${location.id} 没有接进步行网络`,
      ).toBe(true);
      expect(
        walkPath(WALK_EDGES, 'home', location.id).length,
        `${location.id} 从家走不到`,
      ).toBeGreaterThan(0);
    }
  });

  it('every member is entered from its parent area in 0 minutes', () => {
    for (const location of PRODUCTION_PACK.locations) {
      if (!memberIds.has(location.id)) continue;
      const parent = PRODUCTION_PACK.locations.find((entry) =>
        entry.members?.includes(location.id),
      );
      expect(parent, `${location.id} 没有入口`).toBeTruthy();
      expect(parent!.kind, `${parent!.id} 不是入口`).toBe('area');
      const edge = WALK_EDGES.find(
        (entry) =>
          (entry.from === parent!.id && entry.to === location.id) ||
          (entry.from === location.id && entry.to === parent!.id),
      );
      expect(edge, `${location.id} 和入口之间没有边`).toBeTruthy();
      expect(edge!.minutes, `进入 ${location.id} 应该 0 分钟`).toBe(0);
    }
  });

  it('walk edges reference real locations with non-negative minutes', () => {
    for (const edge of WALK_EDGES) {
      expect(byId.has(edge.from), `${edge.from} 不是地点`).toBe(true);
      expect(byId.has(edge.to), `${edge.to} 不是地点`).toBe(true);
      expect(edge.minutes, `${edge.from}→${edge.to} 的分钟数`).toBeGreaterThanOrEqual(0);
      // 0 分钟只允许出现在"入口 ↔ 成员"之间。
      if (edge.minutes === 0) {
        const pairIsParentChild =
          byId.get(edge.from)?.members?.includes(edge.to) ||
          byId.get(edge.to)?.members?.includes(edge.from);
        expect(pairIsParentChild, `${edge.from}→${edge.to} 的 0 分钟边不是进出楼`).toBe(true);
      }
    }
  });

  it('gives every visible map node a distinct spot', () => {
    const spots = new Map<string, string>();
    for (const location of visible) {
      const key = `${location.mapX},${location.mapY}`;
      const other = spots.get(key);
      if (other) {
        throw new Error(`${location.id} 和 ${other} 在地图上重叠于 ${key}`);
      }
      spots.set(key, location.id);
    }
    expect(spots.size).toBe(visible.length);
  });
});
