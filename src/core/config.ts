export const MINUTES_PER_DAY = 1440;
export const START_MINUTE = 8 * 60;
export const MAX_DEBUG_DAY = 30;

// Day 1 starts on this date. The calendar is derived, so old saves do not
// need a schema change.
export const CALENDAR_START = {
  year: 2026,
  month: 4,
  day: 6,
} as const;

export const SLEEP_UNTIL_MINUTE = 8 * 60;
export const ACTOR_AFFINITY_MAX = 20;
