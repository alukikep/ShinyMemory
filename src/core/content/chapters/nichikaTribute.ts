import type { StoryChainDef } from '../../types';

/**
 * にちか 的第二条链：八雲なみ 的致敬演出（283活动剧情 / セヴン＃ス）。
 *
 * 为什么单独立一条：
 * - 卡面「♡まっクろはムウサぎ♡」里没有这一段，而它是 にちか 唯一一次
 *   **在台上唱不出来**，也是她第一次说「シーズなんかじゃないですよ私」。
 * - 这场演出是 斑鳩ルカ 闭门不出的直接原因（没有和 美琴 同台的那一夜，
 *   就没有 490103901〜910 的门口送饭）。ルカ 的招募链挂在这条链的完成 flag 上。
 *
 * 闸门是**跨角色**的：美琴 必须在籍——致敬演出是 SHHis 的工作，
 * 替她唱完那段的是 美琴。引擎侧用 `idolStatus` 显式指定 idolId，
 * 手记里会写「得先让緋田美琴加入」（conditionText.ts:32）。
 *
 * 三段各取自一场戏：
 * - office 第1话-そうだよ      [400105802] 接到委托，美琴问「それ、私に来ているの？」
 * - studio 第2话-が／を        [400105803] 公开录音的窄舞台，アイコンタクト
 * - hall   第5话-shhh          [400105806] 演出当晚，她唱不出来，美琴替她唱
 *
 * 台词里不出现「斑鳩ルカ」这个名字：她此时还是 unknown，
 * 名字与「美琴的前搭档」的身份留给她自己的招募链揭。
 */
const nichikaTribute: StoryChainDef = {
  id: 'nichika-tribute',
  idolId: 'nichika',
  kind: 'arc',
  title: '八雲なみ的致敬演出',
  priority: 15,
  revealWhen: [
    { kind: 'idolStatus', idolId: 'nichika', status: 'recruited' },
    { kind: 'idolStatus', idolId: 'mikoto', status: 'recruited' },
  ],
  steps: [
    {
      id: 'nichika-tribute-offer',
      locationId: 'office',
      timeWindow: { fromMinute: 14 * 60, toMinute: 19 * 60 },
      dialogueId: 'dialogue.nichika.tribute.first',
      actionLabel: '事务所来了致敬演出的委托',
      source: '400105802',
      when: [
        { kind: 'idolStatus', idolId: 'nichika', status: 'recruited' },
        { kind: 'idolStatus', idolId: 'mikoto', status: 'recruited' },
      ],
      effects: [
        { kind: 'flag', key: 'completed.nichika.tribute.offer', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'nichika-tribute-radio',
      locationId: 'studio',
      timeWindow: { fromMinute: 14 * 60, toMinute: 20 * 60 },
      dialogueId: 'dialogue.nichika.tribute.radio',
      actionLabel: '电台公开录音的彩排',
      source: '400105803',
      when: [
        { kind: 'idolStatus', idolId: 'nichika', status: 'recruited' },
        { kind: 'idolStatus', idolId: 'mikoto', status: 'recruited' },
      ],
      effects: [
        { kind: 'sharedStat', stat: 'stress', delta: 6 },
        { kind: 'flag', key: 'completed.nichika.tribute.radio', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'nichika-tribute-gig',
      locationId: 'hall',
      timeWindow: { fromMinute: 17 * 60, toMinute: 22 * 60 },
      dialogueId: 'dialogue.nichika.tribute.gig',
      actionLabel: '致敬演出当晚',
      source: '400105806',
      when: [
        { kind: 'idolStatus', idolId: 'nichika', status: 'recruited' },
        { kind: 'idolStatus', idolId: 'mikoto', status: 'recruited' },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -10 },
        { kind: 'flag', key: 'completed.nichika.tribute', value: true },
        // ルカ 的招募链挂在这个 flag 上（她闭门不出的原因就是这一夜）。
        { kind: 'flag', key: 'unlocked.tribute_gig', value: true },
      ],
    },
  ],
};

export default nichikaTribute;
