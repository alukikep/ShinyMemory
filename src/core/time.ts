import { MINUTES_PER_DAY } from './config';

export function getDay(absoluteMinutes: number): number {
  return Math.floor(absoluteMinutes / MINUTES_PER_DAY) + 1;
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
  return `第 ${getDay(absoluteMinutes)} 天 · ${formatClock(absoluteMinutes)}`;
}

export function formatDuration(minutes: number): string {
  if (minutes <= 0) return '立即';
  if (minutes < 60) return `${minutes} 分钟`;
  const hours = minutes / 60;
  return Number.isInteger(hours) ? `${hours} 小时` : `${hours.toFixed(1)} 小时`;
}
