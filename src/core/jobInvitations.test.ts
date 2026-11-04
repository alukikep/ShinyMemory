import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CONTENT_INDEX } from './contentIndex';
import { dailyJobInvitations, visibleJobInvitationIds, refreshJobInvitations, canRefreshJobInvitations } from './jobInvitations';
import { acceptJob, advanceTime, cancelJob, handleCommand, newGame } from './sim';
import { buildJobBoard } from './scene';
import { createSaveEnvelope, migrateSave } from '../save/save';
import { parseSaveText } from '../save/transfer';
import { SAVE_VERSION } from '../save/version';
import type { JobDef } from './types';

const originalJobs = new Map(CONTENT_INDEX.jobs);
const template = [...originalJobs.values()][0]!;
beforeEach(() => {
  CONTENT_INDEX.jobs.clear();
  for (let i = 0; i < 8; i++) CONTENT_INDEX.jobs.set(`daily.${i}`, {
    ...template, id: `daily.${i}`, name: `邀约${i}`, requires: [], hiddenUntilUnlocked: false, cooldownDays: 2,
  });
});
afterEach(() => {
  CONTENT_INDEX.jobs.clear();
  for (const [id, job] of originalJobs) CONTENT_INDEX.jobs.set(id, job);
});

function setup() {
  const state = newGame(37);
  state.pendingDialogueId = undefined;
  state.phase = 'plan' as const;
  state.locationId = 'office';
  state.idols.mano!.status = 'recruited';
  return state;
}

describe('daily job invitations', () => {
  it('draws five unique stable invitations without changing the gameplay RNG', () => {
    const state = setup();
    const before = structuredClone(state);
    expect(visibleJobInvitationIds(state)).toHaveLength(5);
    expect(new Set(visibleJobInvitationIds(state)).size).toBe(5);
    expect(buildJobBoard(state).entries.map((row) => row.jobId)).toEqual(visibleJobInvitationIds(state));
    expect(state).toEqual(before);
    state.rng.counter += 100;
    state.focusIdolId = 'hiori';
    expect(dailyJobInvitations(state)).toEqual(before.jobInvitations);
  });

  it('excludes occupied, cooling and story-hidden jobs and respects the cooldown boundary', () => {
    const state = setup();
    state.jobInvitations = undefined;
    state.jobCooldowns['daily.0'] = 1;
    state.jobs = [{ id: 'occupied', jobId: 'daily.1', idolId: 'mano', day: 4, fromMinute: 600, toMinute: 720, locationId: 'studio' }];
    const hidden = CONTENT_INDEX.jobs.get('daily.2')!;
    CONTENT_INDEX.jobs.set(hidden.id, { ...hidden, hiddenUntilUnlocked: true, requires: [{ kind: 'flag', key: 'daily.unlock' }] });
    expect(dailyJobInvitations(state).jobIds.sort()).toEqual(['daily.3', 'daily.4', 'daily.5', 'daily.6', 'daily.7']);
    state.clock.absoluteMinutes = 2 * 1440;
    for (let i = 3; i < 8; i++) CONTENT_INDEX.jobs.delete(`daily.${i}`);
    expect(visibleJobInvitationIds(state)).toEqual(['daily.0']);
    state.flags['daily.unlock'] = true;
    expect(new Set(visibleJobInvitationIds(state))).toEqual(new Set(['daily.0', 'daily.2']));
  });

  it('refreshes once, prioritizes unseen jobs, and leaves time, money, assignments and RNG intact', () => {
    const state = setup();
    const previous = dailyJobInvitations(state).jobIds;
    const fresh = [...CONTENT_INDEX.jobs.keys()].filter((id) => !previous.includes(id));
    const next = handleCommand(state, { type: 'refreshJobInvitations' });
    expect(next.jobInvitations?.refreshed).toBe(true);
    expect(next.jobInvitations?.jobIds).toHaveLength(5);
    expect(next.jobInvitations?.jobIds.slice(0, fresh.length).sort()).toEqual(fresh.sort());
    expect(next.clock).toEqual(state.clock);
    expect(next.money).toBe(state.money);
    expect(next.jobs).toEqual(state.jobs);
    expect(next.rng).toEqual(state.rng);
    expect(refreshJobInvitations(next)).toBe(next);
    const tomorrow = advanceTime(next, 1440);
    expect(tomorrow.jobInvitations?.day).toBe(2);
    expect(tomorrow.jobInvitations?.refreshed).toBe(false);
    expect(canRefreshJobInvitations(tomorrow)).toBe(true);
  });

  it('does not spend a refresh when the pool is small or the command is out of context', () => {
    const state = setup();
    const away = { ...state, locationId: 'home' };
    expect(canRefreshJobInvitations(away)).toBe(false);
    expect(refreshJobInvitations(away)).toBe(away);
    const dialogue = { ...state, pendingDialogueId: 'dialogue' };
    expect(canRefreshJobInvitations(dialogue)).toBe(false);
    expect(refreshJobInvitations(dialogue)).toBe(dialogue);
    for (const id of [...CONTENT_INDEX.jobs.keys()]) if (!state.jobInvitations!.jobIds.includes(id)) CONTENT_INDEX.jobs.delete(id);
    expect(refreshJobInvitations(state)).toBe(state);
    expect(state.jobInvitations?.refreshed).toBe(false);
    state.locationId = 'home';
    expect(refreshJobInvitations(state)).toBe(state);
    state.locationId = 'office';
    state.pendingDialogueId = 'dialogue';
    expect(refreshJobInvitations(state)).toBe(state);
    CONTENT_INDEX.jobs.clear();
    state.jobInvitations = undefined;
    expect(visibleJobInvitationIds(state)).toEqual([]);
  });

  it('enforces invitations and full requirements in the command, and cancels without refilling', () => {
    const state = setup();
    const selected = state.jobInvitations!.jobIds[0]!;
    const missing = [...CONTENT_INDEX.jobs.keys()].find((id) => !state.jobInvitations!.jobIds.includes(id))!;
    expect(acceptJob(state, missing, 7, 'mano')).toBe(state);
    const job: JobDef = { ...CONTENT_INDEX.jobs.get(selected)!, requires: [{ kind: 'flag', key: 'daily.allowed' }] };
    CONTENT_INDEX.jobs.set(selected, job);
    expect(acceptJob(state, selected, 7, 'mano')).toBe(state);
    state.flags['daily.allowed'] = true;
    const accepted = acceptJob(state, selected, 7, 'mano');
    expect(accepted.jobs).toHaveLength(1);
    expect(visibleJobInvitationIds(accepted)).toHaveLength(4);
    expect(accepted.jobInvitations).toEqual(state.jobInvitations);
    const cancelled = cancelJob(accepted, accepted.jobs[0]!.id);
    expect(cancelled.jobs).toHaveLength(0);
    expect(visibleJobInvitationIds(cancelled)).toEqual(visibleJobInvitationIds(state));
  });

  it('snapshots opening and never replaces an assigned job when refreshing', () => {
    const state = setup();
    const selected = state.jobInvitations!.jobIds[0]!;
    const accepted = acceptJob(state, selected, 7, 'mano');
    expect(accepted.jobs).toHaveLength(1);
    const refreshed = refreshJobInvitations(accepted);
    expect(refreshed.jobs).toEqual(accepted.jobs);
    expect(refreshed.actors).toEqual(accepted.actors);
    expect(refreshed.jobInvitations?.jobIds).not.toContain(selected);
    expect(visibleJobInvitationIds(refreshed)).toHaveLength(5);
    const cancelled = cancelJob(refreshed, refreshed.jobs[0]!.id);
    expect(visibleJobInvitationIds(cancelled)).not.toContain(selected);
    expect(canRefreshJobInvitations(cancelled)).toBe(false);
    const opened = handleCommand(cancelled, { type: 'openJobBoard' });
    expect(opened.jobInvitations).toEqual(refreshed.jobInvitations);
    expect(opened).not.toBe(cancelled);
    expect(opened.log).toEqual(cancelled.log);
  });

  it('persists current invitations and migrates v19 without resetting progress', () => {
    const state = refreshJobInvitations(setup());
    const loaded = parseSaveText(JSON.stringify(createSaveEnvelope(state)));
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) throw new Error(loaded.reason);
    expect(loaded.envelope.state.jobInvitations).toEqual(state.jobInvitations);
    expect(canRefreshJobInvitations(loaded.envelope.state)).toBe(false);
    const old = createSaveEnvelope(state);
    old.schemaVersion = 19;
    delete old.state.jobInvitations;
    old.state.jobs = [{ id: 'legacy-assignment', jobId: 'daily.0', idolId: 'mano', day: 7, fromMinute: 600, toMinute: 720, locationId: 'studio' }];
    old.state.jobCooldowns = { 'daily.1': 1 };
    const migrated = migrateSave(old);
    expect(migrated.schemaVersion).toBe(SAVE_VERSION);
    expect(migrated.state.jobInvitations?.jobIds).toHaveLength(5);
    expect(migrated.state.jobInvitations?.refreshed).toBe(false);
    expect(migrated.state.money).toBe(state.money);
    expect(migrated.state.clock).toEqual(state.clock);
    expect(migrated.state.jobs).toEqual(old.state.jobs);
    expect(migrated.state.jobCooldowns).toEqual(old.state.jobCooldowns);
    expect(migrated.state.jobInvitations?.jobIds).not.toContain('daily.0');
    expect(migrated.state.jobInvitations?.jobIds).not.toContain('daily.1');
  });
});
