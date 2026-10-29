# 内容状态：数值、延迟触发与移动倍率

> 当前有效 · `0.20.0` 起
> 存档：`vars` / `pendingEvents` 为可选字段，不迁移
> 动机：让"进度条 / 倒计时 / 攒够 N 次"这类内容能写出来，而不引入新玩法

## 0. 已确认决策

| 编号 | 决策点 | 结论 | 来源 |
|---|---|---|---|
| D1 | 做的是内容能力还是玩法 | 只补原语，不实现农场/咖啡馆/敲门 | 你 |
| D2 | 数值状态形态 | `GameState.vars: Record<string, number>`，与 `flags` 对称 | 我 |
| D3 | 延迟触发 | 一次性"第 N 天触发事件"，与周期触发并存 | 我 |
| D4 | 移动耗时 | 接进倍率管线，新增 `travel` key | 我 |
| D5 | 存档 | 全部可选字段，不迁移 | 我 |
| D6 | 不做的 | 世界对象、程序化生成、遭遇、产量系统 | 我 |

## 1. 现在的缺口

三种 DoL 玩法考察下来，缺的其实是**同一块拼图**：

```text
农场     清地 0–100、阶段 1–6、累计工时 60  → 需要读写数字
咖啡馆   卖出的面包 50/200/400 → 晋升        → 需要读写数字
农场升级 工期 2 天 ~ 2 周                    → 需要倒计时
敲门杂活 （什么都不缺）
```

现在 `GameState` 里能存的东西只有：布尔 `flags`、`storyChains[].stepIndex`、`eventCooldowns`（记的是行动次数）、`actors[].affinity`。都是专用字段，没有通用的数字。

于是"这块地清了 60%"只能拆成 60 个布尔 flag，没人会那么写。

## 2. 目标形态

### 2.1 数值：`vars`

```ts
// GameState（新增，可选）
vars?: Record<string, number>;

// Condition
| { kind: 'varAtLeast'; key: string; value: number; label?: string }
| { kind: 'varAtMost'; key: string; value: number; label?: string }

// Effect
| { kind: 'var'; key: string; op?: 'set' | 'add'; value: number }
```

读：未写过 = 0。写：缺省 `add`，`set` 用来初始化或重置。

和 `flags` 完全对称，内容作者不用学新东西：

```ts
// 清地：每干一次 −10，到 0 就开新地
{ kind: 'var', key: 'farm.clearing', op: 'add', value: -10 }
// 判断
{ kind: 'varAtMost', key: 'farm.clearing', value: 0, label: '这块地' }
```

`label` 是可选的显示名，给手册和调试面板用；没有就回退成通用句。它不参与结算，只参与解释。

### 2.2 延迟触发：一次性事件

周期触发（`EventDef.trigger`）解决"每周一"；这里缺的是"**七天后的今天**"。

```ts
// Effect
| { kind: 'scheduleEvent'; eventId: string; inDays: number }

// GameState（新增，可选）
pendingEvents?: { eventId: string; day: number }[];
```

- 入队时算出绝对日（`今天 + inDays`），
- 每次回到计划阶段时（和 `checkScheduledEvent` 同一个检查点）看有没有到期项，
- 到期就按优先级触发一条，出队。

升级的工期、剧情链的"过几天再说"、预约面试，都用这一条表达。

### 2.3 移动耗时接进管线

`moveTo` / `takeTransit` 原先直接用 `WALK_EDGES` / `TRANSIT_ROUTES` 的分钟数，绕过了 `resolveModifiers`。现在统一走：

```ts
export function travelMinutes(state: GameState, base: number): number {
  return Math.max(1, Math.round(base * resolveModifiers(state, 'travel')));
}
```

`ModifierKey` 加 `'travel'`。这样"马厩扩建 → 往返更快"这类升级才有效果可挂。

## 3. 计划落地后，三种玩法的覆盖变化

| 玩法 | 现在 | 之后 | 还缺什么 |
|---|---|---|---|
| 咖啡馆 | 70% | 95% | 无（晋升靠 vars） |
| 敲门杂活 | 75% | 85% | 无（只差文本量） |
| 农场经营 | 40% | 85% | 无（进度/阶段/工时全是 vars） |
| 农场升级 | 60% | 95% | 无（工期靠 scheduleEvent） |
| 防御 / 遭袭类升级 | 0% | 0% | 不做，跟遭遇系统一起砍掉 |

剩下那 10–15% 都不是机制，是文本量。

## 4. 落地记录

| 阶段 | 内容 | 验收 |
|---|---|---|
| V0 | `vars` 类型 + 读写 + 两个条件 + 一个效果 + 单测 | 纯函数测试：默认 0、add/set、边界、跨存档保留 |
| V1 | `scheduleEvent` 效果 + `pendingEvents` 队列 + 到期检查 | 第 3 天排一个 7 天后的；第 10 天触发一次，不重复 |
| V2 | 内容体检 + 调试面板 + `describeCondition` | 读而未写的 var 报 warning；`?debug=1` 能看到所有 vars；未满足条件能说人话 |
| V3 | `travel` 接进管线 | 无修饰时移动耗时与改造前逐条一致；加一个 travel 修饰后变短 |
| V4 | fixture 演示一条完整链 | 「清地 → 变量递减 → 到 0 解锁下一步 → 升级倒计时 → 到期生效」全流程可跑 |

V0 单独提交，V3 是纯重构（数值零变化），其余各自独立。

## 5. 陷阱

- **别把 vars 当第二套 flags**：能用 flag 表达的就用 flag。vars 只给"需要数到 2 以上"的东西，否则会变成一堆 0/1 数字。
- **键名要有命名空间**：`farm.clearing`、`cafe.buns`，体检检查点号前缀，避免 `clearing` 撞车。
- **倒计时不要在展示层减**：只在每日检查点减/结算，否则刷新界面会让工期凭空缩短。
- **移动是纯重构**：V3 必须验证"没有修饰时耗时完全一致"，和之前 `activityDuration` 一样的标准。
- **别顺手做产量系统**：`vars` 能存"蛋的数量"，但要不要有"蛋"是内容决定，不是架构决定。
- **调试面板必须能看见 vars**：没有这个，数值类 bug 会变成"我记得我攒够了但没触发"。

## 6. 验收

```text
Vitest
  · vars 默认 0；add / set 正确；负数允许
  · varAtLeast / varAtMost 边界
  · 未写过的 var 被读时不报错
  · scheduleEvent：第 N 天触发一次、不重复、出队
  · 到期检查和周期检查不互相吞掉
  · travelMinutes 无修饰时与原值一致

Playwright
  · 调试面板列出 vars
  · fixture 的演示链从头走到尾

内容体检
  · var 读了但从未写过 → warning
  · var 键名不符合命名空间规范 → warning
```
