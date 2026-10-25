import { describe, expect, it } from 'vitest';
import { CONTENT_INDEX } from './contentIndex';
import { getScheduleSlot, getSchedulesForDay, getWeeklySchedule } from './schedule';
import type { ActorDef } from './types';

const mano = CONTENT_INDEX.actors.get('mano')!;
const hiori = CONTENT_INDEX.actors.get('hiori')!;

describe('actor schedule resolver', () => {
  it('uses the weekday template', () => {
    const monday = getSchedulesForDay(mano, 1);
    expect(monday.map((slot) => slot.locationId)).toEqual([
      'studio',
      'practice_room',
    ]);

    const saturday = getSchedulesForDay(mano, 6);
    expect(saturday.map((slot) => slot.locationId)).toEqual([
      'studio',
      'practice_room',
    ]);
    expect(saturday[1]?.fromMinute).toBe(10 * 60);

    const sunday = getSchedulesForDay(mano, 7);
    expect(sunday).toHaveLength(1);
    expect(sunday[0]?.locationId).toBe('home');
  });

  it('renders the weekly table in chronological order', () => {
    const monday = getWeeklySchedule(mano)[0];
    expect(monday?.label).toBe('星期一');
    expect(monday?.slots.map((slot) => slot.locationId)).toEqual([
      'practice_room',
      'studio',
    ]);
  });

  it('resolves hiori differently by weekday', () => {
    const tuesday = getSchedulesForDay(hiori, 2);
    expect(tuesday).toHaveLength(1);
    expect(tuesday[0]?.toMinute).toBe(18 * 60);

    const saturday = getSchedulesForDay(hiori, 6);
    expect(saturday[0]?.locationId).toBe('studio');
    expect(saturday[0]?.fromMinute).toBe(12 * 60);
  });

  it('lets a single-day override win over the weekly template', () => {
    const withOverride: ActorDef = {
      ...mano,
      overrides: [
        {
          day: 1,
          fromMinute: 8 * 60,
          toMinute: 10 * 60,
          locationId: 'home',
          label: '休息',
        },
      ],
    };

    expect(getScheduleSlot(withOverride, 9 * 60)?.locationId).toBe('home');
    expect(getScheduleSlot(withOverride, 11 * 60)?.locationId).toBe(
      'practice_room',
    );
  });

  it('uses priority for overlapping weekly rules', () => {
    const withPriority: ActorDef = {
      ...mano,
      schedule: [
        {
          fromMinute: 8 * 60,
          toMinute: 12 * 60,
          locationId: 'practice_room',
          priority: 0,
        },
        {
          fromMinute: 9 * 60,
          toMinute: 10 * 60,
          locationId: 'studio',
          priority: 5,
        },
      ],
    };

    expect(getScheduleSlot(withPriority, 9 * 60 + 30)?.locationId).toBe(
      'studio',
    );
  });
});
