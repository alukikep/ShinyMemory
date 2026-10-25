import { describe, expect, it } from 'vitest';
import {
  formatCalendarDate,
  formatCalendarDateFromDay,
  formatDayTime,
  getCalendarDate,
  getWeekday,
} from './time';

describe('calendar', () => {
  it('starts on 2026-04-06, a Monday', () => {
    expect(getCalendarDate(0)).toEqual({ year: 2026, month: 4, day: 6 });
    expect(getWeekday(0)).toBe(1);
    expect(formatCalendarDate(0)).toBe('2026年4月6日 · 星期一');
  });

  it('advances one calendar day per game day', () => {
    expect(formatCalendarDateFromDay(2, false)).toBe('4月7日 · 星期二');
    expect(
      getCalendarDate(1 * 1440 + 8 * 60),
    ).toEqual({ year: 2026, month: 4, day: 7 });
  });

  it('rolls over months correctly', () => {
    expect(formatCalendarDateFromDay(25, false)).toBe('4月30日 · 星期四');
    expect(formatCalendarDateFromDay(26, false)).toBe('5月1日 · 星期五');
  });

  it('formats short and time-of-day variants', () => {
    expect(formatCalendarDateFromDay(1, false)).toBe('4月6日 · 星期一');
    expect(formatDayTime(8 * 60)).toBe(
      '4月6日 · 星期一 · 08:00',
    );
  });
});
