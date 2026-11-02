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
];
