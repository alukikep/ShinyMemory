import { CALENDAR_START, MINUTES_PER_DAY } from './config';
import type { TimeWindow, Weekday } from './types';

export type CalendarDate = {
  year: number;
  month: number;
  day: number;
};

export const WEEKDAY_LABELS = [
  '星期日',
  '星期一',
  '星期二',
  '星期三',
  '星期四',
  '星期五',
  '星期六',
] as const;

export function getDay(absoluteMinutes: number): number {
  return Math.floor(absoluteMinutes / MINUTES_PER_DAY) + 1;
}

function utcDateForDay(day: number): Date {
  return new Date(
    Date.UTC(
      CALENDAR_START.year,
      CALENDAR_START.month - 1,
      CALENDAR_START.day + day - 1,
    ),
  );
}

export function getCalendarDateFromDay(day: number): CalendarDate {
  const date = utcDateForDay(day);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

export function getCalendarDate(absoluteMinutes: number): CalendarDate {
  return getCalendarDateFromDay(getDay(absoluteMinutes));
}

export function getWeekdayFromDay(day: number): Weekday {
  return utcDateForDay(day).getUTCDay() as Weekday;
}

export function getWeekday(absoluteMinutes: number): Weekday {
  return getWeekdayFromDay(getDay(absoluteMinutes));
}

export function formatWeekday(day: number): string {
  return WEEKDAY_LABELS[getWeekdayFromDay(day)] ?? '';
}

export function formatCalendarDateFromDay(
  day: number,
  withYear = true,
): string {
  const date = getCalendarDateFromDay(day);
  const year = withYear ? `${date.year}年` : '';
  return `${year}${date.month}月${date.day}日 · ${formatWeekday(day)}`;
}

export function formatCalendarDate(
  absoluteMinutes: number,
  withYear = true,
): string {
  return formatCalendarDateFromDay(getDay(absoluteMinutes), withYear);
}

export function getMinuteOfDay(absoluteMinutes: number): number {
  const wrapped = absoluteMinutes % MINUTES_PER_DAY;
  return wrapped < 0 ? wrapped + MINUTES_PER_DAY : wrapped;
}

export function formatClock(absoluteMinutes: number): string {
  const minuteOfDay = getMinuteOfDay(absoluteMinutes);
  const hours = Math.floor(minuteOfDay / 60);
  const minutes = minuteOfDay % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function formatDayTime(absoluteMinutes: number): string {
  return `${formatCalendarDate(absoluteMinutes, false)} · ${formatClock(absoluteMinutes)}`;
}

export function formatDuration(minutes: number): string {
  if (minutes <= 0) return '立即';
  if (minutes < 60) return `${minutes} 分钟`;
  const hours = minutes / 60;
  return Number.isInteger(hours) ? `${hours} 小时` : `${hours.toFixed(1)} 小时`;
}

export function isMinuteInWindow(
  absoluteMinutes: number,
  window: TimeWindow,
): boolean {
  const minuteOfDay = getMinuteOfDay(absoluteMinutes);
  const { fromMinute, toMinute } = window;
  if (fromMinute === toMinute) return true;
  return fromMinute < toMinute
    ? minuteOfDay >= fromMinute && minuteOfDay < toMinute
    : minuteOfDay >= fromMinute || minuteOfDay < toMinute;
}

export function formatTimeWindows(windows?: TimeWindow[]): string | undefined {
  if (!windows || windows.length === 0) return undefined;
  return windows
    .map((window) => `${formatClock(window.fromMinute)}–${formatClock(window.toMinute)}`)
    .join(' / ');
}
