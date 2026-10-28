import type { EventDef } from '../../../types';

/**
 * P0 切片：与真乃闹别扭。
 *
 * 触发一次声乐训练后必定发生（`once`），并把她接下来两天的日程清空；
 * 之后的连锁在 storyChains.ts 的 `mano-rift` 里。
 */
export const manoQuarrel: EventDef = {
  id: 'evt.mano_quarrel',
  title: '话说重了',
  when: [
    { kind: 'idolStatus', idolId: 'mano', status: 'recruited' },
  ],
  after: { ids: ['vocal'] },
  chance: 1,
  once: true,
  text: '练习结束。你说完那句“还不够”之后，练习室里安静下来。她合上谱子，没有看你。',
  choices: [
    {
      label: '道歉',
      effects: [
        { kind: 'flag', key: 'mano_rift', value: true },
        { kind: 'actorAffinity', actorId: 'mano', delta: -5 },
        {
          kind: 'scheduleOverride',
          actorId: 'mano',
          id: 'mano-rift-quiet',
          days: 2,
        },
        { kind: 'log', text: '她说了声先走了，把谱子留在了椅子上。' },
      ],
      result: '你追出去两步，又停住。她走得不快，但一次也没有回头。',
    },
    {
      label: '什么都不说',
      effects: [
        { kind: 'flag', key: 'mano_rift', value: true },
        { kind: 'actorAffinity', actorId: 'mano', delta: -10 },
        {
          kind: 'scheduleOverride',
          actorId: 'mano',
          id: 'mano-rift-quiet',
          days: 2,
        },
        { kind: 'log', text: '她收拾好东西，轻轻带上了门。' },
      ],
      result: '门关上之后，练习室里只剩下空调的声音。',
    },
  ],
};
