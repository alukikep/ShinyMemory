import type { EventDef } from '../../../types';

const event: EventDef = {
  id: 'evt.work_failure_tv',
  title: '录制事故',
  entry: {
    kind: 'workOutcome',
    activityId: 'tv_work',
    outcome: 'failure',
  },
  nextEventId: 'evt.tv_failure_aftermath',
  when: [],
  text: '录制中途出了问题。现场安静下来，工作人员看向你们。',
  choices: [
    {
      label: '向工作人员道歉',
      hint: '共享压力 +10，目标偶像信任 EXP -3',
      effects: [
        { kind: 'sharedStat', stat: 'stress', delta: 10 },
        {
          kind: 'attributeExp',
          ref: 'trust',
          tier: 3,
          direction: 'loss',
        },
      ],
      result: '你低头道歉。回程的车上，谁都没有先开口。',
    },
    {
      label: '先带她回去',
      hint: '共享体力 -10，目标偶像信任 EXP -1',
      effects: [
        { kind: 'sharedStat', stat: 'stamina', delta: -10 },
        {
          kind: 'attributeExp',
          ref: 'trust',
          tier: 1,
          direction: 'loss',
        },
      ],
      result: '你替她跟现场道了歉，带她离开。她一路都没说话。',
    },
  ],
};

export default event;
