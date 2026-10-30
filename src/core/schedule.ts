import {
  getCalendarDateFromDay,
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
import type { CalendarDate } from './time';

export type ResolvedSchedule = ActorSchedule & {
  /** story = 派生的剧情日，不写进存档。 */
  source: 'weekly' | 'override' | 'story';
  dynamic?: boolean;
  mode?: 'add' | 'replace-day';
};

export type WeeklyScheduleDay = {
  weekday: Weekday;
  label: string;
  slots: ActorSchedule[];
};

export type ScheduleDayView = {
  day: number;
  date: CalendarDate;
  weekday: Weekday;
  weekdayLabel: string;
  slots: ResolvedSchedule[];
  isToday: boolean;
  hasOverride: boolean;
};

export type DayReplacementCheck =
  | { ok: true }
  | {
      ok: false;
      reason: 'override' | 'protected';
      conflicts: ResolvedSchedule[];
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
  dynamic: boolean,
): ResolvedSchedule {
  return {
    fromMinute: entry.fromMinute ?? 0,
    toMinute: entry.toMinute ?? 24 * 60,
    locationId: entry.locationId,
    label: entry.label,
    visibility: entry.visibility,
    priority: 1000,
    source: 'override',
    dynamic,
    mode: entry.mode,
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

function overridesForDay(
  actor: ActorDef,
  day: number,
  stateOverrides: ActorScheduleOverride[],
): ResolvedSchedule[] {
  return [
    ...(actor.overrides ?? [])
      .filter((entry) => entry.day === day)
      .map((entry) => fromOverride(entry, false)),
    ...stateOverrides
      .filter((entry) => entry.day === day)
      .map((entry) => fromOverride(entry, true)),
  ];
}

export function getSchedulesForDay(
  actor: ActorDef,
  day: number,
  stateOverrides: ActorScheduleOverride[] = [],
  /** 派生日程（例如剧情日）。不写进存档，只影响显示与判定。 */
  extraSlots: ResolvedSchedule[] = [],
): ResolvedSchedule[] {
  const weekday = getWeekdayFromDay(day);
  const overrides = overridesForDay(actor, day, stateOverrides);
  const replaceDay =
    overrides.some((entry) => entry.mode === 'replace-day') ||
    extraSlots.some((entry) => entry.mode === 'replace-day');

  const weekly = replaceDay
    ? []
    : actor.schedule
        .filter((entry) => matchesWeekday(entry, weekday))
        .map((entry) => toResolved(entry, 'weekly'));

  const extras = extraSlots;
  return sortSlots([...extras, ...overrides, ...weekly]);
}

export function getScheduleSlot(
  actor: ActorDef,
  absoluteMinutes: number,
  stateOverrides: ActorScheduleOverride[] = [],
): ResolvedSchedule | undefined {
  const day = getDay(absoluteMinutes);
  return getSchedulesForDay(actor, day, stateOverrides).find((entry) =>
    isMinuteInWindow(absoluteMinutes, entry),
  );
}

export function getScheduleWindow(
  actor: ActorDef,
  startDay: number,
  count = 7,
  stateOverrides: ActorScheduleOverride[] = [],
  extraSlotsByDay: (day: number) => ResolvedSchedule[] = () => [],
): ScheduleDayView[] {
  return Array.from({ length: count }, (_, index) => {
    const day = startDay + index;
    const weekday = getWeekdayFromDay(day);
    const extraSlots = extraSlotsByDay(day);
    return {
      day,
      date: getCalendarDateFromDay(day),
      weekday,
      weekdayLabel: WEEKDAY_LABELS[weekday] ?? '',
      slots: sortChronological(
        getSchedulesForDay(actor, day, stateOverrides, extraSlots),
      ),
      isToday: index === 0,
      hasOverride:
        (actor.overrides ?? []).some((entry) => entry.day === day) ||
        stateOverrides.some((entry) => entry.day === day) ||
        extraSlots.length > 0,
    };
  });
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

export function canReplaceDay(
  actor: ActorDef,
  day: number,
  stateOverrides: ActorScheduleOverride[] = [],
): DayReplacementCheck {
  const existingOverrides = overridesForDay(actor, day, stateOverrides);
  if (existingOverrides.length > 0) {
    return {
      ok: false,
      reason: 'override',
      conflicts: existingOverrides,
    };
  }

  const weekday = getWeekdayFromDay(day);
  const protectedSlots = actor.schedule
    .filter((entry) => matchesWeekday(entry, weekday))
    .filter((entry) => entry.protected !== false)
    .map((entry) => toResolved(entry, 'weekly'));

  if (protectedSlots.length > 0) {
    return {
      ok: false,
      reason: 'protected',
      conflicts: protectedSlots,
    };
  }

  return { ok: true };
}
