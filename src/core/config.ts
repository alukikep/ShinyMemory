export const MINUTES_PER_DAY = 1440;
export const START_MINUTE = 8 * 60;
/**
 * 调试跳转（`?debug=1` 的 jumpTo）最多能跳到第几天。
 *
 * 原来是 30，但コメティック 的入所顺序是一条长链——
 * 致敬演出 → ルカ 门口三步 → 羽那 四步（还要跨"等她毕业"的 10 天），
 * E2E 到"宿舍"那一步已经要第 31 天，被夹回 30 → 目标行动不出现、白等超时。
 * 放到 60：够走完最后一个角色的链，也不至于让调试面板能跳到离谱的地方。
 */
export const MAX_DEBUG_DAY = 60;

// Day 1 starts on this date. The calendar is derived, so old saves do not
// need a schema change.
export const CALENDAR_START = {
  year: 2026,
  month: 4,
  day: 6,
} as const;

export const SLEEP_UNTIL_MINUTE = 8 * 60;
export const ACTOR_AFFINITY_MAX = 20;

/** 聊两句：每次花一点时间，每天有次数上限。 */
export const CHAT_MINUTES = 15;
export const CHAT_DAILY_LIMIT = 3;
