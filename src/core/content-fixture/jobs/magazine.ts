import type { JobDef } from '../../types';

const job: JobDef = {
  id: 'job_magazine',
  name: '杂志拍摄',
  description: '面向年轻读者的时尚杂志内页。上午集合，下午收工。',
  locationId: 'studio',
  fromMinute: 10 * 60,
  toMinute: 16 * 60,
  pay: 1200,
  label: '拍摄',
  effects: [
    { kind: 'attributeExp', ref: 'expression', tier: 3 },
    { kind: 'attributeExp', ref: 'trust', tier: 1 },
  ],
};

export default job;
