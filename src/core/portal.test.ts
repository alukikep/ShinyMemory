import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CONTENT_INDEX, buildContentIndex } from './contentIndex';
import { PRODUCTION_PACK } from './productionPack';
import { buildScene } from './scene';
import { moveTo, newGame } from './sim';

/**
 * 地点入口（kind: 'area'）：成员可以 0–15 分钟到达；行动仍然挂在原来的地点上。
 *
 * 事务所自己就是 area：办公室行动留在 `office`，屋顶 0 分钟、宿舍 5 分钟。
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

  it('treats the office as an area that still owns its activities', () => {
    const scene = buildScene(at('office'));
    const labels = scene.actions.map((action) => action.label);
    expect(labels).toContain('休息');
    expect(labels).toContain('整理资料');
  });

  it('enters the office roof in 0 minutes and the dorm in 5 minutes', () => {
    const scene = buildScene(at('office'));
    const roof = scene.actions.find(
      (action) => action.label === '进入 事务所屋顶',
    );
    expect(roof?.command).toEqual({ type: 'move', locationId: 'office_roof' });
    expect(roof?.hint).toBe('0 分钟');

    const dorm = scene.actions.find(
      (action) => action.label === '进入 事务所宿舍',
    );
    expect(dorm?.command).toEqual({ type: 'move', locationId: 'dorm' });
    expect(dorm?.hint).toBe('5 分钟');
  });

  it('moves into the roof without spending time and into the dorm in 5 minutes', () => {
    const roofBefore = at('office');
    const roofAfter = moveTo(roofBefore, 'office_roof');
    expect(roofAfter.locationId).toBe('office_roof');
    expect(roofAfter.clock.absoluteMinutes).toBe(
      roofBefore.clock.absoluteMinutes,
    );

    const dormBefore = at('office');
    const dormAfter = moveTo(dormBefore, 'dorm');
    expect(dormAfter.locationId).toBe('dorm');
    expect(dormAfter.clock.absoluteMinutes).toBe(
      dormBefore.clock.absoluteMinutes + 5,
    );
  });

  it('offers a way back to the office from the roof and the dorm', () => {
    for (const [locationId, minutes] of [
      ['office_roof', '0 分钟'],
      ['dorm', '5 分钟'],
    ] as const) {
      const scene = buildScene(at(locationId));
      const back = scene.actions.find(
        (action) => action.label === '回到事务所',
      );
      expect(back?.command).toEqual({ type: 'move', locationId: 'office' });
      expect(back?.hint).toBe(minutes);
    }
  });

  it('lists the south town members as 0-minute entries', () => {
    const scene = buildScene(at('south_town'));
    const apartment = scene.actions.find(
      (action) => action.label === '进入 南町公寓',
    );
    expect(apartment?.command).toEqual({
      type: 'move',
      locationId: 'apartment',
    });
    expect(apartment?.hint).toBe('0 分钟');

    const themePark = scene.actions.find(
      (action) => action.label === '进入 游乐园',
    );
    expect(themePark?.command).toEqual({
      type: 'move',
      locationId: 'theme_park',
    });
    expect(themePark?.hint).toBe('0 分钟');
  });

  it('moves into both south town members without spending time', () => {
    for (const locationId of ['apartment', 'theme_park']) {
      const before = at('south_town');
      const after = moveTo(before, locationId);
      expect(after.locationId).toBe(locationId);
      expect(after.clock.absoluteMinutes).toBe(before.clock.absoluteMinutes);
    }
  });

  it('offers a way back to south town from both members', () => {
    for (const locationId of ['apartment', 'theme_park']) {
      const scene = buildScene(at(locationId));
      const back = scene.actions.find(
        (action) => action.label === '回到南町',
      );
      expect(back?.command).toEqual({ type: 'move', locationId: 'south_town' });
      expect(back?.hint).toBe('0 分钟');
    }
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
