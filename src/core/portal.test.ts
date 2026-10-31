import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CONTENT_INDEX, buildContentIndex } from './contentIndex';
import { PRODUCTION_PACK } from './productionPack';
import { buildScene } from './scene';
import { moveTo, newGame } from './sim';

/**
 * 地点入口（kind: 'area'）：进楼 0 分钟，行动仍然挂在原来的地点上。
 *
 * 单元测试默认跑夹具包，这个文件要看正式包的入口，所以临时换包。
 */
const FIXTURE_SNAPSHOT = { ...CONTENT_INDEX };

function useProduction() {
  Object.assign(CONTENT_INDEX, buildContentIndex(PRODUCTION_PACK));
}

beforeEach(useProduction);

afterEach(() => {
  Object.assign(CONTENT_INDEX, FIXTURE_SNAPSHOT);
});

function at(locationId: string) {
  const state = newGame(1);
  state.pendingDialogueId = undefined;
  state.dialogueNodeId = undefined;
  state.phase = 'plan';
  state.locationId = locationId;
  return state;
}

describe('location areas', () => {
  it('lists the members as 0-minute entries on the area page', () => {
    const scene = buildScene(at('studio_district'));
    const enter = scene.actions.find((action) => action.label === '进入 练习室');
    expect(enter?.command).toEqual({ type: 'move', locationId: 'practice_room' });
    expect(enter?.hint).toBe('0 分钟');
    expect(scene.actions.some((action) => action.label === '进入 录音棚')).toBe(true);
  });

  it('moves into a member without spending time', () => {
    const before = at('studio_district');
    const after = moveTo(before, 'practice_room');
    expect(after.locationId).toBe('practice_room');
    expect(after.clock.absoluteMinutes).toBe(before.clock.absoluteMinutes);
  });

  it('offers a way back to the area from a member', () => {
    const scene = buildScene(at('practice_room'));
    const back = scene.actions.find((action) => action.label === '回到青叶练习街区');
    expect(back?.command).toEqual({ type: 'move', locationId: 'studio_district' });
  });

  it('keeps the member activities on the member page, not on the area page', () => {
    const areaLabels = buildScene(at('seaside')).actions.map((action) => action.label);
    expect(areaLabels).toContain('进入 公园');
    expect(areaLabels).not.toContain('环顾四周');
    const parkLabels = buildScene(at('park')).actions.map((action) => action.label);
    expect(parkLabels).toContain('环顾四周');
  });

  it('runs public transit from anywhere to every visible node in 5 minutes', () => {
    const routes = CONTENT_INDEX.transitRoutesByLocation.get('practice_room') ?? [];
    expect(routes.length).toBeGreaterThan(0);
    for (const route of routes) {
      expect(route.kind).toBe('bus');
      expect(route.minutes).toBe(5);
    }
    const destinations = new Set(routes.map((route) => route.to));
    expect(destinations.has('seaside')).toBe(true);
    expect(destinations.has('office')).toBe(true);
    // 房间不是站点
    expect(destinations.has('park')).toBe(false);
  });
});
