import { describe, expect, it } from 'vitest';
import { createSaveEnvelope, migrateSave } from './save';
import { PRODUCER_STAT_KEYS } from '../core/producer';
import { newGame } from '../core/sim';

describe('producer stats migration', () => {
  it('fills attributes added after the save was written', () => {
    const envelope = createSaveEnvelope(newGame(1));
    envelope.schemaVersion = 15;
    // 模拟旧存档：只有两个属性
    delete (envelope.state.producer as Record<string, unknown>).planning;
    delete (envelope.state.producer as Record<string, unknown>).negotiation;
    delete (envelope.state.producer as Record<string, unknown>).insight;
    (envelope.state.producer as Record<string, { rank: string }>).photography = {
      rank: 'C',
    } as never;

    const migrated = migrateSave(envelope);
    expect(migrated.schemaVersion).toBe(16);
    for (const key of PRODUCER_STAT_KEYS) {
      expect(migrated.state.producer[key]).toBeDefined();
    }
    // 已有的等级不能被重置
    expect(migrated.state.producer.photography.rank).toBe('C');
    expect(migrated.state.producer.planning.rank).toBe('F');
  });
});
