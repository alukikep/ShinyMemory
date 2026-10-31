import { describe, expect, it } from 'vitest';
import { PRODUCTION_PACK } from './productionPack';
import { WALK_EDGES, walkPath } from './content/map';

/**
 * 地图完整性：正式包里的每个"能去的地点"都必须
 * 有坐标、接进步行网络、而且真的走得到。
 *
 * 事故 #33：泳池有坐标、有卡面剧情要用，但没有一条步行边——
 * 地图上是一座孤岛，只能靠巴士/出租车；后来加医院才发现这个问题。
 */
describe('production map', () => {
  const playable = PRODUCTION_PACK.locations.filter(
    (location) => location.reachable !== false,
  );

  it('every playable location has map coordinates', () => {
    for (const location of playable) {
      expect(location.mapX, `${location.id} 没有 mapX，地图上不会出现`).toBeTypeOf('number');
      expect(location.mapY, `${location.id} 没有 mapY，地图上不会出现`).toBeTypeOf('number');
    }
  });

  it('every playable location is wired into the walk network', () => {
    for (const location of playable) {
      expect(
        WALK_EDGES.some(
          (edge) => edge.from === location.id || edge.to === location.id,
        ),
        `${location.id} 没有接进步行网络`,
      ).toBe(true);
      expect(
        walkPath('home', location.id).length,
        `${location.id} 从家走不到`,
      ).toBeGreaterThan(0);
    }
  });

  it('walk edges reference real locations with positive minutes', () => {
    const ids = new Set(PRODUCTION_PACK.locations.map((location) => location.id));
    for (const edge of WALK_EDGES) {
      expect(ids.has(edge.from), `${edge.from} 不是地点`).toBe(true);
      expect(ids.has(edge.to), `${edge.to} 不是地点`).toBe(true);
      expect(edge.minutes, `${edge.from}→${edge.to} 的分钟数`).toBeGreaterThan(0);
    }
  });

  it('gives every map node a distinct spot', () => {
    const spots = new Map<string, string>();
    for (const location of playable) {
      const key = `${location.mapX},${location.mapY}`;
      const other = spots.get(key);
      if (other) {
        throw new Error(`${location.id} 和 ${other} 在地图上重叠于 ${key}`);
      }
      spots.set(key, location.id);
    }
    expect(spots.size).toBe(playable.length);
  });
});
