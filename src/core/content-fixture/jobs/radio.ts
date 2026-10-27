import type { JobDef } from '../../types';

const job: JobDef = {
  id: 'job_radio',
  name: '电台收录',
  description: '深夜档广播的嘉宾收录。话题轻松，但需要撑住现场。',
  locationId: 'studio',
  fromMinute: 19 * 60,
  toMinute: 22 * 60,
  pay: 1800,
  label: '收录',
  effects: [
    { kind: 'idolExp', attribute: 'expression', tier: 5 },
    { kind: 'idolExp', attribute: 'trust', tier: 1 },
  ],
};

export default job;
