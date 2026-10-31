import { CONTENT_INDEX } from './contentIndex';
import type { LocationDef } from './types';

/**
 * 入口（kind: 'area'）与成员地点的查询。
 *
 * 入口只是导航层：地图画入口，行动/事件/日程仍然认成员地点。
 */
export function areaMembers(locationId: string): string[] {
  return CONTENT_INDEX.locations.get(locationId)?.members ?? [];
}

export function isArea(locationId: string): boolean {
  return areaMembers(locationId).length > 0;
}

/** 成员地点 → 它所属的入口 id。独立地点返回 undefined。 */
export function parentAreaId(locationId: string): string | undefined {
  for (const location of CONTENT_INDEX.locations.values()) {
    if (location.members?.includes(locationId)) return location.id;
  }
  return undefined;
}

export function parentArea(locationId: string): LocationDef | undefined {
  const id = parentAreaId(locationId);
  return id ? CONTENT_INDEX.locations.get(id) : undefined;
}

/** 地图上画得出来的地点：入口 + 不属于任何入口的独立地点。 */
export function visibleLocations(): LocationDef[] {
  const members = new Set(
    [...CONTENT_INDEX.locations.values()].flatMap(
      (location) => location.members ?? [],
    ),
  );
  return [...CONTENT_INDEX.locations.values()].filter(
    (location) => !members.has(location.id),
  );
}
