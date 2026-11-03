import type { FacilityDef } from '../types';

/**
 * 练习室的三间训练房。
 *
 * 等级存 `vars[varKey]`（0–3），升级只改面板和等级；
 * 实际训练数值由 `vocal` / `dance` / `expression` 的 `levels` 负责。
 */
export const FACILITIES: FacilityDef[] = [
  {
    id: 'vocal',
    name: '声乐室',
    description: '隔音墙和一台旧钢琴。升级后会换成更紧凑的课程。',
    locationId: 'practice_room',
    activityId: 'vocal',
    varKey: 'facility.vocal',
    levels: [
      {
        level: 1,
        cost: 5000,
        description: '中级声乐：50 分钟，EXP +3。',
      },
      {
        level: 2,
        cost: 10000,
        description: '高级声乐：40 分钟，EXP +4。',
      },
      {
        level: 3,
        cost: 15000,
        description: '顶级声乐：30 分钟，EXP +5。',
      },
    ],
  },
  {
    id: 'dance',
    name: '舞蹈室',
    description: '整面镜子和木地板。镜子边上还留着上一节课的胶带印。',
    locationId: 'practice_room',
    activityId: 'dance',
    varKey: 'facility.dance',
    levels: [
      {
        level: 1,
        cost: 5000,
        description: '中级舞蹈：50 分钟，EXP +3。',
      },
      {
        level: 2,
        cost: 10000,
        description: '高级舞蹈：40 分钟，EXP +4。',
      },
      {
        level: 3,
        cost: 15000,
        description: '顶级舞蹈：30 分钟，EXP +5。',
      },
    ],
  },
  {
    id: 'expression',
    name: '表现室',
    description: '几盏能调色的灯和一台摄像机。角落堆着没用完的背景布。',
    locationId: 'practice_room',
    activityId: 'expression',
    varKey: 'facility.expression',
    levels: [
      {
        level: 1,
        cost: 5000,
        description: '中级表现：50 分钟，EXP +3。',
      },
      {
        level: 2,
        cost: 10000,
        description: '高级表现：40 分钟，EXP +4。',
      },
      {
        level: 3,
        cost: 15000,
        description: '顶级表现：30 分钟，EXP +5。',
      },
    ],
  },
  {
    id: 'office_jobs',
    name: '工作区',
    description:
      '白板、电话和排期表挤在一张桌上。把桌面清开，就能多排一条线。',
    locationId: 'office',
    varKey: 'office.jobSlotLevel',
    levels: [
      {
        level: 1,
        cost: 5000,
        description: '添一张折叠桌：同时负责 2 份工作。',
      },
      {
        level: 2,
        cost: 15000,
        description: '加一部内线电话：同时负责 3 份工作。',
      },
      {
        level: 3,
        cost: 30000,
        description: '隔出独立工位：同时负责 4 份工作。',
      },
    ],
  },
  {
    id: 'sofa',
    name: '沙发',
    description: '事务所角落里的旧沙发。躺下去会陷一点，但还算舒服。',
    locationId: 'office',
    activityId: 'rest',
    varKey: 'facility.sofa',
    levels: [
      {
        level: 1,
        cost: 3000,
        description: '换一张能躺下的沙发：休息恢复 20 体力，压力 -6。',
      },
      {
        level: 2,
        cost: 6000,
        description: '加靠垫和毯子：休息恢复 25 体力，压力 -8。',
      },
      {
        level: 3,
        cost: 9000,
        description: '把角落改成休息区：休息恢复 30 体力，压力 -10。',
      },
    ],
  },
];
