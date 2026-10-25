import { describe, expect, it } from 'vitest';
import { CONTENT_INDEX } from './contentIndex';
import {
  canReplaceDay,
  getScheduleSlot,
  getScheduleWindow,
  getSchedulesForDay,
  getWeeklySchedule,
} from './schedule';
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
    expect(sunday).toHaveLength(2);
    expect(sunday[0]?.locationId).toBe('park');
    expect(sunday[0]?.visibility).toBe('private');
    expect(sunday[1]?.locationId).toBeUndefined();
    expect(sunday[1]?.visibility).toBe('private');
  });

  it('renders the weekly table in chronological order', () => {
    const monday = getWeeklySchedule(mano)[0];
    expect(monday?.label).toBe('星期一');
    expect(monday?.slots.map((slot) => slot.locationId)).toEqual([
      'practice_room',
      'studio',
    ]);
  });

  it('keeps school and private errands out of the public location flow', () => {
    expect(getScheduleSlot(hiori, 1440 + 9 * 60)?.locationId).toBe('school');
    expect(getScheduleSlot(mano, 6 * 1440 + 19 * 60)?.locationId).toBe(
      'park',
    );
    expect(getScheduleSlot(mano, 6 * 1440 + 12 * 60)?.locationId).toBeUndefined();
  });

  it('resolves hiori differently by weekday', () => {
    const tuesday = getSchedulesForDay(hiori, 2);
    expect(tuesday.map((slot) => slot.locationId)).toEqual([
      'practice_room',
      'school',
    ]);
    expect(tuesday[0]?.toMinute).toBe(18 * 60);

    const saturday = getSchedulesForDay(hiori, 6);
    expect(saturday.map((slot) => slot.locationId)).toEqual([
      'shopping_street',
      'studio',
    ]);
    expect(saturday[1]?.fromMinute).toBe(12 * 60);
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

  it('builds a date-first window starting today', () => {
    const window = getScheduleWindow(mano, 1);
    expect(window).toHaveLength(7);
    expect(window[0]?.day).toBe(1);
    expect(window[0]?.date).toEqual({ year: 2026, month: 4, day: 6 });
    expect(window[0]?.weekdayLabel).toBe('星期一');
    expect(window[0]?.isToday).toBe(true);
    expect(window[6]?.date).toEqual({ year: 2026, month: 4, day: 12 });
    expect(window[6]?.weekdayLabel).toBe('星期日');
  });

  it('applies a replace-day override to the correct date', () => {
    const override = {
      id: 'job-1',
      day: 2,
      fromMinute: 10 * 60,
      toMinute: 16 * 60,
      locationId: 'studio',
      label: '收录',
      visibility: 'public' as const,
      mode: 'replace-day' as const,
    };
    const window = getScheduleWindow(mano, 1, 7, [override]);
    const day = window[1];
    expect(day?.hasOverride).toBe(true);
    expect(day?.slots).toHaveLength(1);
    expect(day?.slots[0]?.locationId).toBe('studio');
    expect(day?.slots[0]?.fromMinute).toBe(10 * 60);
  });

  it('protects planned days but allows replacing free days', () => {
    expect(canReplaceDay(mano, 1).ok).toBe(false);
    expect(canReplaceDay(hiori, 2).ok).toBe(false);
    expect(canReplaceDay(mano, 7).ok).toBe(true);
  });

  it('treats an existing override as an occupied day', () => {
    const check = canReplaceDay(mano, 2, [
      {
        day: 2,
        locationId: 'studio',
        label: '收录',
        mode: 'replace-day',
      },
    ]);
    expect(check.ok).toBe(false);
    if (!check.ok) {
      expect(check.reason).toBe('override');
    }
  });
});
