import type { ContentIndex } from './contentIndexCore';
import type { DateScenarioDef, GameState } from './types';
import { canReplaceDay } from './schedule';
import { getDay } from './time';
import { walkPath, walkEdge } from './content/map';
import { validateDateScenario } from './dateValidation';

export const DATE_MIN_LEAD = 30;
export const DATE_LATEST_END = 22 * 60;
export type DateBookingCheck = { ok: true } | { ok: false; reason: string };
export type DatePhoneView = { entries: { scenarioId: string; idolId: string; idolName: string; locationName: string; title: string;
  fee: number; durationMinutes: number; arrivalWindowMinutes: number; penaltyTier: number;
  times: { fromMinute: number; available: boolean; reason?: string }[] }[] };

export function dateOccupiesDay(state: GameState, idolId: string, day: number): boolean {
  return state.dateAppointment?.idolId === idolId && state.dateAppointment.day === day;
}

export function evaluateDateBooking(state: GameState, scenario: DateScenarioDef | undefined, fromMinute: number,
  index: ContentIndex, storyBlocked: (idolId: string, day: number) => boolean = () => false): DateBookingCheck {
  const deny = (reason: string): DateBookingCheck => ({ ok: false, reason });
  if (state.phase !== 'plan' || state.pendingDialogueId || state.flags.forced_rest || state.locationId !== 'home') return deny('只能在家中空闲时拨打电话');
  const day = getDay(state.clock.absoluteMinutes);
  if (state.dateBookedDay === day || state.dateAppointment?.day === day || state.dateAppointment?.status === 'inProgress') return deny('今天已经预约过约会');
  if (!scenario || validateDateScenario(scenario, index).length) return deny('约会内容尚未接入或配置无效');
  const actor = index.actors.get(scenario.idolId);
  if (!actor || !state.actors[scenario.idolId] || state.idols[scenario.idolId]?.status !== 'recruited') return deny('需要先招募这位偶像');
  if (state.money < scenario.fee) return deny('金钱不足');
  if (!Number.isInteger(fromMinute) || fromMinute % 60 !== 0 || fromMinute < 0 || fromMinute + scenario.arrivalWindowMinutes + scenario.durationMinutes > DATE_LATEST_END) return deny('请选择有效的当天整点时段');
  const now = state.clock.absoluteMinutes - (day - 1) * 1440;
  const path = walkPath(index.walkEdges, 'home', scenario.locationId);
  const travelMinutes = path.slice(1).reduce((total, id, n) => total + (walkEdge(index.walkEdges, path[n], id)?.minutes ?? Infinity), 0);
  if (path.length < 2 || path.some(id => index.locations.get(id)?.reachable === false)) return deny('该地点无法从家步行到达');
  if (fromMinute - now < Math.max(DATE_MIN_LEAD, travelMinutes)) return deny('预约时间过近，需预留出行时间');
  if (state.jobs.some(job => job.idolId === scenario.idolId && job.day === day)) return deny('当天已有工作');
  if (storyBlocked(scenario.idolId, day)) return deny('当天有剧情安排');
  const replace = canReplaceDay(actor, day, state.actors[actor.id]?.scheduleOverrides);
  if (!replace.ok) return deny(replace.reason === 'protected' ? '当天有受保护日程' : '当天已有日程覆盖');
  return { ok: true };
}

export function buildDatePhone(state: GameState, index: ContentIndex, storyBlocked: (idolId: string, day: number) => boolean): DatePhoneView {
  return { entries: [...index.dateScenarios.values()].map(s => ({ scenarioId: s.id, idolId: s.idolId,
    idolName: index.idols.get(s.idolId)?.name ?? s.idolId, locationName: index.locations.get(s.locationId)?.name ?? s.locationId,
    title: s.title, fee: s.fee, durationMinutes: s.durationMinutes, arrivalWindowMinutes: s.arrivalWindowMinutes, penaltyTier: s.penaltyTier,
    times: Array.from({ length: 22 }, (_, n) => n * 60).filter(start => start + s.arrivalWindowMinutes + s.durationMinutes <= DATE_LATEST_END).map(fromMinute => {
      const result = evaluateDateBooking(state, s, fromMinute, index, storyBlocked);
      return { fromMinute, available: result.ok, reason: result.ok ? undefined : result.reason };
    }),
  })) };
}

export function canStartDate(state: GameState): boolean {
  const d = state.dateAppointment;
  if (!d || d.status !== 'scheduled' || state.phase !== 'plan' || state.pendingDialogueId || state.flags.forced_rest || state.locationId !== d.locationId) return false;
  const now = state.clock.absoluteMinutes - (d.day - 1) * 1440;
  return now >= d.fromMinute && now < d.arrivalUntilMinute;
}

/** Prevent any command from replacing an already paid day's reservation. Roll back the entire command. */
export function dateScheduleWasOverwritten(before: GameState, after: GameState): boolean {
  const d = before.dateAppointment;
  if (!d || getDay(after.clock.absoluteMinutes) > d.day) return false;
  const overrides = after.actors[d.idolId]?.scheduleOverrides ?? [];
  return overrides.some(o => o.day === d.day && o.id !== d.id)
    || !overrides.some(o => o.id === d.id && o.day === d.day && o.locationId === d.locationId && o.fromMinute === d.fromMinute && o.toMinute === d.toMinute && o.mode === 'replace-day');
}
