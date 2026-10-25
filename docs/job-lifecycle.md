# 工作完整生命周期研究

## 结论

当前只完成了：

```text
工作邀约
→ 检查档期
→ 写入日程覆盖
```

还没有完成：

```text
工作实例
→ 当天自动完成
→ 玩家参与机会
→ 奖励结算
→ 历史记录
```

因此目前不是完整的“机会型工作”，只是“工作预约”。

## 当前实现

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
};
```

接取时：

```ts
acceptJob
→ canReplaceDay
→ ActorState.scheduleOverrides
```

之后：

- 日程表显示工作；
- 名册显示工作地点；
- 没有 `JobAssignment`；
- 没有完成状态；
- 没有参与行动；
- 没有报酬；
- 次日覆盖被清理，工作静默消失。

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
- **不重复结算**：参与奖励只发一次。

## 状态机

建议只保留三个状态：

```text
scheduled
  ├─ 时间结束 → completed（未参与）
  └─ 玩家参与 → completed（已参与）

cancelled 可选
```

不需要：

```text
failed
missed
abandoned
```

因为缺席不是失败。

## 数据模型

### JobAssignment

```ts
type JobAssignment = {
  id: string;
  jobId: string;
  idolId: string;
  day: number;
  fromMinute: number;
  toMinute: number;
  locationId: string;
  status: 'scheduled' | 'completed';
  participated: boolean;
  rewardClaimed: boolean;
};
```

`GameState`：

```ts
jobs?: JobAssignment[];
```

### 与日程覆盖的关系

接取时同时创建：

```text
JobAssignment
ActorState.scheduleOverrides
```

两者用同一个 id：

```ts
override.id = job.id
```

职责：

- `JobAssignment`：生命周期、奖励、参与状态；
- `scheduleOverrides`：显示和在场解析；
- 不把任务状态塞进日程。

## 自动完成

### 触发点

在 `advanceTime`、读档、调试跳天后检查：

```ts
currentAbsoluteMinutes >= jobEndAbsoluteMinutes
```

满足时：

```ts
status = 'completed'
participated = false
rewardClaimed = false
```

### 行为

不参与：

- 不扣钱；
- 不扣体力；
- 不涨压力；
- 不降好感；
- 不设置失败 flag；
- 写一条中性日志；
- 保留已完成记录。

示例日志：

```text
她完成了《杂志拍摄》。你没有过去。
```

不要写：

```text
工作失败。
她对你失望。
```

### 时间跳跃

如果玩家睡到第二天：

- 前一天工作自动完成；
- 不参与，无奖励；
- 不惩罚；
- 如果有多个过期工作，逐一完成。

### 同日完成

工作结束时间一到就完成。

例如：

```text
10:00–16:00 杂志拍摄
16:01 自动完成
```

即使玩家 16:30 到录音棚，也只剩已完成的记录，没有参与机会。

## 玩家参与

### 出现条件

在工作当天、工作地点、工作时段内，且：

```ts
job.status === 'scheduled'
job.participated === false
```

在场景行动区显示：

```text
参与《杂志拍摄》
10:00–16:00 · 录音棚 · 报酬 ¥1,200
```

### 参与行为

玩家点击后：

1. `participated = true`；
2. `rewardClaimed = true`；
3. `status = 'completed'`；
4. 结算报酬；
5. 结算经验/信任（可选）；
6. 时间推进到工作结束；
7. 写一条参与日志。

### 奖励

第一版建议固定奖励：

```text
金钱 + pay
表现 EXP + 少量
信任 EXP + 少量
```

不建议第一版加入失败链。

原因：

- 不参与已经无惩罚；
- 参与再失败会让“机会”变成风险；
- 先验证机会型工作是否符合节奏。

后续如果需要，可以加“参与但不一定成功”的可选风险。

## 不参与路径

玩家可以：

- 去别的地点；
- 做别的行动；
- 睡觉跳过；
- 完全不打开游戏，直到读档。

结果：

```text
工作 completed
participated = false
rewardClaimed = false
无任何数值变化
```

## 日程表

工作当天仍显示：

```text
4月12日 星期日
10:00–16:00 录音棚 · 杂志拍摄
```

可以显示：

```text
临时
```

工作完成后：

- 当天保留；
- 次日自动清理 override；
- `JobAssignment` 可保留为历史。

## 名册

工作当天：

```text
现在：录音棚
```

工作完成后：

- 当天仍显示录音棚；
- 次日恢复默认日程；
- 不显示“缺席”或“失败”。

## 工作邀约

接取后：

- 同一工作不应再次出现在邀约列表；
- 同一偶像已有 `scheduled` 工作实例时，应过滤；
- 其他工作也不能占用同一天；
- `canReplaceDay` 继续作为最后防线。

## UI 结构

### 事务所

```text
工作邀约
  杂志拍摄
    4月12日 星期日
    10:00–16:00 · 录音棚
    ¥1,200
    [接下]
```

### 工作当天，工作地点

```text
工作机会
  杂志拍摄
  10:00–16:00 · 录音棚
  [参与]
```

### 日志

参与：

```text
你参与了《杂志拍摄》。拍摄顺利结束。
```

未参与：

```text
她完成了《杂志拍摄》。你没有过去。
```

## 存档

建议：

- `GameState.jobs` 可选；
- 旧存档默认 `[]`；
- `ActorState.scheduleOverrides` 已有；
- 如严格版本管理，存档升到 v11；
- 读档时处理已过期工作。

## 测试

需要覆盖：

1. 接工作创建 `JobAssignment`；
2. 接工作写入日程覆盖；
3. 不参与，时间推进后 completed；
4. 不参与，金钱/体力/压力/好感不变；
5. 参与，奖励发放一次；
6. 重复参与不重复发奖；
7. 时间跳跃跨过工作，自动完成；
8. 读档后工作仍存在；
9. 次日 override 清理；
10. 同一工作不重复出现。

## 实施拆分

### J1：JobAssignment

- 类型；
- 存档字段；
- acceptJob 创建实例；
- 过滤重复邀约。

### J2：自动完成

- 时间推进检查；
- 中性日志；
- 无惩罚；
- 时间跳跃。

### J3：参与机会

- 工作地点/时段显示行动；
- 参与命令；
- 时间推进到结束；
- 奖励结算。

### J4：UI 与测试

- 事务所邀约状态；
- 日程表；
- 日志；
- 保存/读取；
- 回归测试。

预计 **3–5 天**。

## 需要确认

1. 参与工作的奖励是固定值，还是沿用现有工作判定？
2. 参与是否消耗时间到工作结束？
3. 工作完成后是否保留历史记录？
4. 是否需要“取消工作”？取消是否无惩罚？
5. 工作当天未参与，日志是否要明确写出来？

## 推荐

第一版：

```text
固定报酬 + 少量 EXP
无失败链
无缺席惩罚
自动完成
参与才发奖
```

这最符合“工作只是当天多一个机会”的理念。
