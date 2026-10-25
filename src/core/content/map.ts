import type { MapEdgeDef } from '../types';

export const WALK_EDGES: MapEdgeDef[] = [
  { from: 'home', to: 'station', minutes: 10 },
  { from: 'station', to: 'office', minutes: 5 },
  { from: 'station', to: 'practice_room', minutes: 10 },
  { from: 'practice_room', to: 'studio', minutes: 4 },
  { from: 'station', to: 'park', minutes: 12 },
  { from: 'practice_room', to: 'shopping_street', minutes: 6 },
];

export function neighborsOf(locationId: string): MapEdgeDef[] {
  return WALK_EDGES.filter(
    (edge) => edge.from === locationId || edge.to === locationId,
  );
}

export function walkEdge(
  from: string,
  to: string,
): MapEdgeDef | undefined {
  return WALK_EDGES.find(
    (edge) =>
      (edge.from === from && edge.to === to) ||
      (edge.from === to && edge.to === from),
  );
}

export function walkPath(from: string, to: string): string[] {
  if (from === to) return [from];
  const queue = [from];
  const previous = new Map<string, string | undefined>([[from, undefined]]);

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const edge of neighborsOf(current)) {
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
