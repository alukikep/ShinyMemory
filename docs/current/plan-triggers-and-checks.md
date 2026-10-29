# 周期触发、检定与事件监听计划

> 状态：设计待确认，未动工
> 目标版本：`0.19.0`
> 存档：`scheduledDays` 为新增可选字段，`SAVE_VERSION` 不变
> 与 [统一计算接口与饰品槽](plan-modifier-pipeline.md) 无依赖，可与 M0/M1 并行

## 0. 已确认决策

| 编号 | 决策点 | 结论 | 来源 |
|---|---|---|---|
| D1 | 周期触发 | 做。支撑"每周房租""定期课程"这类节拍 | 你 |
| D2 | 检定 | 做。行动有成败分支，不再只有条件换文案 | 你 |
| D3 | 遭遇系统 | **不做**，和当前玩法不兼容 | 你 |
| D4 | 成就 | 现在只留监听接口，不实现成就本身 | 你 |
| D5 | 内容形态 | 三者全部是数据字段，不引入脚本逃生口 | 你 |
| D6 | 时间跳变 | 周期事件不回溯，按"今天到点且今天未触发"判定 | 我 |

## 1. 周期触发

### 1.1 现状与缺口

`EventDef` 现在只能挂在"某次行动之后"（`after` / `afterNpc` / `afterIdol`）。所以"每周一扣房租""第 7 天有考试"这类**跟时间走、不跟行动走**的内容写不出来。

### 1.2 数据

```ts
export type EventTrigger = {
  /** 每 N 天一次，从第 1 天起算；与 weekday 二选一 */
  everyDays?: number;
  weekday?: Weekday;
  /** 当天这个时间之后才算到点 */
  atMinute: number;
};

// EventDef 新增
trigger?: EventTrigger;
```

带 `trigger` 的事件**不进入**行动后的随机池，只在定时检查时出现。

### 1.3 检查时机

只有一个入口：`checkForEvent(state, ctx)`。

```text
1. 先查行动锚定的随机池（现有逻辑，不变）
2. 未命中则查定时池：
   今天满足周期（weekday 或 everyDays 取模）
   ∧ 当前时间 ≥ atMinute
   ∧ scheduledDays[event.id] ≠ 今天
   ∧ when 条件满足
```

放在这里的好处是调用点已经存在（行动结算、事件结束时都会走），不需要新增钩子。

### 1.4 去重与跳变

```ts
// GameState 新增（可选）
scheduledDays?: Record<string, number>; // 事件 id → 上次触发的日
```

- 日粒度去重：一天至多一次。玩家 9 点触发过，下午再走一次时间不会重复。
- **不回溯**：睡觉从第 3 天 22:00 到第 4 天 08:00，若触发点在第 4 天 07:00，睡醒后仍会触发（已过点、今天未触发）。若触发点在第 3 天 23:00，被睡过去了，就不补——不做"补账"逻辑。
- 记录只按事件条数增长，有界。

### 1.5 与故事链的区别

故事链是"玩家主动推进的线"，周期事件是"世界自己的节拍"。两者共用 `when` 和 `Effect`，但不要互相替代：

- 房租、考试、定期打工 → `trigger`
- 角色的连续剧情 → `StoryChainDef`

## 2. 检定

### 2.1 现状与缺口

行动要么必定成功，要么靠 `resultVariants` 按条件换一句文案。没有"掷骰 → 成败两条分支"。

### 2.2 数据

```ts
// ActivityDef 新增
check?: {
  ref: AttributeRefInput;
  difficulty: Rank;
  /** 概率微调，内容用它表达"这个行动格外难/格外容易"，单位是百分点 */
  shift?: number;
};
failureEffects?: Effect[];
failureTexts?: string[];
```

`check` 存在时，`effects` / `resultTexts` 是**成功**分支，`failureEffects` / `failureTexts` 是失败分支。

### 2.3 概率

```text
chance = 0.5 + (rankIndex(实际) - rankIndex(难度)) × 0.15 + shift
chance = clamp(chance, 0.05, 0.95)
```

同等级 50%，高一级 65%，高两级 80%，低一级 35%。掷骰用现有的 `Rng`，`counter` 照常推进，保证存档可复现。

| 档位 | 显示 |
|---|---|
| ≥ 0.75 | 有把握 |
| 0.45 – 0.75 | 五五开 |
| < 0.45 | 很勉强 |

### 2.4 结算

```ts
export function activityCheck(
  state: GameState,
  activity: ActivityDef,
): { chance: number; passed: boolean } | undefined;
```

- 无论成败都照常扣时间/钱/体力。
- 成功走 `effects` + `resultTexts`，失败走 `failureEffects` + `failureTexts`。
- 缺 `failureTexts` 时回退到 `resultTexts`，但**必须**有一条日志写明失败，否则玩家会以为成功了。
- 结果页与行动按钮都要显示 `activityCheck` 给出的档位。

### 2.5 内容体检

- `check.ref` / `check.difficulty` 必须有效；
- `check.shift` 绝对值 > 40 报 warning（等于把难度抹平了）；
- 有 `check` 但没有 `failureEffects` 也没有 `failureTexts` → warning（成败无差别，检定没意义）。

## 3. 成就监听接口

不实现成就，只留一个发出点。**不写 `GameState`，不进存档。**

```ts
export type GameEvent =
  | { kind: 'activityDone'; activityId: string; passed?: boolean }
  | { kind: 'skillLevelUp'; ref: AttributeRef; rank: Rank; idolId?: string }
  | { kind: 'storyCompleted'; chainId: string }
  | { kind: 'dayStarted'; day: number }
  | { kind: 'equipChanged'; slot: string; equipId?: string };

export type GameEventSink = (event: GameEvent, state: GameState) => void;

/** 默认未注册 = 零开销。 */
export function setGameEventSink(sink?: GameEventSink): void;
```

约定：

- 只在已经发生的既成事实处发（升级、完成、换天），不发"即将"。
- 调用点包 `try/catch`，监听方抛异常不能中断游戏。
- 订阅方拿到的 `state` 是只读引用，不要就地改状态。

将来做成就时，订阅这个 sink 即可，不用回头改 sim。

## 4. 阶段

| 阶段 | 内容 | 验收 |
|---|---|---|
| T0 | `EventTrigger` + 定时池 + `scheduledDays` + 单测 | 每周一 9:00 的 fixture 事件在周一 9:00 后触发一次，同日不重复 |
| T1 | `check` / `failureEffects` / `failureTexts` + `activityCheck` + 单测 | 固定 seed 下成败可复现；成败分支的文案与效果各自生效 |
| T2 | 行动按钮与结果页显示检定档位 | 浏览器里"很勉强"能看到 |
| T3 | `GameEvent` + sink + 单测 | 注册 sink 后能收到升级/完成事件；未注册时无副作用 |
| T4 | 内容体检新增三条规则 | 故意写错能报出来 |

## 5. 陷阱

- **周期事件别进随机池**：带 `trigger` 的事件如果还参与 `after` 抽取，会在同一天触发两次。
- **跳变不补账**：不要写"回填错过的触发"，那会让睡觉变成一个不可预测的事件滚动条。
- **检定别改消耗**：失败也照扣时间/体力/钱。否则失败反而更划算，玩家会故意失败。
- **概率不要外露成精确数字**：显示档位而不是"63%"，避免玩家把游戏玩成概率表。
- **sink 不能持有状态**：它只发通知。任何需要持久化的东西都属于成就系统自己的存档，不是这里的。
- **`Rng` 顺序敏感**：检定会多消耗一次 `next()`，任何"先校验后掷骰"的改动都会让旧存档的后续随机序列变化。可接受，但要在验收里固定 seed 断言。

## 6. 验收

```text
Vitest
  · 定时事件：周一 9:00 前不触发、9:00 后触发、同日不重复
  · everyDays 取模对齐
  · 睡觉跨过触发点后当天补触发一次
  · 检定概率：同等级 50%、每级 ±15%、边界 clamp
  · 固定 seed 下成败可复现
  · 失败分支走 failureEffects 且照扣消耗
  · GameEvent：升级 / 剧情完成 / 换天 各发一次
  · 未注册 sink 时无异常

Playwright
  · 行动按钮显示检定档位
  · 结果页失败文案正确

内容体检
  · check.ref / difficulty 引用
  · 有 check 无失败分支 → warning
  · shift 越界 → warning
```
