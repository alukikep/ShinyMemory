import { afterEach, describe, expect, it } from 'vitest';
import { CONTENT_INDEX } from './contentIndex';
import { buildJobBoard } from './scene';
import { newGame } from './sim';
import type { GameState, JobDef } from './types';

const JOB_ID = 'test.job.story_gated';
const FLAG = 'unlocked.test_story_job';

const job: JobDef = {
  id: JOB_ID,
  name: '剧情解锁的工作',
  description: '',
  locationId: 'studio',
  fromMinute: 10 * 60,
  toMinute: 12 * 60,
  pay: 800,
  requires: [{ kind: 'flag', key: FLAG }],
};

afterEach(() => {
  CONTENT_INDEX.jobs.delete(JOB_ID);
});

function setup(): GameState {
  const state = newGame(1);
  state.pendingDialogueId = undefined;
  state.dialogueNodeId = undefined;
  state.idols.mano!.status = 'recruited';
  state.locationId = 'office';
  state.clock.absoluteMinutes = 9 * 60;
  state.phase = 'plan';
  return state;
}

describe('story-gated jobs', () => {
  it('stays locked until the flag is set, then becomes assignable', () => {
    CONTENT_INDEX.jobs.set(JOB_ID, job);

    const locked = setup();
    const before = buildJobBoard(locked).entries.find(
      (entry) => entry.jobId === JOB_ID,
    );
    expect(before?.locked).toBe(true);
    expect(before?.offers).toHaveLength(0);

    // 剧情步骤的 effects 里写 { kind: 'flag', key: FLAG, value: true }
    locked.flags[FLAG] = true;
    const after = buildJobBoard(locked).entries.find(
      (entry) => entry.jobId === JOB_ID,
    );
    expect(after?.locked).toBe(false);
    expect(after?.offers).toHaveLength(1);
    expect(after?.offers[0]?.command?.type).toBe('acceptJob');
  });
});
