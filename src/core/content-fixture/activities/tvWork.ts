import type { ActivityDef } from '../../types';

const card: ActivityDef = {
  id: 'tv_work',
  name: '深夜综艺',
  description: '高曝光，也意味着高压力和不可控的现场。',
  kind: 'work',
  locations: ['studio'],
  durationMinutes: 240,
  timeWindows: [{ fromMinute: 20 * 60, toMinute: 1439 }],
  cost: {
    stamina: 25,
  },
  effects: [
    { kind: 'sharedStat', stat: 'stress', delta: 20 },
  ],
  workReward: {
    baseMoney: 2400,
    terms: [{ ref: 'expression', weight: 1 }],
  },
  workRisk: {
    ref: 'expression',
    minRank: 'F',
    safeRank: 'C',
    failureEventId: 'evt.work_failure_tv',
    successEventId: 'evt.tv_success',
    failureByGap: { 1: 0.35, 2: 0.6, 3: 0.8 },
  },
  resultTexts: [
    '录制拖到深夜。她在镜头前撑住了，收工时脚步有点晃。',
    '现场反应比预期好。她下台后没有笑，只是长长地呼出一口气。',
    '工作人员临时改了流程。她接住了，但回程的车上一直看着窗外。',
  ],
};

export default card;
