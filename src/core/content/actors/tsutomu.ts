import type { ActorDef } from '../../types';

const actor: ActorDef = {
  id: 'tsutomu',
  name: '天井努',
  role: 'president',
  description: '283 Production 的社长。看起来严厉，实际上很护着事务所的偶像。',
  color: '#4a4a55',
  schedule: [
    { fromMinute: 10 * 60, toMinute: 17 * 60, locationId: 'office' },
  ],
  topics: [
    {
      id: 'greeting',
      label: '打招呼',
      hint: '第一次正式见社长',
      text: '……来了。坐。',
      once: true,
      effects: [
        { kind: 'actorAffinity', actorId: 'tsutomu', delta: 1 },
      ],
    },
    {
      id: 'agency',
      label: '问事务所',
      hint: '问问最近的事务所',
      text: '283 不养闲人。……不过，你们做得不错。',
      effects: [],
    },
    {
      id: 'hazuki',
      label: '问叶月',
      hint: '问问社长怎么看叶月',
      text: '叶月那家伙……别看她那样。你多看着点。',
      once: true,
      effects: [
        { kind: 'actorAffinity', actorId: 'tsutomu', delta: 1 },
      ],
    },
  ],
};

export default actor;
