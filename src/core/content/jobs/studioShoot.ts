import type { JobDef } from '../../types';

const job: JobDef = {
  id: 'job.studio_shoot',
  name: '摄影棚拍摄',
  description: '杂志内页的一组拍摄。两个小时，灯光和快门都比想象中吵。',
  locationId: 'studio',
  fromMinute: 10 * 60,
  toMinute: 12 * 60,
  pay: 1200,
  label: '拍摄',
  effects: [
    { kind: 'attributeExp', ref: 'expression', tier: 3 },
    { kind: 'sharedStat', stat: 'stress', delta: 6 },
  ],
};

export default job;
