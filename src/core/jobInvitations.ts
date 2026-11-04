import { CONTENT_INDEX } from './contentIndex';
import { checkCondition } from './sim';
import { Rng } from './rng';
import { getDay } from './time';
import type { Condition, GameState, JobDef } from './types';

export const DAILY_JOB_LIMIT = 5;

export function jobConditionIsIdolScoped(condition: Condition): boolean {
  if ('idolId' in condition && condition.idolId) return false;
  if (condition.kind === 'all' || condition.kind === 'any') return condition.of.some(jobConditionIsIdolScoped);
  if (condition.kind === 'not') return jobConditionIsIdolScoped(condition.of);
  if (condition.kind === 'attributeAtLeast' || condition.kind === 'attributeAtMost') {
    return typeof condition.ref === 'string' || condition.ref.scope === 'idol';
  }
  return condition.kind === 'castPresent';
}

export function jobIsRevealed(state: GameState, job: JobDef): boolean {
  return !job.hiddenUntilUnlocked || (job.requires ?? [])
    .filter((condition) => !jobConditionIsIdolScoped(condition))
    .every((condition) => checkCondition(condition, state));
}

export function jobIsAvailable(state: GameState, job: JobDef): boolean {
  const completed = state.jobCooldowns[job.id];
  return jobIsRevealed(state, job) &&
    !state.jobs.some((assignment) => assignment.jobId === job.id) &&
    (completed === undefined || getDay(state.clock.absoluteMinutes) >= completed + (job.cooldownDays ?? 0));
}

function candidates(state: GameState): string[] {
  return [...CONTENT_INDEX.jobs.values()].filter((job) => jobIsAvailable(state, job))
    .map((job) => job.id).sort();
}

function draw(ids: string[], rng: Rng): string[] {
  const pool = [...ids];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = rng.int(i + 1);
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return pool;
}

/** Pure projection, with a separate daily RNG so opening a panel never consumes gameplay RNG. */
export function dailyJobInvitations(state: GameState): NonNullable<GameState['jobInvitations']> {
  const day = getDay(state.clock.absoluteMinutes);
  if (state.jobInvitations?.day === day) return state.jobInvitations;
  return {
    day,
    jobIds: draw(candidates(state), new Rng((state.rng.seed ^ Math.imul(day, 0x9e3779b9)) >>> 0)).slice(0, DAILY_JOB_LIMIT),
    refreshed: false,
  };
}

export function visibleJobInvitationIds(state: GameState): string[] {
  return dailyJobInvitations(state).jobIds.filter((id) => {
    const job = CONTENT_INDEX.jobs.get(id);
    return job && jobIsAvailable(state, job);
  });
}

export function canRefreshJobInvitations(state: GameState): boolean {
  const current = dailyJobInvitations(state);
  return state.phase === 'plan' && !state.pendingDialogueId && state.locationId === 'office' &&
    !current.refreshed && candidates(state).some((id) => !current.jobIds.includes(id));
}

export function refreshJobInvitations(state: GameState): GameState {
  if (!canRefreshJobInvitations(state)) return state;
  const next = structuredClone(state);
  const current = dailyJobInvitations(state);
  const rng = new Rng((state.rng.seed ^ Math.imul(current.day, 0x85ebca6b)) >>> 0);
  const pool = candidates(state);
  const fresh = draw(pool.filter((id) => !current.jobIds.includes(id)), rng);
  const retained = draw(pool.filter((id) => current.jobIds.includes(id)), rng);
  next.jobInvitations = { day: current.day, jobIds: [...fresh, ...retained].slice(0, DAILY_JOB_LIMIT), refreshed: true };
  return next;
}
