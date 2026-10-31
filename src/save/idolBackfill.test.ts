import { describe, expect, it } from 'vitest';
import { createSaveEnvelope, migrateSave } from './save';
import { newGame } from '../core/sim';

/**
 * 旧存档里没有"后来才加进内容包的偶像"。
 *
 * 事故 #32：摩美々是在存档纪元 3 之后加进来的（纪元没变，旧档照常加载），
 * 存档里没有她的条目；招募链的 `complete.status` 被守卫静默跳过，
 * 剧情走完她也不进名册/日程表——玩家会以为"这两个面板没做"。
 */
describe('save backfill', () => {
  it('adds idols that were introduced after the save was written', () => {
    const state = newGame(1);
    state.idols.mano!.status = 'recruited';
    state.idols.meguru!.status = 'recruited';
    delete state.idols.meguru;

    const migrated = migrateSave(createSaveEnvelope(state));

    expect(migrated.state.idols.meguru).toBeDefined();
    // 新加进来的人默认不认识，等玩家自己偶遇。
    expect(migrated.state.idols.meguru!.status).toBe('unknown');
    // 已有进度不能被覆盖。
    expect(migrated.state.idols.mano!.status).toBe('recruited');
  });

  it('adds actors that were introduced after the save was written', () => {
    const state = newGame(1);
    delete state.actors.meguru;

    const migrated = migrateSave(createSaveEnvelope(state));

    expect(migrated.state.actors.meguru).toBeDefined();
    expect(migrated.state.actors.meguru!.topicCooldowns).toEqual({});
  });

  it('restores the status when the chain already completed without her', () => {
    // 出事的那份档：招募链已经走完（stepIndex = 2），但偶像条目根本没写进去。
    const state = newGame(1);
    delete state.idols.meguru;
    state.storyChains['meguru-encounter'] = {
      chainId: 'meguru-encounter',
      stepIndex: 2,
    };

    const migrated = migrateSave(createSaveEnvelope(state));

    expect(migrated.state.idols.meguru?.status).toBe('recruited');
  });
});
