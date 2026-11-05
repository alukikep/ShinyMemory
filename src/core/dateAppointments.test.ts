import { afterEach, describe, expect, it } from 'vitest';
import { CONTENT_INDEX } from './contentIndex';
import { advanceTime, bookDate, completeDueDates, getActorLocation, handleCommand, newGame, pruneScheduleOverrides, startDate } from './sim';
import { canReplaceDay } from './schedule';
import { buildDatePhone, canStartDate, evaluateDateBooking } from './dateAppointments';
import { validateDateScenario } from './dateValidation';
import { DATE_TEST_SCENARIO as scenario, DATE_TEST_DIALOGUE } from './content-fixture/dateScenarios';
import { createSaveEnvelope, migrateSave } from '../save/save';
import { SAVE_VERSION } from '../save/version';
import { buildScene } from './scene';
import { buildContentInventory } from './contentInventory';
import { occupyingStoryChains } from './storyCapacity';
import { FIXTURE_CONTENT_PACK } from './content-fixture/pack';
import { buildContentIndex } from './contentIndexCore';
import { auditPack } from './contentAudit';
import { PRODUCTION_PACK } from './productionPack';
import type { GameState } from './types';

function ready(): GameState {
  const s = newGame(123);
  s.phase = 'plan'; s.locationId = 'home'; s.clock.absoluteMinutes = 6 * 1440 + 8 * 60;
  s.money = 3000; s.storyChains = {}; s.jobs = []; s.flags.forced_rest = false;
  s.pendingDialogueId = undefined; s.dialogueChainId = undefined;
  s.idols.mano.status = 'recruited'; s.idols.mano.stats.trust = { rank: 'E', exp: 10, maxRank: 'S' };
  s.actors.mano.scheduleOverrides = [];
  return s;
}
const originalEvents = new Map(CONTENT_INDEX.events);
const originalChains = new Map(CONTENT_INDEX.storyChains);
afterEach(() => { CONTENT_INDEX.events = new Map(originalEvents); CONTENT_INDEX.storyChains = new Map(originalChains); });

describe('date appointments', () => {
  it('exposes one shared booking view and atomically pays and replaces the day only once', () => {
    const s = ready();
    const view = buildDatePhone(s, CONTENT_INDEX, () => false);
    expect(view.entries[0]).toMatchObject({ scenarioId: scenario.id, fee: 1000, durationMinutes: 60 });
    expect(view.entries[0].times.find(t => t.fromMinute === 14 * 60)?.available).toBe(true);
    const next = bookDate(s, scenario.id, 14 * 60);
    expect(s.money).toBe(3000);
    expect(next.money).toBe(2000);
    expect(next.dateBookedDay).toBe(7);
    expect(next.dateAppointment).toMatchObject({ status: 'scheduled', arrivalUntilMinute: 870, toMinute: 930, day: 7 });
    expect(next.actors.mano.scheduleOverrides).toEqual([{ id: next.dateAppointment!.id, day: 7, fromMinute: 840, toMinute: 930,
      locationId: 'park', label: '约会预约', visibility: 'public', mode: 'replace-day' }]);
    expect(bookDate(next, scenario.id, 15 * 60)).toBe(next);
    expect(bookDate(s, 'missing', 840)).toBe(s);
  });
  it.each(['money', 'not-home', 'unrecruited', 'past', 'non-hour', 'late', 'protected', 'override', 'job', 'dialogue', 'forced-rest'])(
    'rejects %s without paying or changing state', reason => {
      const s = ready(); let minute = 840;
      if (reason === 'money') s.money = 999;
      if (reason === 'not-home') s.locationId = 'office';
      if (reason === 'unrecruited') s.idols.mano.status = 'known';
      if (reason === 'past') minute = 480;
      if (reason === 'non-hour') minute = 841;
      if (reason === 'late') minute = 1260;
      if (reason === 'protected') s.clock.absoluteMinutes = 8 * 60;
      if (reason === 'override') s.actors.mano.scheduleOverrides = [{ id: 'other', day: 7 }];
      if (reason === 'job') s.jobs = [{ id: 'test', jobId: 'test', idolId: 'mano', day: 7, locationId: 'studio', fromMinute: 600, toMinute: 660 }];
      if (reason === 'dialogue') s.pendingDialogueId = 'other';
      if (reason === 'forced-rest') s.flags.forced_rest = true;
      const before = structuredClone(s);
      expect(bookDate(s, scenario.id, minute)).toBe(s);
      expect(s).toEqual(before);
    });
  it('checks route and story conflicts, not merely future clock values', () => {
    const s = ready();
    const noRoute = { ...CONTENT_INDEX, walkEdges: [] };
    expect(evaluateDateBooking(s, scenario, 840, noRoute)).toEqual({ ok: false, reason: '该地点无法从家步行到达' });
    expect(evaluateDateBooking(s, scenario, 840, CONTENT_INDEX, () => true)).toEqual({ ok: false, reason: '当天有剧情安排' });
    s.clock.absoluteMinutes = 6 * 1440 + 8 * 60 + 45;
    expect(evaluateDateBooking(s, scenario, 540, CONTENT_INDEX)).toEqual({ ok: false, reason: '预约时间过近，需预留出行时间' });
  });
  it('preserves future work overrides when reserving today and after the date day is pruned', () => {
    const s = ready();
    const future = { id: 'future-work', day: 8, fromMinute: 600, toMinute: 660, locationId: 'studio', mode: 'replace-day' as const };
    s.actors.mano.scheduleOverrides = [future];
    s.jobs = [{ id: 'future-work', jobId: 'future', idolId: 'mano', day: 8, fromMinute: 600, toMinute: 660, locationId: 'studio' }];
    const booked = bookDate(s, scenario.id, 840);
    expect(booked.money).toBe(2000);
    expect(booked.actors.mano.scheduleOverrides).toHaveLength(2);
    expect(booked.actors.mano.scheduleOverrides).toContainEqual(future);
    const tomorrow = advanceTime(booked, 1440);
    expect(tomorrow.actors.mano.scheduleOverrides).toEqual([future]);
    expect(tomorrow.jobs).toHaveLength(1);
    expect(getActorLocation(CONTENT_INDEX.actors.get('mano')!, 7 * 1440 + 600, tomorrow.actors.mano.scheduleOverrides)).toBe('studio');
  });
  it('covers the entire day, locates the idol only in the reserved window, and restores the next day', () => {
    const s = bookDate(ready(), scenario.id, 840);
    const actor = CONTENT_INDEX.actors.get('mano')!;
    const location = (minute: number) => getActorLocation(actor, 6 * 1440 + minute, s.actors.mano.scheduleOverrides);
    expect(location(839)).toBeUndefined(); expect(location(840)).toBe('park');
    expect(location(929)).toBe('park'); expect(location(930)).toBeUndefined();
    const tomorrow = advanceTime(s, 24 * 60);
    expect(tomorrow.actors.mano.scheduleOverrides).toEqual([]);
    expect(getActorLocation(actor, 7 * 1440 + 10 * 60, tomorrow.actors.mano.scheduleOverrides)).toBe('practice_room');
  });
  it('rewards the appointment target, survives save/load and completes once without a missed-date penalty', () => {
    let s = bookDate(ready(), scenario.id, 840);
    s = advanceTime(s, 840 - 480 + 29); s.locationId = 'park'; s.selectedIdolId = 'hiori';
    expect(canStartDate(s)).toBe(true);
    const beforeClock = s.clock.absoluteMinutes;
    s = startDate(s, s.dateAppointment!.id);
    expect(s.pendingDateId).toBe(s.dateAppointment!.id);
    s = handleCommand(s, { type: 'dialogueChoice', index: 0 });
    expect(s.idols.mano.stats.trust).toMatchObject({ rank: 'E', exp: 30 });
    expect(s.flags['fixture.date.choiceApplied']).toBe(true);
    s = migrateSave(createSaveEnvelope(s)).state;
    completeDueDates(s);
    expect(s.dateAppointment!.status).toBe('inProgress');
    expect(s.idols.mano.stats.trust.exp).toBe(30);
    s = handleCommand(s, { type: 'dialogueAdvance' });
    expect(s.dateAppointment!.status).toBe('completed');
    expect(s.pendingDateId).toBeUndefined();
    expect(s.clock.absoluteMinutes).toBe(beforeClock + 60);
    expect(s.idols.mano.stats.trust.exp).toBe(30);
    expect(startDate(s, s.dateAppointment!.id)).toBe(s);
    expect(s.actors.mano.scheduleOverrides).toHaveLength(1);
    expect(bookDate({ ...s, locationId: 'home' }, scenario.id, 960).money).toBe(2000);
  });
  it.each([0, 5, 20])('penalizes overdue trust progress %i once without downgrading', exp => {
    let s = bookDate(ready(), scenario.id, 840);
    s.idols.mano.stats.trust.exp = exp;
    s = advanceTime(s, 870 - 480);
    expect(canStartDate({ ...s, locationId: 'park' })).toBe(false);
    expect(s.dateAppointment?.status).toBe('missed');
    expect(s.idols.mano.stats.trust).toMatchObject({ rank: 'E', exp: Math.max(0, exp - 10) });
    expect(s.money).toBe(2000);
    completeDueDates(s); completeDueDates(s);
    expect(s.log.filter(l => l.text.includes('错过了约会'))).toHaveLength(1);
    expect(s.actors.mano.scheduleOverrides).toHaveLength(1);
  });
  it('can settle after coverage pruning across several days and does not charge on reload', () => {
    const s = bookDate(ready(), scenario.id, 840);
    s.idols.mano.stats.trust.exp = 20;
    s.clock.absoluteMinutes += 3 * 1440;
    pruneScheduleOverrides(s);
    completeDueDates(s); completeDueDates(s);
    expect(s.dateAppointment).toBeUndefined(); expect(s.money).toBe(2000);
    expect(s.idols.mano.stats.trust.exp).toBe(10);
    expect(s.log.filter(l => l.text.includes('错过了约会'))).toHaveLength(1);
  });
  it('blocks same-idol story starts and atomically rolls back conflicting event effects', () => {
    CONTENT_INDEX.storyChains.set('date-conflict-story', { id: 'date-conflict-story', idolId: 'mano', revealWhen: [], steps: [{ id: 'first', dialogueId: 'dialogue.hiori.first', locationId: 'park', actionLabel: 'test' }] });
    const unbooked = ready(); unbooked.locationId = 'park'; unbooked.clock.absoluteMinutes = 6 * 1440 + 840;
    expect(handleCommand(unbooked, { type: 'startStory', chainId: 'date-conflict-story' })).not.toBe(unbooked);
    const s = bookDate(ready(), scenario.id, 840);
    s.locationId = 'park'; s.clock.absoluteMinutes = 6 * 1440 + 840;
    expect(handleCommand(s, { type: 'startStory', chainId: 'date-conflict-story' })).toBe(s);
    CONTENT_INDEX.events.set('date-conflict-test', { id: 'date-conflict-test', title: '', text: '', when: [], choices: [{ label: 'overwrite', result: '', effects: [
      { kind: 'money', delta: 500 }, { kind: 'scheduleOverride', actorId: 'mano', dayOffset: 0, locationId: 'studio' },
    ] }] });
    s.phase = 'event'; s.pendingEventId = 'date-conflict-test';
    expect(handleCommand(s, { type: 'eventChoice', index: 0 })).toBe(s);
    expect(s.money).toBe(2000);
  });
  it('shows the phone and appointment action, independently of story slots', () => {
    const s = ready();
    expect(buildScene(s).actions.some(a => a.command.type === 'openDatePhone')).toBe(true);
    let booked = bookDate(s, scenario.id, 840);
    booked.storyChains = { 'hiori-encounter': { chainId: 'hiori-encounter', stepIndex: 0 }, 'meguru-encounter': { chainId: 'meguru-encounter', stepIndex: 0 } };
    expect(occupyingStoryChains(booked)).toHaveLength(2);
    const early = { ...booked, locationId: 'park', clock: { absoluteMinutes: 6 * 1440 + 839 } };
    expect(canStartDate(early)).toBe(false);
    booked = advanceTime(booked, 360); booked.locationId = 'park';
    expect(startDate(booked, 'wrong-id')).toBe(booked);
    expect(buildScene(booked).actions.some(a => a.command.type === 'startDate')).toBe(true);
    expect(canReplaceDay(CONTENT_INDEX.actors.get('mano')!, 7, booked.actors.mano.scheduleOverrides).ok).toBe(false);
  });
  it('initializes version 20 saves and lists scenario/dialogue associations without double-counting actions', () => {
    const envelope = createSaveEnvelope(ready()); envelope.schemaVersion = 20;
    expect(migrateSave(envelope)).toMatchObject({ schemaVersion: SAVE_VERSION, state: { dateAppointment: undefined, dateBookedDay: undefined } });
    const report = buildContentInventory({ pack: FIXTURE_CONTENT_PACK, registeredChains: [], snapshots: [], sources: [] });
    expect(report.dateScenarios[0]).toMatchObject({ id: scenario.id, dialogueId: DATE_TEST_DIALOGUE.id, integrated: true });
    expect(report.idols.find(i => i.id === 'mano')?.counts.dateScenarios).toBe(1);
  });
});

describe('date content validation', () => {
  it('connects invalid and duplicate scenarios to the content gate and keeps synthetic material out of production', () => {
    const index = buildContentIndex({ ...FIXTURE_CONTENT_PACK, dateScenarios: [scenario, { ...scenario, rewardBudget: 0 }] });
    const issues = auditPack(index).filter(issue => issue.code.startsWith('date-'));
    expect(issues).toContainEqual({ level: 'error', code: 'date-duplicate', message: `重复约会方案 ${scenario.id}` });
    expect(issues).toContainEqual({ level: 'error', code: 'date-scenario', message: `${scenario.id}: 对话最大路径奖励超过预算` });
    expect(PRODUCTION_PACK.dateScenarios?.some(s => s.id.startsWith('fixture.'))).toBe(false);
    expect(PRODUCTION_PACK.dialogues.some(d => d.id === DATE_TEST_DIALOGUE.id)).toBe(false);
  });
  it('accepts the synthetic example and rejects invalid references, private places and fees', () => {
    expect(validateDateScenario(scenario, CONTENT_INDEX)).toEqual([]);
    for (const invalid of [{ ...scenario, fee: -1 }, { ...scenario, locationId: 'home' }, { ...scenario, dialogueId: 'missing' }, { ...scenario, durationMinutes: 0 }, { ...scenario, idolId: 'hiori' }]) expect(validateDateScenario(invalid, CONTENT_INDEX).length).toBeGreaterThan(0);
  });
  it('rejects cumulative over-budget paths and reward loops', () => {
    const bad = structuredClone(DATE_TEST_DIALOGUE);
    bad.nodes.end.effects = [{ kind: 'attributeExp', ref: 'trust', tier: 20 }];
    const index = { ...CONTENT_INDEX, dialogues: new Map(CONTENT_INDEX.dialogues) };
    index.dialogues.set(bad.id, bad);
    expect(validateDateScenario(scenario, index)).toContain(`${scenario.id}: 对话最大路径奖励超过预算`);
    bad.nodes.end.nextNodeId = 'start';
    expect(validateDateScenario(scenario, index)).toContain(`${scenario.id}: 约会对话不能循环领取奖励`);
  });
});
