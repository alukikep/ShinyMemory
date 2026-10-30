# 工作完整生命周期

> 正式内容：job.studio_shoot（摄影棚拍摄，带表现检定）。工作面板与重点偶像见「接取」一节。

## 当前状态

已实现轻量生命周期：

```text
事务所邀约
→ canReplaceDay
→ JobAssignment + scheduleOverrides
→ 工作当天到点自动完成
→ 玩家到场可参与并领奖
→ 次日清理日程覆盖
```

明确不做的：

- 取消工作；
- 未参与日志；
- 失败/缺席状态；
- 工作历史页面；
- 工作执行后的额外事件。

## 设计原则

```text
工作当天，偶像一定会完成工作。
玩家参与 = 多一个获得奖励的机会。
玩家不参与 = 没有奖励，也没有惩罚。
```

关键词：

- **自动完成**：不依赖玩家；
- **可选参与**：玩家到场才有额外收益；
- **无缺席惩罚**：不扣钱、不扣压力、不降好感、不标记失败；
- **不增加负担**：不写未参与日志，不保留待办列表；
- **不重复结算**：参与后工作实例直接移除。

## 数据结构

`JobDef`：

```ts
type JobDef = {
  id: string;
  name: string;
  locationId: string;
  fromMinute: number;
  toMinute: number;
  pay: number;
  label?: string;
  effects?: Effect[];
};
```

工作实例：

```ts
type JobAssignment = {
  id: string;
  jobId: string;
  idolId: string;
  day: number;
  fromMinute: number;
  toMinute: number;
  locationId: string;
};
```

`GameState.jobs?: JobAssignment[]` 只保存尚未完成的工作。

没有 `completed` 状态，也没有历史数组：

```text
完成 → 从 jobs 移除
```

日程覆盖仍在当天保留，次日由 `pruneScheduleOverrides` 清理。

## 接取

地点页**不再**为每份工作铺一个按钮。事务所只留一个入口：

```text
查看可以接的工作  →  工作面板（JOBS）
```

面板列出所有工作，每条给出：

| 字段 | 说明 |
|---|---|
| 名称 / 报酬 / 地点 / 时段 | 基本盘 |
| 检定要求 | 例如「需要表现 E」，按**每个偶像各自的等级**算成功率 |
| 派谁去 | 每个已出道偶像一个按钮，写明最早可排的日期与她的成功率 |
| 未解锁 | `requires` 不满足时显示「未解锁」（不写条件） |
| 隐藏 | `hiddenUntilUnlocked: true` 且未解锁时，整条从面板消失（剧情解锁用） |

解锁条件可以是属性、粉丝、或剧情 flag：

```jsonc
{ "requires": [{ "kind": "flag", "key": "unlocked.magazine_cover" }],
  "hiddenUntilUnlocked": true }
```

判定用 `checkCondition`（不是展示文案）——曾经用 `describeCondition` 判过，
flag 没有文案时会被当成已满足，工作直接可接。`content:audit` 的
`job-unlock-flag` 规则会挡住"引用了没人设置的 flag"。

偶像侧的变化：

- 接工作默认派给**重点偶像**（`focusIdolId`，名册里可切换、写进存档）；
- 面板里也可以直接点别的偶像派去（`acceptJob(..., idolId)`）；
- 同一天可以让两个偶像各接一份工作——`JobAssignment` 本来就带 `idolId`，
  `canReplaceDay` 也是按单个偶像判断的。

`acceptJob` 的校验：

1. 校验事务所、目标偶像**已出道**、未来日期；
2. 同一偶像同一工作已有未完成实例 → 拒绝；
3. `canReplaceDay` 校验档期；
4. 创建 `JobAssignment`；
5. 写入 `ActorState.scheduleOverrides`，`mode: 'replace-day'`；
6. 写一条“接下了”日志。

工作当天：

```text
10:00–16:00 录音棚 · 杂志拍摄
```

日程表显示临时工作，名册显示录音棚。

## 自动完成

`advanceTime`、读档、调试跳天都会调用：

```ts
completeDueJobs(state)
```

工作到点而玩家没到场 → **按 20% 结算**，并照常掷检定（失败再乘 failurePayRatio）。
属性成长降一档（tier 10 → 5、5 → 3、3 → 1），**粉丝归零**——她确实去上班了，只是没有制作人在旁边推。

冷却从**完成那天**开始算：`jobCooldowns[jobId] = 完成日`，再按 `cooldownDays` 锁定若干天。
一份工作同时只能派一个人（被派出期间全城锁死）。

当前时间达到或超过工作结束时间：

```text
从 GameState.jobs 移除
```

行为：

- 不扣钱；
- 不扣体力；
- 不涨压力；
- 不降好感；
- 不写日志；
- 不标记失败；
- 不生成历史记录。

玩家完全不管工作，工作也会“完成”，只是没有任何结算。

## 玩家参与

条件：

```text
工作当天
+ 工作地点
+ 工作时段内
+ state.jobs 中存在该工作
+ 该工作的偶像已出道
```

工作地点行动区出现：

```text
参与：杂志拍摄
10:00–16:00 · ¥1,200
```

参与后走**结果页**（和行动一致，不是把一句日志丢回安排页）：

1. 有 `check` 时先掷骰；
2. 成功拿全额，失败按 `failurePayRatio`（默认 0.5）结算；
3. 应用 `effects` 或 `failureEffects`；
4. 时间推进到工作结束，从 `jobs` 移除；
5. `phase = 'activityResult'`，结果文本取自 `resultTexts` / `failureTexts`（缺省退回 `description`），后面接「收入 ¥xxx」。写一条日志。

日程覆盖仍保留到当天结束。

## 无惩罚

未参与不会改变任何数值。

没有：

```text
工作失败
缺席
她对你失望
```

因此工作只是“当天多了一个可参与的机会”。

## 日程表与名册

工作日：

```text
4月12日 星期日
10:00–16:00 录音棚 · 杂志拍摄
临时
```

名册：

```text
现在：录音棚
```

完成后当天仍显示工作；次日恢复默认安排。

## 防重复

- 同一偶像同一工作未完成时，不再出现在邀约；
- 同一自由日只能被一个工作占用；
- 参与后立即从 `jobs` 移除；
- 工作完成后不会再次出现。

## 当前边界

未实现：

- 工作当天额外事件；
- 工作失败/成功判定；
- 工作报酬浮动；
- 工作历史；
- 取消工作；
- 多日工作；
- 工作地点外的远程参与。

## 测试

当前覆盖：

- 接取创建 `JobAssignment`；
- 接取写入 `replace-day`；
- 同一工作不重复邀约；
- 工作到点自动移除；
- 自动完成不发奖励、不写日志；
- 玩家参与发钱/EXP；
- 参与推进到工作结束；
- 参与后工作移除；
- 日程表显示临时工作；
- 名册显示工作地点；
- 过期覆盖清理。

## 后续

工作当天事件计划（历史方案）见 `docs/archive/job-day-events-plan.md`。

如果需要更丰富，但不想增加负担：

```text
工作日增加一个地点事件
参与时随机一句结果文本
不同工作不同 EXP
```

不建议加入：

```text
缺席惩罚
工作失败
工作待办提醒
复杂工作队列
```
