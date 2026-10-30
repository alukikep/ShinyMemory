import { describe, expect, it } from 'vitest';
import { buildJobBoard } from './scene';
import { acceptJob, advanceTime, attendJob, handleCommand, newGame } from './sim';
import { getDay } from './time';
import type { GameState } from './types';

/**
 * 同一天派两个人出去工作。
 *
 * 这是多偶像设计的最后一块：`JobAssignment` 带 `idolId`，
 * `canReplaceDay` 按**单个偶像**判断，所以两个人在同一天各接一份工作应当成立，
 * 而且制作人得跑两场（每场都在自己的时间窗内到场）。
 *
 * 夹具里只有周日（第 7 天）的档期可以被工作替换，两个人的空档正好重合；
 * 两份工作的时间窗也不重叠（10:00–16:00 / 19:00–22:00）。
 */

const DAY = 7;

function setup(): GameState {
  const state = newGame(7);
  state.pendingDialogueId = undefined;
  state.dialogueNodeId = undefined;
  state.locationId = 'office';
  state.clock.absoluteMinutes = 9 * 60;
  state.phase = 'plan';
  state.idols.mano!.status = 'recruited';
  state.idols.hiori!.status = 'recruited';
  return state;
}

/** 把可能弹出的对话/事件走完，回到安排页。 */
function settleToPlan(state: GameState): GameState {
  let current = state;
  for (let index = 0; index < 8 && current.phase !== 'plan'; index += 1) {
    if (current.phase === 'event') {
      current = handleCommand(current, { type: 'eventChoice', index: 0 });
    } else if (
      current.phase === 'eventResult' ||
      current.phase === 'activityResult'
    ) {
      current = handleCommand(current, { type: 'continue' });
    } else {
      break;
    }
  }
  return current;
}

describe('two idols working the same day', () => {
  it('accepts one job per idol on the same day', () => {
    let state = setup();

    state = acceptJob(state, 'job_magazine', DAY, 'mano');
    state = acceptJob(state, 'job_radio', DAY, 'hiori');

    expect(state.jobs).toHaveLength(2);
    expect(state.jobs.map((job) => job.idolId).sort()).toEqual([
      'hiori',
      'mano',
    ]);

    // 两个人的日程各自被顶掉一次，互不影响。
    expect(state.actors.mano.scheduleOverrides).toHaveLength(1);
    expect(state.actors.hiori.scheduleOverrides).toHaveLength(1);
    expect(state.actors.mano.scheduleOverrides?.[0]?.day).toBe(DAY);
    expect(state.actors.hiori.scheduleOverrides?.[0]?.day).toBe(DAY);
  });

  it('locks each job while it is assigned, so nobody else can take it', () => {
    let state = setup();
    state = acceptJob(state, 'job_magazine', DAY, 'mano');

    const board = buildJobBoard(state);
    const magazine = board.entries.find(
      (entry) => entry.jobId === 'job_magazine',
    );
    const radio = board.entries.find((entry) => entry.jobId === 'job_radio');

    expect(magazine?.busyReason).toBe('已派出');
    expect(magazine?.offers).toHaveLength(0);
    // 另一份工作不受影响，两个偶像都还能接。
    expect(radio?.busyReason).toBeUndefined();
    expect(radio?.offers).toHaveLength(2);
  });

  it('lets the producer attend both, one after the other', () => {
    let state = setup();
    state = acceptJob(state, 'job_magazine', DAY, 'mano');
    state = acceptJob(state, 'job_radio', DAY, 'hiori');
    const [magazine, radio] = state.jobs;
    const beforeMoney = state.money;

    // 上午：杂志（10:00–16:00）
    state.clock.absoluteMinutes = (DAY - 1) * 1440 + 10 * 60;
    state.locationId = 'studio';
    state.selectedIdolId = 'mano';
    state = settleToPlan(attendJob(state, magazine!.id));

    // 只剩电台那一份，而且是 hiori 的。
    expect(state.jobs).toHaveLength(1);
    expect(state.jobs[0]?.id).toBe(radio!.id);
    expect(state.jobs[0]?.idolId).toBe('hiori');

    // 19:00 电台（19:00–22:00）
    state = advanceTime(state, 3 * 60);
    expect(getDay(state.clock.absoluteMinutes)).toBe(DAY);
    state.locationId = 'studio';
    state.selectedIdolId = 'hiori';
    state = settleToPlan(attendJob(state, radio!.id));

    expect(state.jobs).toHaveLength(0);
    // 两份报酬都到账：¥1,200 + ¥1,800
    expect(state.money).toBe(beforeMoney + 1200 + 1800);
    // 两个人的属性各自涨了。
    expect(state.idols.mano!.stats.expression.exp).toBeGreaterThan(0);
    expect(state.idols.hiori!.stats.expression.exp).toBeGreaterThan(0);
  });
});
