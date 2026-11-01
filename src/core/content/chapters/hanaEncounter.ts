import type { StoryChainDef } from '../../types';

/**
 * 鈴木羽那 的招募链（被视频送来的人）。
 *
 * 依据：W.I.N.G.編「スカウト！」（`102700101`）+ S.T.E.P.編 01〜06（`102700501`〜`506`）。
 *
 * 原作里这条链是**三个人接力**，不是制作人直接挖到她：
 * 1. 她在事务所刷 SNS，看到急上升的 `#可愛すぎる友達`；投稿的不是本人，是朋友。
 * 2. 视频火了之后一堆事务所私信过去，朋友一条条筛，选中 283。
 * 3. 制作人先私信的是**朋友**，电话才通到羽那本人。
 * 4. 他说愿意等到毕业；她说要跟家里商量。毕业之后她一个人上京。
 *
 * 四步，四个现成地点：
 * - `office`  刷到视频
 * - `office`  私信 → 电话（先朋友、后本人）
 * - `station` 上京那天，车站接人
 * - `dorm`    带她看宿舍 → recruited
 *
 * 取舍（已确认）：応接室那趟不演。地图没有岡山，加一个地点就等于"坐 5 分钟公交到岡山"；
 * 而 W.I.N.G. 原版本身就是电话版——応接室、校长、朋友围观是 S.T.E.P. 編后来补的展开。
 *
 * 闸门：`luca recruited`（コメティック 的入所顺序）。
 */
const hanaEncounter: StoryChainDef = {
  id: 'hana-encounter',
  kind: 'arc',
  lockScope: 'none',
  idolId: 'hana',
  priority: 10,
  title: '可愛すぎる友達',
  revealWhen: [{ kind: 'idolStatus', idolId: 'luca', status: 'recruited' }],
  steps: [
    {
      id: 'hana-video',
      locationId: 'office',
      timeWindow: { fromMinute: 10 * 60, toMinute: 14 * 60 },
      dialogueId: 'dialogue.hana.first',
      actionLabel: 'SNS 上推来一条视频',
      source: '102700101',
      when: [
        { kind: 'idolStatus', idolId: 'luca', status: 'recruited' },
        { kind: 'dayAtLeast', day: 3 },
      ],
      effects: [{ kind: 'flag', key: 'completed.hana.video', value: true }],
      complete: { status: 'known', nextStepDelayDays: 1 },
    },
    {
      id: 'hana-dm',
      locationId: 'office',
      timeWindow: { fromMinute: 18 * 60, toMinute: 21 * 60 },
      dialogueId: 'dialogue.hana.second',
      actionLabel: '给发视频的账号发一条私信',
      source: '102700503',
      when: [
        { kind: 'idolStatus', idolId: 'luca', status: 'recruited' },
        { kind: 'flag', key: 'completed.hana.video', value: true },
      ],
      effects: [{ kind: 'flag', key: 'completed.hana.dm', value: true }],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'hana-arrival',
      locationId: 'station',
      timeWindow: { fromMinute: 14 * 60, toMinute: 18 * 60 },
      dialogueId: 'dialogue.hana.third',
      actionLabel: '上京那天，去车站接她',
      source: '102700505',
      when: [
        { kind: 'idolStatus', idolId: 'luca', status: 'recruited' },
        { kind: 'flag', key: 'completed.hana.dm', value: true },
      ],
      // 「等她毕业」：不硬等真实月数，隔 10 天 + 旁白带过。
      minDaysAfterPrevious: 10,
      effects: [{ kind: 'flag', key: 'completed.hana.arrival', value: true }],
      complete: { nextStepDelayDays: 1 },
    },
    {
      id: 'hana-dorm',
      locationId: 'dorm',
      timeWindow: { fromMinute: 17 * 60, toMinute: 21 * 60 },
      dialogueId: 'dialogue.hana.fourth',
      actionLabel: '带她看宿舍',
      source: '102700505',
      when: [
        { kind: 'idolStatus', idolId: 'luca', status: 'recruited' },
        { kind: 'flag', key: 'completed.hana.arrival', value: true },
      ],
      effects: [{ kind: 'flag', key: 'completed.hana.dorm', value: true }],
      complete: { status: 'recruited' },
    },
  ],
};

export default hanaEncounter;
