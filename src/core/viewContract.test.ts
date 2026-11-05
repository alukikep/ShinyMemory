import { describe, expect, it } from 'vitest';
import { CONTENT_INDEX } from './contentIndex';
import { buildJobBoard } from './scene';
import { buildHandbook } from './handbook';
import { newGame } from './sim';
import { buildDatePhone } from './dateAppointments';
import type { GameState } from './types';

/**
 * 视图契约：界面读的字段必须真的存在于对象上。
 *
 * **为什么需要这个**：`busyReason` 曾经在重构 `JobBoardEntry` 字面量时被顺手删掉。
 * 它是可选字段，`tsc` 不报错；界面只是少一个「已派出」标签，
 * 所有测试也照常绿——直到写多偶像测试时才发现。
 *
 * 这里断言的是 `Object.keys`，不是值：字段可以缺席语义（undefined），
 * 但**不能从对象上消失**。
 */

function setup(): GameState {
  const state = newGame(1);
  state.pendingDialogueId = undefined;
  state.dialogueNodeId = undefined;
  state.locationId = 'office';
  state.clock.absoluteMinutes = 9 * 60;
  state.phase = 'plan';
  state.idols.mano!.status = 'recruited';
  return state;
}

describe('view contracts', () => {
  it('keeps every field the date phone reads, including disabled-time reasons', () => {
    const view = buildDatePhone(setup(), CONTENT_INDEX, () => false);
    expect(Object.keys(view)).toEqual(['entries']);
    expect(view.entries.length).toBeGreaterThan(0);
    expect(Object.keys(view.entries[0])).toEqual(expect.arrayContaining(['scenarioId', 'idolId', 'idolName', 'locationName', 'title', 'fee', 'durationMinutes', 'arrivalWindowMinutes', 'penaltyTier', 'times']));
    expect(Object.keys(view.entries[0].times[0])).toEqual(expect.arrayContaining(['fromMinute', 'available', 'reason']));
  });
  it('keeps every field the job board UI reads', () => {
    const board = buildJobBoard(setup());
    expect(board.entries.length).toBeGreaterThan(0);
    expect(Object.keys(board)).toEqual(
      expect.arrayContaining(['entries', 'focusIdolId', 'slots', 'invitations']),
    );
    expect(Object.keys(board.invitations)).toEqual(expect.arrayContaining(['count', 'limit', 'refreshed', 'canRefresh']));
    expect(Object.keys(board.slots)).toEqual(
      expect.arrayContaining(['used', 'cap', 'full']),
    );

    for (const entry of board.entries) {
      expect(Object.keys(entry)).toEqual(
        expect.arrayContaining([
          'jobId',
          'name',
          'description',
          'locationName',
          'timeLabel',
          'pay',
          'checkText',
          'checkStat',
          'locked',
          'lockedReason',
          'busyReason',
          'offers',
        ]),
      );
    }

    for (const offer of board.entries[0]!.offers) {
      expect(Object.keys(offer)).toEqual(
        expect.arrayContaining([
          'idolId',
          'idolName',
          'day',
          'dayLabel',
          'chance',
          'checkLabel',
          'command',
          'dates',
          'occupiedBy',
        ]),
      );
    }
  });

  it('keeps every field the handbook UI reads', () => {
    const state = setup();
    // 手册只显示"已经开过头的链"，所以先手动标记一条链为进行中。
    const chainId = [...CONTENT_INDEX.storyChains.keys()][0];
    if (!chainId) throw new Error('夹具里没有剧情链');
    state.storyChains[chainId] = { chainId, stepIndex: 0 };
    const view = buildHandbook(state);
    expect(Object.keys(view)).toEqual(expect.arrayContaining(['active', 'leads', 'recruitment', 'archive', 'slots']));
    expect(Object.keys(view.slots)).toEqual(expect.arrayContaining(['used', 'limit']));
    const entries = [...view.active, ...view.leads, ...view.recruitment, ...view.archive];
    expect(entries.length).toBeGreaterThan(0);

    for (const entry of entries) {
      expect(Object.keys(entry)).toEqual(
        expect.arrayContaining([
          'id',
          'title',
          'idolId',
          'idolName',
          'status',
          'locationName',
          'timeWindowText',
          'reason',
          'earliestDay',
          'daysLeft',
          'opensLaterToday',
          'steps',
        ]),
      );
    }
  });
});
