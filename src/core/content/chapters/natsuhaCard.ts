import type { StoryChainDef } from '../../types';

/**
 * 夏葉的卡面「目指すなら世界一よ」—— 喫茶店、临时空档、长凳上的咖啡。
 * 3 步 = 3 段 commu；第一段藏起来（revealMode: 'triggered'）。
 */
const natsuhaCard: StoryChainDef = {
  id: 'natsuha-top',
  idolId: 'natsuha',
  title: '目指すなら世界一よ',
  kind: 'card',
  priority: 5,
  cadenceDays: 1,
  workPolicy: 'open',
  revealMode: 'triggered',
  hint: '站前的喫茶店里有个熟面孔',
  revealWhen: [{ kind: 'idolStatus', idolId: 'natsuha', status: 'recruited' }],
  steps: [
    {
      id: 'natsuha-cafe',
      locationId: 'station',
      timeWindow: { fromMinute: 780, toMinute: 1140 },
      dialogueId: 'dialogue.natsuha.cafe',
      actionLabel: '喫茶店里一手哑铃一手书',
      when: [
        { kind: 'idolStatus', idolId: 'natsuha', status: 'recruited' },
        { kind: 'dayAtLeast', day: 4 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.natsuha.cafe', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'natsuha-shopping',
      locationId: 'shopping_street',
      timeWindow: { fromMinute: 780, toMinute: 1140 },
      dialogueId: 'dialogue.natsuha.shopping',
      actionLabel: '她突然说要去逛街',
      when: [
        { kind: 'flag', key: 'completed.natsuha.cafe', value: true },
        { kind: 'dayAtLeast', day: 7 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'attributeExp', ref: 'expression', tier: 1 },
        { kind: 'flag', key: 'completed.natsuha.shopping', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'natsuha-bench',
      locationId: 'park',
      timeWindow: { fromMinute: 1020, toMinute: 1260 },
      dialogueId: 'dialogue.natsuha.bench',
      actionLabel: '她递来一罐咖啡',
      when: [
        { kind: 'flag', key: 'completed.natsuha.shopping', value: true },
        { kind: 'dayAtLeast', day: 10 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.natsuha.bench', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
  ],
};

export default natsuhaCard;
