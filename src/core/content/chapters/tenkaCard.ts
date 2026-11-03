import type { StoryChainDef } from '../../types';

/**
 * 甜花的卡面「あまやどり」—— 睡过头、喫茶店、一杯咖啡。
 * 3 步 = 3 段 commu；第一段藏起来（revealMode: 'triggered'）。
 */
const tenkaCard: StoryChainDef = {
  id: 'tenka-shelter',
  idolId: 'tenka',
  title: 'あまやどり',
  kind: 'card',
  priority: 5,
  cadenceDays: 1,
  workPolicy: 'open',
  revealMode: 'triggered',
  hint: '今天的课她好像没来',
  revealWhen: [{ kind: 'idolStatus', idolId: 'tenka', status: 'recruited' }],
  steps: [
    {
      id: 'tenka-oversleep',
      locationId: 'home',
      timeWindow: { fromMinute: 780, toMinute: 1140 },
      dialogueId: 'dialogue.tenka.oversleep',
      actionLabel: '她的电话打不通',
      sceneLocationName: '甜花的家',
      endLocationId: 'practice_room',
      when: [
        { kind: 'idolStatus', idolId: 'tenka', status: 'recruited' },
        { kind: 'dayAtLeast', day: 4 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.tenka.oversleep', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'tenka-cafe',
      locationId: 'station',
      timeWindow: { fromMinute: 780, toMinute: 1140 },
      dialogueId: 'dialogue.tenka.cafe',
      actionLabel: '课后她说想去个地方',
      when: [
        { kind: 'flag', key: 'completed.tenka.oversleep', value: true },
        { kind: 'dayAtLeast', day: 7 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'attributeExp', ref: 'expression', tier: 1 },
        { kind: 'flag', key: 'completed.tenka.cafe', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'tenka-coffee',
      locationId: 'office',
      timeWindow: { fromMinute: 900, toMinute: 1140 },
      dialogueId: 'dialogue.tenka.coffee',
      actionLabel: '她拿着台本站在茶水间',
      when: [
        { kind: 'flag', key: 'completed.tenka.cafe', value: true },
        { kind: 'dayAtLeast', day: 10 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.tenka.coffee', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
  ],
};

export default tenkaCard;
