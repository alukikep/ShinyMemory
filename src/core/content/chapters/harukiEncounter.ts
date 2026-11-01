import type { StoryChainDef } from '../../types';

/**
 * 郁田はるき 的招募链（被推了一把的人）。
 *
 * 依据：W.I.N.G.編「102800101」+ S.T.E.P.編 03〜05（`102800503`〜`505`）。
 *
 * 她不是被视频送来的（那是羽那），也不是被挖来的（那是ルカ）——
 * 是制作人在一个创作者集会上撞见发传单的她，说了一句话；
 * 她演完那场初舞台，从台上追下来：「わたしを、連れていってください……！」
 *
 * 四步：
 * - `hall`          集会：传单被拒、抱着贝斯、初舞台
 * - `hall`          演出结束后她追出来
 * - `practice_room` 见习期的晚上：训练师那句「こんなもんじゃないからね」
 * - `office`        父亲点头之后，「お試しじゃなくて」
 *
 * 闸门：`luca recruited`（コメティック 的入所顺序；和羽那互相无先后）。
 */
const harukiEncounter: StoryChainDef = {
  id: 'haruki-encounter',
  kind: 'arc',
  lockScope: 'none',
  idolId: 'haruki',
  priority: 10,
  title: 'わたしを、連れていってください',
  revealWhen: [{ kind: 'idolStatus', idolId: 'luca', status: 'recruited' }],
  steps: [
    {
      id: 'haruki-flyer',
      locationId: 'hall',
      timeWindow: { fromMinute: 11 * 60, toMinute: 16 * 60 },
      dialogueId: 'dialogue.haruki.first',
      actionLabel: '会场里有个抱着贝斯的女孩',
      source: '102800503',
      when: [
        { kind: 'idolStatus', idolId: 'luca', status: 'recruited' },
        { kind: 'dayAtLeast', day: 3 },
      ],
      effects: [{ kind: 'flag', key: 'completed.haruki.flyer', value: true }],
      complete: { status: 'known', nextStepDelayDays: 1 },
    },
    {
      id: 'haruki-stage',
      locationId: 'hall',
      timeWindow: { fromMinute: 16 * 60, toMinute: 20 * 60 },
      dialogueId: 'dialogue.haruki.second',
      actionLabel: '演出结束后，她从台上追了出来',
      source: '102800101',
      when: [
        { kind: 'idolStatus', idolId: 'luca', status: 'recruited' },
        { kind: 'flag', key: 'completed.haruki.flyer', value: true },
      ],
      effects: [{ kind: 'flag', key: 'completed.haruki.stage', value: true }],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'haruki-training',
      locationId: 'practice_room',
      timeWindow: { fromMinute: 19 * 60, toMinute: 22 * 60 },
      dialogueId: 'dialogue.haruki.third',
      actionLabel: '见习期的晚上，她一个人还在练',
      source: '102800505',
      when: [
        { kind: 'idolStatus', idolId: 'luca', status: 'recruited' },
        { kind: 'flag', key: 'completed.haruki.stage', value: true },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: 5 },
        { kind: 'flag', key: 'completed.haruki.training', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'haruki-answer',
      locationId: 'office',
      timeWindow: { fromMinute: 17 * 60, toMinute: 21 * 60 },
      dialogueId: 'dialogue.haruki.fourth',
      actionLabel: '她带着父亲的答复来了',
      source: '102800505',
      when: [
        { kind: 'idolStatus', idolId: 'luca', status: 'recruited' },
        { kind: 'flag', key: 'completed.haruki.training', value: true },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'flag', key: 'completed.haruki.answer', value: true },
      ],
      complete: { status: 'recruited' },
    },
  ],
};

export default harukiEncounter;
