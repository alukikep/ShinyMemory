import type { ActorDef } from '../../types';

const actor: ActorDef = {
  id: 'hazuki',
  name: '七草叶月',
  role: 'staff',
  description: '283 Production 的事务员。总是很困，但工作很可靠。',
  color: '#6f9d9f',
  schedule: [
    { fromMinute: 9 * 60, toMinute: 18 * 60, locationId: 'office' },
  ],
  topics: [
    {
      id: 'greeting',
      label: '打招呼',
      hint: '第一次正式打招呼',
      text: '……制作人先生，辛苦了。要喝点什么吗？',
      once: true,
      effects: [
        { kind: 'actorAffinity', actorId: 'hazuki', delta: 1 },
      ],
    },
    {
      id: 'schedule',
      label: '问时间安排',
      hint: '询问今天的时间安排',
      text: '今天练习室开到 22 点。啊，不过训练 20 点就结束了……别记错。',
      effects: [],
    },
    {
      id: 'coffee',
      label: '咖啡',
      hint: '她泡多了',
      text: '咖啡……我泡多了。真的只是泡多了。',
      cooldownMinutes: 12 * 60,
      effects: [
        { kind: 'actorAffinity', actorId: 'hazuki', delta: 1 },
        { kind: 'stat', stat: 'stamina', delta: 10 },
        { kind: 'stat', stat: 'stress', delta: -5 },
      ],
    },
  ],
};

export default actor;
