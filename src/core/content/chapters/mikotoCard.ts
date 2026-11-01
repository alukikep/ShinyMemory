import type { StoryChainDef } from '../../types';

/**
 * 美琴的卡面「ROUNDLY」—— 忘了喝水、买杂志、洗衣房、深夜的录像、寄到事务所的家电。
 * 5 步 = 5 段 commu；第一段藏起来（revealMode: 'triggered'）。
 *
 * 原作五个小节：appliance / display / laundry / broken / curious。
 */
const mikotoCard: StoryChainDef = {
  id: 'mikoto-roundly',
  idolId: 'mikoto',
  title: 'ROUNDLY',
  kind: 'card',
  priority: 5,
  cadenceDays: 1,
  workPolicy: 'open',
  revealMode: 'triggered',
  hint: '练习室的镜子里，她的水一口没动',
  revealWhen: [{ kind: 'idolStatus', idolId: 'mikoto', status: 'recruited' }],
  steps: [
    {
      id: 'mikoto-water',
      locationId: 'practice_room',
      timeWindow: { fromMinute: 11 * 60, toMinute: 15 * 60 },
      dialogueId: 'dialogue.mikoto.water',
      actionLabel: '她练了两个小时没喝水',
      when: [
        { kind: 'idolStatus', idolId: 'mikoto', status: 'recruited' },
        { kind: 'dayAtLeast', day: 4 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.mikoto.water', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'mikoto-magazine',
      locationId: 'record_shop',
      timeWindow: { fromMinute: 14 * 60, toMinute: 17 * 60 },
      dialogueId: 'dialogue.mikoto.magazine',
      actionLabel: '她抱着篮子，杂志堆到篮口',
      when: [
        { kind: 'flag', key: 'completed.mikoto.water', value: true },
        { kind: 'dayAtLeast', day: 7 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'flag', key: 'completed.mikoto.magazine', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'mikoto-laundry',
      locationId: 'practice_room',
      timeWindow: { fromMinute: 18 * 60, toMinute: 22 * 60 },
      dialogueId: 'dialogue.mikoto.laundry',
      actionLabel: '练习室的灯关了，洗衣房还亮着',
      when: [
        { kind: 'flag', key: 'completed.mikoto.magazine', value: true },
        { kind: 'dayAtLeast', day: 10 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.mikoto.laundry', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'mikoto-video',
      locationId: 'office',
      timeWindow: { fromMinute: 20 * 60, toMinute: 23 * 60 },
      dialogueId: 'dialogue.mikoto.video',
      actionLabel: '事务所没开灯，里面有人',
      when: [
        { kind: 'flag', key: 'completed.mikoto.laundry', value: true },
        { kind: 'dayAtLeast', day: 13 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'flag', key: 'completed.mikoto.video', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'mikoto-delivery',
      locationId: 'office',
      timeWindow: { fromMinute: 15 * 60, toMinute: 18 * 60 },
      dialogueId: 'dialogue.mikoto.delivery',
      actionLabel: '事务所门口放着个大纸箱',
      when: [
        { kind: 'flag', key: 'completed.mikoto.video', value: true },
        { kind: 'dayAtLeast', day: 16 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'attributeExp', ref: 'expression', tier: 3 },
        { kind: 'flag', key: 'completed.mikoto.delivery', value: true },
      ],
    },
  ],
};

export default mikotoCard;
