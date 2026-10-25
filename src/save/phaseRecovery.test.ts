import { describe, expect, it } from 'vitest';
import { buildScene } from '../core/scene';
import { applyActivity, newGame, travelTo } from '../core/sim';
import type { GameState } from '../core/types';
import { LocalStorageRepository } from './localStorageRepository';
import { MemoryStorage } from './memoryStorage';
import { createSaveEnvelope } from './save';

function roundtrip(state: GameState): GameState {
  const repo = new LocalStorageRepository(new MemoryStorage());
  repo.save(createSaveEnvelope(state));
  const loaded = repo.load();
  if (!loaded) throw new Error('save was not restored');
  return loaded.state;
}

describe('phase recovery', () => {
  it('restores activityResult', () => {
    const state = applyActivity(travelTo(newGame(1), 'practice_room'), 'vocal');
    const scene = buildScene(roundtrip(state));
    expect(scene.phase).toBe('activityResult');
    expect(scene.title).toBe('声乐课');
  });

  it('restores event', () => {
    const state = newGame(1);
    state.phase = 'event';
    state.pendingEventId = 'evt.night_practice';

    const scene = buildScene(roundtrip(state));
    expect(scene.phase).toBe('event');
    expect(scene.title).toBe('深夜的练习室');
  });

  it('restores dynamic schedule overrides', () => {
    const state = newGame(1);
    state.actors.mano.scheduleOverrides = [
      {
        id: 'job-1',
        day: 2,
        fromMinute: 10 * 60,
        toMinute: 16 * 60,
        locationId: 'studio',
        label: '收录',
        mode: 'replace-day',
      },
    ];

    const restored = roundtrip(state);
    expect(restored.actors.mano.scheduleOverrides?.[0]?.id).toBe('job-1');
  });

  it('restores exam', () => {
    const state = newGame(1);
    state.phase = 'examMid';
    state.examScore = 46;
    state.examParts = [{ label: '测试', value: 46 }];
    state.examPassed = true;

    const scene = buildScene(roundtrip(state));
    expect(scene.phase).toBe('examMid');
    expect(scene.title).toBe('中期试镜');
  });

  it('restores ending', () => {
    const state = newGame(1);
    state.phase = 'ending';
    state.endingId = 'end.true';
    state.examScore = 80;

    const scene = buildScene(roundtrip(state));
    expect(scene.phase).toBe('ending');
    expect(scene.title).toBe('闪耀的舞台');
  });
});
