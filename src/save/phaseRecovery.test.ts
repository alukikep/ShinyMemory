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

  it('restores accepted jobs', () => {
    const state = newGame(1);
    state.jobs = [
      {
        id: 'job:job_magazine:mano:7',
        jobId: 'job_magazine',
        idolId: 'mano',
        day: 7,
        fromMinute: 10 * 60,
        toMinute: 16 * 60,
        locationId: 'studio',
      },
    ];

    const restored = roundtrip(state);
    expect(restored.jobs?.[0]?.id).toBe('job:job_magazine:mano:7');
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
});
