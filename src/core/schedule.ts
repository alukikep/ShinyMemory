import {
  getDay,
  getWeekdayFromDay,
  isMinuteInWindow,
  WEEKDAY_LABELS,
} from './time';
import type {
  ActorDef,
  ActorSchedule,
  ActorScheduleOverride,
  Weekday,
} from './types';

export type ResolvedSchedule = ActorSchedule & {
  source: 'weekly' | 'override';
};

export type WeeklyScheduleDay = {
  weekday: Weekday;
  label: string;
  slots: ActorSchedule[];
};

function matchesWeekday(entry: ActorSchedule, weekday: Weekday): boolean {
  return !entry.weekdays || entry.weekdays.length === 0
    ? true
    : entry.weekdays.includes(weekday);
}

function toResolved(
  entry: ActorSchedule,
  source: ResolvedSchedule['source'],
): ResolvedSchedule {
  return { ...entry, source };
}

function fromOverride(
  entry: ActorScheduleOverride,
  source: ResolvedSchedule['source'],
): ResolvedSchedule {
  return {
    fromMinute: entry.fromMinute ?? 0,
    toMinute: entry.toMinute ?? 24 * 60,
    locationId: entry.locationId,
    label: entry.label,
    priority: source === 'override' ? 1000 : undefined,
    source,
  };
}

function sortSlots(slots: ResolvedSchedule[]): ResolvedSchedule[] {
  return [...slots].sort(
    (a, b) =>
      (b.priority ?? 0) - (a.priority ?? 0) ||
      b.fromMinute - a.fromMinute,
  );
}

function sortChronological(
  slots: ResolvedSchedule[],
): ResolvedSchedule[] {
  return [...slots].sort(
    (a, b) =>
      a.fromMinute - b.fromMinute ||
      (b.priority ?? 0) - (a.priority ?? 0),
  );
}

export function getSchedulesForDay(
  actor: ActorDef,
  day: number,
): ResolvedSchedule[] {
  const weekday = getWeekdayFromDay(day);
  const overrides = (actor.overrides ?? [])
    .filter((entry) => entry.day === day)
    .map((entry) => fromOverride(entry, 'override'));
  const weekly = actor.schedule
    .filter((entry) => matchesWeekday(entry, weekday))
    .map((entry) => toResolved(entry, 'weekly'));

  return sortSlots([...overrides, ...weekly]);
}

export function getScheduleSlot(
  actor: ActorDef,
  absoluteMinutes: number,
): ResolvedSchedule | undefined {
  const day = getDay(absoluteMinutes);
  return getSchedulesForDay(actor, day).find((entry) =>
    isMinuteInWindow(absoluteMinutes, entry),
  );
}

export function getWeeklySchedule(actor: ActorDef): WeeklyScheduleDay[] {
  const weekdays: Weekday[] = [1, 2, 3, 4, 5, 6, 0];
  return weekdays.map((weekday) => ({
    weekday,
    label: WEEKDAY_LABELS[weekday] ?? '',
    slots: sortChronological(
      actor.schedule
        .filter((entry) => matchesWeekday(entry, weekday))
        .map((entry) => toResolved(entry, 'weekly')),
    ),
  }));
}
