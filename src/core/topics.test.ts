import { afterEach, describe, expect, it } from 'vitest';
import { mergeApprovedContent } from '../review/approval';
import type { ApprovedContent } from './content/approvedPacking';
import { FIXTURE_CONTENT_PACK } from './content-fixture/pack';
import { CONTENT_INDEX, buildContentIndex } from './contentIndex';
import {
  chatRemainingToday,
  chatWith,
  handleCommand,
  newGame,
  talkTo,
} from './sim';
import { buildScene } from './scene';

const TOPIC_ID = 'mano.test_topic';

const approved: ApprovedContent = {
  activities: [],
  events: [],
  jobs: [],
  dialogues: [],
  storyChains: [],
  items: [],
  shops: [],
  topics: [
    {
      id: TOPIC_ID,
      actorId: 'mano',
      label: '测试话题',
      text: '「……嗯。」',
      effects: [{ kind: 'attributeExp', ref: 'trust', tier: 1 }],
    },
  ],
};

let original: typeof CONTENT_INDEX | undefined;

afterEach(() => {
  if (original) Object.assign(CONTENT_INDEX, original);
});

function withTopic() {
  original = CONTENT_INDEX;
  const merged = mergeApprovedContent(FIXTURE_CONTENT_PACK, approved);
  expect(merged.duplicates).toEqual([]);
  Object.assign(CONTENT_INDEX, buildContentIndex(merged.pack));
}

function idolPageState() {
  const state = newGame(1);
  state.pendingDialogueId = undefined;
  state.dialogueNodeId = undefined;
  state.idols.mano!.status = 'recruited';
  state.locationId = 'practice_room';
  state.clock.absoluteMinutes = 12 * 60;
  state.phase = 'idol';
  state.selectedIdolId = 'mano';
  return state;
}

describe('approved topics', () => {
  it('shows one chat entry instead of one button per topic', () => {
    withTopic();
    const state = idolPageState();

    const labels = buildScene(state).actions.map((action) => action.label);
    expect(labels).toContain('聊两句');
    expect(labels).not.toContain('测试话题');
  });

  it('picks an available topic when chatting', () => {
    withTopic();
    const state = idolPageState();
    const before = state.idols.mano!.stats.trust.exp;

    const after = chatWith(state, 'mano');
    expect(after.phase).toBe('npcResult');
    expect(after.pendingTopicId).toBe(TOPIC_ID);
    expect(after.idols.mano!.stats.trust.exp - before).toBe(1);
  });

  it('spends time and is capped per day', () => {
    withTopic();
    let state = idolPageState();
    const startMinute = state.clock.absoluteMinutes;

    // 话题有 24 小时冷却，这里把冷却清掉，只测每日上限。
    state = chatWith(state, 'mano');
    expect(state.clock.absoluteMinutes).toBe(startMinute + 15);

    for (let i = 0; i < 2; i += 1) {
      state.actors.mano!.topicCooldowns = {};
      state.phase = 'idol';
      state.selectedIdolId = 'mano';
      state = chatWith(state, 'mano');
    }
    expect(chatRemainingToday(state, 'mano')).toBe(0);

    // 第 4 次不生效
    state.actors.mano!.topicCooldowns = {};
    state.phase = 'idol';
    state.selectedIdolId = 'mano';
    const blocked = chatWith(state, 'mano');
    expect(blocked).toBe(state);
  });

  it('returns to the idol page instead of the topic list', () => {
    withTopic();
    const talked = chatWith(idolPageState(), 'mano');
    const back = handleCommand(talked, { type: 'continue' });
    expect(back.phase).toBe('idol');
  });

  it('can be started from the idol page and grants its effects', () => {
    withTopic();
    const state = idolPageState();
    const before = state.idols.mano!.stats.trust.exp;

    const after = talkTo(state, 'mano', TOPIC_ID);
    expect(after.phase).toBe('npcResult');
    expect(after.pendingTopicId).toBe(TOPIC_ID);
    expect(after.idols.mano!.stats.trust.exp - before).toBe(1);
  });
});
