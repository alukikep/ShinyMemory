# 高风险工作内容模板

这个模板用于添加“可尝试但可能失败”的工作，以及工作成功/失败后的连续事件。

## 1. 工作定义

```ts
const work: ActivityDef = {
  id: 'tv_work',
  name: '深夜综艺',
  kind: 'work',
  locations: ['studio'],
  durationMinutes: 240,
  timeWindows: [{ fromMinute: 20 * 60, toMinute: 1439 }],
  cost: { stamina: 25 },
  effects: [{ kind: 'sharedStat', stat: 'stress', delta: 20 }],
  workReward: {
    baseMoney: 2400,
    checks: [{ attribute: 'expression', weight: 1 }],
  },
  workRisk: {
    attribute: 'expression',
    minRank: 'F',
    safeRank: 'C',
    failureEventId: 'evt.work_failure_tv',
    successEventId: 'evt.tv_success',
    failureByGap: { 1: 0.35, 2: 0.6, 3: 0.8 },
  },
  resultTexts: ['...'],
};
```

- `minRank`：低于此等级不可选择；
- `safeRank`：达到后稳定成功；
- `failureByGap`：低于 safeRank 的失败率；
- `failureEventId`：失败事件；
- `successEventId`：成功事件。

如果 `minRank === safeRank`，这就是高门槛工作，不会失败。

## 2. 结果事件

成功与失败事件都必须使用 `entry` 标记，避免进入随机事件池：

```ts
entry: {
  kind: 'workOutcome',
  activityId: 'tv_work',
  outcome: 'failure',
}
```

```ts
entry: {
  kind: 'workOutcome',
  activityId: 'tv_work',
  outcome: 'success',
}
```

## 3. 后续事件链

事件或选项都可以指定下一个事件：

```ts
nextEventId: 'evt.tv_failure_aftermath',
```

或：

```ts
choices: [
  {
    label: '把问题说清楚',
    effects: [...],
    result: '...',
    nextEventId: 'evt.tv_failure_aftermath',
  },
]
```

链式事件的 `entry`：

```ts
entry: { kind: 'chain' }
```

链式事件不会进入普通事件池，只能由上一个事件触发。

## 4. 流程

```text
工作
  → 失败判定
      ├─ 成功 → 成功事件 → 后续事件链 → 回到偶像页
      └─ 失败 → 失败事件 → 后续事件链 → 回到偶像页
```

事件结束后，如果 `pendingIdolId` 仍指向在场偶像，就回到偶像页面；否则回到地点页。

## 5. 校验

内容测试应保证：

- `failureEventId` / `successEventId` 存在；
- 工作结果事件的 `entry.activityId` 与工作 id 一致；
- 结果事件不在 `globalEvents` 中；
- `nextEventId` 指向存在的事件；
- 链式事件 `entry.kind === 'chain'`；
- 链式事件不在 `globalEvents` 中。
