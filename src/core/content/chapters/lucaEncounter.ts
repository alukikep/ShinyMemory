import type { StoryChainDef } from '../../types';

/**
 * 斑鳩ルカ 的招募链（上门型）。
 *
 * 依据：ジ・エピソード（special_communications/490103908〜910）。
 * 她不是偶遇来的，也不是档案选来的——是制作人一次次去她家门口。
 *
 * 三步，全在门口：
 * - `luca-door-1` 第一次照面：便当挂上门把 →「帰れ」
 * - `luca-door-2` 第二次：她说出「『ママのナポリタン』」——一样他弄不到的东西
 * - `luca-door-3` 第三次：发烧、はづき 赶到、「あなたの力になりたい」→ recruited
 *
 * 闸门：`unlocked.tribute_gig`。那是 にちか 那条链（八雲なみ的致敬演出）的完成 flag——
 * 她闭门不出的原因就是那一夜，没有它就没有这条链。
 *
 * 原作 `490103901`〜`907` 的七段是她在房间里的独白，没有玩家在场，
 * 这里不写成行动，只在第一步的旁白里带过。
 */
const lucaEncounter: StoryChainDef = {
  id: 'luca-encounter',
  kind: 'arc',
  lockScope: 'none',
  idolId: 'luca',
  priority: 10,
  title: '門の外から',
  revealWhen: [{ kind: 'flag', key: 'unlocked.tribute_gig', value: true }],
  steps: [
    {
      id: 'luca-door-1',
      locationId: 'apartment',
      timeWindow: { fromMinute: 18 * 60, toMinute: 22 * 60 },
      dialogueId: 'dialogue.luca.first',
      actionLabel: '把便当挂在她家门把上',
      source: '490103908',
      when: [{ kind: 'flag', key: 'unlocked.tribute_gig', value: true }],
      effects: [{ kind: 'flag', key: 'completed.luca.door1', value: true }],
      complete: { status: 'known', nextStepDelayDays: 2 },
    },
    {
      id: 'luca-door-2',
      locationId: 'apartment',
      timeWindow: { fromMinute: 18 * 60, toMinute: 22 * 60 },
      dialogueId: 'dialogue.luca.second',
      actionLabel: '她说了一样你弄不到的东西',
      source: '490103909',
      when: [{ kind: 'flag', key: 'unlocked.tribute_gig', value: true }],
      effects: [{ kind: 'flag', key: 'completed.luca.door2', value: true }],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'luca-door-3',
      locationId: 'apartment',
      timeWindow: { fromMinute: 18 * 60, toMinute: 23 * 60 },
      dialogueId: 'dialogue.luca.third',
      actionLabel: '第三次，她发着烧',
      source: '490103910',
      when: [{ kind: 'flag', key: 'unlocked.tribute_gig', value: true }],
      effects: [{ kind: 'flag', key: 'completed.luca.door3', value: true }],
      complete: { status: 'recruited' },
    },
  ],
};

export default lucaEncounter;
