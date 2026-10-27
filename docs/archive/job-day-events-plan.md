# 工作日事件计划

## 目标

工作当天，玩家到场参与后：

```text
参与工作
→ 结算基础报酬
→ 进入一个工作专属事件
→ 选择
→ 回到地点菜单
```

不参与：

```text
工作自动完成
无事件
无奖励
无惩罚
无日志
```

工作日事件是“参与后的内容”，不是额外任务。

## 当前可复用基础

- `JobDef`
- `JobAssignment`
- `attendJob`
- 事件系统 `EventDef` / `EventChoice`
- `pendingEventId` / `phase: 'event'`
- 事件结果和 `continue` 流程

当前 `attendJob` 直接：

```text
发钱
发 EXP
推进时间
移除工作
写日志
```

下一步只需要在“发钱和移除工作”之间插入一个事件。

## 数据结构

### JobDef

增加：

```ts
type JobDef = {
  ...
  eventId?: string;
};
```

### EventEntry

增加：

```ts
type EventEntry =
  | { kind: 'random' }
  | { kind: 'workOutcome'; activityId: string; outcome: 'success' | 'failure' }
  | { kind: 'job'; jobId: string }
  | { kind: 'chain' };
```

### 工作事件定义

```ts
const card: EventDef = {
  id: 'evt.job_magazine',
  title: '布景改了',
  entry: { kind: 'job', jobId: 'job_magazine' },
  when: [],
  text: '摄影师临时换了布景，问她想不想试试另一种拍法。',
  choices: [
    {
      label: '按原方案拍',
      effects: [{ kind: 'idolExp', attribute: 'trust', tier: 1 }],
      result: '拍摄很顺利。收工时她看起来松了口气。',
    },
    {
      label: '试试更冒险的构图',
      effects: [
        { kind: 'idolExp', attribute: 'expression', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: 2 },
      ],
      result: '成片效果很好，但她在回程车上一直没说话。',
    },
  ],
};
```

## 触发流程

### 参与

修改 `attendJob`：

```text
1. 校验工作和时段
2. 加钱 / 应用 JobDef.effects
3. 时间推进到工作结束
4. 从 jobs 移除工作
5. 如果 JobDef.eventId 存在：
     phase = 'event'
     pendingEventId = eventId
     pendingEventIdolId = idolId
   否则：
     保持 plan
6. 写“参与”日志
```

### 不参与

`completeDueJobs` 不变：

```text
从 jobs 移除
无事件
无日志
```

### 事件结束后

复用现有：

```text
事件选择
→ eventResult
→ continue
→ plan
```

不需要新的页面或命令。

## 防误触发

工作事件不能进入随机事件池。

当前 `contentIndex` 会：

- 把带 `atLocation` 的事件加入地点池；
- 把带 `after` 的事件加入行动池；
- 只有无 `entry` 或 `entry.kind === 'random'` 的事件进入全局池。

因此工作事件必须：

```ts
entry: { kind: 'job', jobId: '...' }
when: []
```

不要给工作事件添加 `atLocation` 条件，否则它可能被地点随机池选中。

如果以后需要按地点显示，应该单独给 `entry.kind === 'job'` 做索引，而不是复用地点池。

## 内容

第一版只给两个现有工作加事件：

### 杂志拍摄

```text
布景改了
- 按原方案
- 试试更冒险的构图
```

### 电台收录

```text
直播前的十分钟
- 按台本走
- 临场改一个话题
```

每个事件：

- 2 个选择；
- 不失败；
- 奖励为少量信任/表现；
- 不额外扣钱；
- 不影响不参与路径。

## 奖励顺序

建议：

```text
基础报酬：参与即发
事件选择：额外 EXP / 小压力
```

事件不负责基础工资，避免事件缺失时工作没报酬。

## 边界

- 不参与：没有事件；
- 事件缺失：回退为当前直接结算；
- 同一天第二次参与：`jobs` 已移除，不会重复；
- 事件中途关闭游戏：`pendingEventId` 已存档，读档继续；
- 事件选择时长：第一版不使用 `durationMinutes`，避免跨过工作结束；
- 事件可以重复：同一工作下一次接取仍会出现，不设 `once`；
- 事件不写未参与日志。

## 测试

1. 接受工作后 `jobs` 有实例；
2. 参与后进入 `event`；
3. `pendingEventId` 正确；
4. 基础报酬已发；
5. 工作已移除；
6. 事件结束后回到 plan；
7. 不参与仍自动完成，没有事件；
8. 工作事件不出现在随机事件池；
9. 事件缺失时直接结算；
10. 事件选择不重复发基础报酬。

## 实施拆分

```text
E1 类型：JobDef.eventId + EventEntry.job
E2 attendJob：参与后进入事件
E3 内容：杂志拍摄 / 电台收录事件
E4 测试：触发、随机池隔离、回退
```

预计 **1–2 天**。

## 非目标

- 工作失败；
- 缺席惩罚；
- 工作历史；
- 工作事件 UI；
- 多日工作；
- 事件分支链。
