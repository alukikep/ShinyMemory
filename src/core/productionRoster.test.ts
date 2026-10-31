import { describe, expect, it } from 'vitest';
import { PRODUCTION_PACK } from './productionPack';
import { PENDING_IDOLS } from './content/pending';

/**
 * 新角色接进来之后，名册和日程表必须看得到她。
 *
 * 两个面板都从 `state.idols` 渲染，而 `state.idols` 由 `IdolDef` 生成：
 * - 名册：列出 status !== 'unknown' 的偶像；缺 `ActorDef` 就只能显示「自由活动」
 * - 日程表：已招募的偶像按 `ActorDef.schedule` 画七格；日程空 = 一格都没有
 *
 * 事故 #31：摩美々接进来后有人问"名册和日程表是不是没做"——面板其实在，
 * 但没有一条测试保证"新角色接进来就一定看得见"。
 */
describe('production roster', () => {
  const idols = PRODUCTION_PACK.idols;
  const actors = new Map(PRODUCTION_PACK.actors.map((actor) => [actor.id, actor]));

  it('every idol has an actor with a usable weekly schedule', () => {
    expect(idols.length).toBeGreaterThan(0);
    for (const idol of idols) {
      const actor = actors.get(idol.id);
      expect(actor, `${idol.id} 没有 ActorDef，名册会显示错误位置`).toBeTruthy();
      expect(actor!.role, `${idol.id} 的角色不是偶像`).toBe('idol');
      expect(
        actor!.schedule.length,
        `${idol.id} 的日程是空数组，日程表会是空的`,
      ).toBeGreaterThan(0);
      expect(
        actor!.schedule.some((slot) => Boolean(slot.locationId)),
        `${idol.id} 的日程没有落在任何地点`,
      ).toBe(true);
    }
  });

  it('every idol has the fields the roster card renders', () => {
    for (const idol of idols) {
      expect(idol.name.length, `${idol.id} 没有名字`).toBeGreaterThan(0);
      expect(idol.unit.length, `${idol.id} 没有组合`).toBeGreaterThan(0);
      expect(idol.profile.length, `${idol.id} 没有简介`).toBeGreaterThan(0);
      expect(
        Object.keys(idol.growth).sort(),
        `${idol.id} 的成长曲线缺属性`,
      ).toEqual(['dance', 'expression', 'trust', 'vocal']);
    }
  });

  it('every idol can actually be recruited', () => {
    for (const idol of idols) {
      if (PENDING_IDOLS.includes(idol.id)) continue;
      const recruitable = PRODUCTION_PACK.storyChains.some(
        (chain) =>
          chain.idolId === idol.id &&
          chain.steps.some((step) => step.complete?.status === 'recruited'),
      );
      expect(
        recruitable,
        `${idol.id} 没有把状态推到 recruited 的剧情步骤`,
      ).toBe(true);
    }
  });

  it('keeps the in-progress list pointing at real idols', () => {
    for (const id of PENDING_IDOLS) {
      expect(
        PRODUCTION_PACK.idols.some((idol) => idol.id === id),
        `PENDING_IDOLS 里的 ${id} 不在内容包里`,
      ).toBe(true);
    }
  });

  it('every idol has a starting status entry', () => {
    for (const idol of idols) {
      expect(
        PRODUCTION_PACK.starting.idolStatus[idol.id],
        `${idol.id} 没写 starting.idolStatus（会默认 unknown）`,
      ).toBeTruthy();
    }
  });
});
