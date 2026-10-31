import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createSaveEnvelope, migrateSave } from './save';
import { newGame } from '../core/sim';
import { CONTENT_INDEX, buildContentIndex } from '../core/contentIndex';
import { PRODUCTION_PACK } from '../core/productionPack';
import { STARTING_STATE } from '../core/content/starting';

/**
 * 旧存档里没有"后来才加进内容包的偶像"。
 *
 * 事故 #32：摩美々是在存档纪元 3 之后加进来的（纪元没变，旧档照常加载），
 * 存档里没有她的条目；招募链的 `complete.status` 被守卫静默跳过，
 * 剧情走完她也不进名册/日程表——玩家会以为"这两个面板没做"。
 *
 * 2026-11 的回归：这条不再只验摩美々一个人，而是对**正式包里的每个偶像**都跑一遍。
 * 后加的四个（霧子/恋鐘/咲耶/結華）走的是同一条兜底逻辑，谁被漏掉都会红。
 */
const FIXTURE_SNAPSHOT = { ...CONTENT_INDEX };

function useProduction() {
  Object.assign(CONTENT_INDEX, buildContentIndex(PRODUCTION_PACK));
}

beforeEach(useProduction);

afterEach(() => {
  Object.assign(CONTENT_INDEX, FIXTURE_SNAPSHOT);
});

const IDOLS = PRODUCTION_PACK.idols;

describe('save backfill', () => {
  it('covers every idol in the production pack', () => {
    // 保证这条回归不是"只测一个角色"：包里有人就会被测到。
    expect(IDOLS.length).toBeGreaterThanOrEqual(8);
  });

  it('adds idols that were introduced after the save was written', () => {
    for (const idol of IDOLS) {
      const state = newGame(1);
      delete state.idols[idol.id];
      delete state.actors[idol.id];

      const migrated = migrateSave(createSaveEnvelope(state));

      expect(
        migrated.state.idols[idol.id],
        `${idol.id} 的偶像条目没补回来`,
      ).toBeDefined();
      expect(
        migrated.state.actors[idol.id],
        `${idol.id} 的角色条目没补回来`,
      ).toBeDefined();
      // 补出来的状态要和"新游戏里她该在的状态"一致：档案型 known，偶遇型 unknown。
      expect(migrated.state.idols[idol.id]!.status, `${idol.id} 的状态不对`).toBe(
        STARTING_STATE.idolStatus[idol.id] ?? 'unknown',
      );
      expect(migrated.state.actors[idol.id]!.topicCooldowns).toEqual({});
    }
  });

  it('keeps existing progress when backfilling', () => {
    const state = newGame(1);
    state.idols.mano!.status = 'recruited';
    state.idols.mano!.stats.trust.exp = 42;
    for (const idol of IDOLS) {
      if (idol.id === 'mano') continue;
      delete state.idols[idol.id];
    }

    const migrated = migrateSave(createSaveEnvelope(state));

    expect(migrated.state.idols.mano!.status).toBe('recruited');
    expect(migrated.state.idols.mano!.stats.trust.exp).toBe(42);
  });

  it('restores every idol status when her recruit chain finished without her', () => {
    const encounters = [...PRODUCTION_PACK.storyChains].filter(
      (chain) => chain.lockScope === 'none',
    );
    expect(encounters.length).toBeGreaterThanOrEqual(8);

    for (const chain of encounters) {
      const state = newGame(1);
      // 出事的那份档：招募链已经走完，但偶像条目根本没写进去。
      delete state.idols[chain.idolId];
      state.storyChains[chain.id] = {
        chainId: chain.id,
        stepIndex: chain.steps.length,
      };

      const migrated = migrateSave(createSaveEnvelope(state));

      expect(
        migrated.state.idols[chain.idolId]?.status,
        `${chain.idolId} 走完 ${chain.id} 后状态没补回来`,
      ).toBe('recruited');
    }
  });
});
