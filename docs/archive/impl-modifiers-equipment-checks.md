# 计算接口 / 周期触发 / 检定 / 饰品 实施计划

> 状态：**S0–S8 已完成**
> 设计依据：[统一计算接口与饰品槽](../systems/modifiers-and-equipment.md)、[周期触发 / 检定 / 监听](plan-triggers-and-checks.md)
> 目标版本：`0.19.0`（最后一步才升版本号）

## 1. 目标

让"同一个数字只能在一个地方算"成立，并在这个底座上长出四样东西：

```text
S0  计算接口（纯函数）
S1  四个接入点改走接口        ← 数值必须零变化
S2  周期触发（EventDef.trigger）
S3  检定（ActivityDef.check）
S4  检定 UI
S5  饰品数据（EquipDef / 装备命令 / 槽位解锁）
S6  饰品 UI + 倍率分解
S7  GameEvent 监听接口（成就预留）
S8  内容落地 + 内容体检
```

## 2. 范围外

- 遭遇系统（已否决）
- 成就本体（只留 sink）
- 事件上的检定（先只做行动）
- 商店卖饰品（这一轮用剧情/活动发放，商店集成留到内容管线阶段）
- 训练设施升级（仍是暂缓）

## 3. 阶段详情

### S0 · 计算接口（纯函数，不接任何调用点）

**Files**
- Modify: `src/core/types.ts`（`ModifierKey` / `Modifier` / `ModifierSource`）
- Create: `src/core/modifiers.ts`
- Test: `src/core/modifiers.test.ts`

**Interfaces**

```ts
export type ModifierKey =
  | 'staminaCost' | 'staminaCap' | 'duration' | 'trainingExp' | 'workMoney';

export type Modifier = {
  key: ModifierKey;
  op?: 'mul' | 'add';   // 缺省 mul
  value: number;
  when?: Condition[];
  idolId?: string;
};

export function resolveModifiers(
  state: GameState, key: ModifierKey, ctx?: { idolId?: string },
): number;

export function explainModifiers(
  state: GameState, key: ModifierKey, ctx?: { idolId?: string },
): { total: number; parts: { label: string; value: number }[] };
```

**Steps**
- [ ] 测试：无来源时 `mul` 返回 1、`add` 返回 0
- [ ] 测试：两个 `mul` 连乘（0.9 × 0.9 = 0.81）
- [ ] 测试：两个 `add` 相加（-0.1 + -0.1 → 合计 ×0.8）
- [ ] 测试：`when` 不满足时不参与；`idolId` 作用域正确
- [ ] 测试：add 与 mul 混合 `product × (1 + sum)`
- [ ] 测试：`explainModifiers` 的 parts 与 total 自洽
- [ ] 实现 `modifiers.ts`：收集器目前返回空数组，`modifierSources()` 预留
- [ ] 提交 `feat: add the modifier resolution entry point`

**验收**：纯函数测试通过，`npm test` 全绿且**没有任何生产代码调用它**。

---

### S1 · 四个接入点改走接口（行为零变化）

**Files**
- Modify: `src/core/sim.ts`（`maxStamina` / `activityStaminaCost` / `activityDuration` / `applyAttributeExp` / `applyEffects`）
- Test: `src/core/modifiers.test.ts`（补"改造前后相等"的回归断言）

**Steps**
- [ ] 给 `applyAttributeExp` 增加可选参数 `opts?: { training?: boolean }`，`applyEffects` 把 `options.training` 透传进去
- [ ] `maxStamina` → `Math.round(cap × resolveModifiers(state,'staminaCap'))`
- [ ] `activityStaminaCost` → `Math.max(1, Math.ceil(base × resolveModifiers(state,'staminaCost',{idolId})))`
- [ ] `activityDuration` → `Math.max(1, Math.round(base × resolveModifiers(state,'duration')))`
- [ ] `applyAttributeExp` 训练时 `amount × resolveModifiers(state,'trainingExp',{idolId})`，**取整一次**
- [ ] 工作报酬最终金额乘 `workMoney`
- [ ] 回归测试：无修饰来源时，体力消耗/时长/EXP/报酬与改造前逐条一致
- [ ] 提交 `refactor: route every derived number through resolveModifiers`

**验收**：`npm test` + `npm run acceptance` 全绿；**数值零变化**。这个提交必须单独存在，方便回滚。

**风险**：`stressed` 降级逻辑现在在 `applyEffects` 里，透传时要保证"训练 + 高压"这条路径行为不变——用现有测试覆盖（`balance.test.ts` / `sim.test.ts`）。

---

### S2 · 周期触发

**Files**
- Modify: `src/core/types.ts`（`EventTrigger`、`EventDef.trigger`、`GameState.scheduledDays?`）
- Modify: `src/core/sim.ts`（`checkForEvent` 增加定时池、`buildScheduledPool`）
- Test: `src/core/scheduledEvent.test.ts`

**Interfaces**

```ts
export type EventTrigger = {
  everyDays?: number;   // 与 weekday 二选一
  weekday?: Weekday;
  atMinute: number;
};

// GameState
scheduledDays?: Record<string, number>; // eventId → 上次触发的日
```

**Steps**
- [ ] 测试：周一 09:00 的 fixture 事件，08:59 不触发、09:00 触发
- [ ] 测试：同日第二次检查不重复触发
- [ ] 测试：`everyDays: 3` 在第 1/4/7 天触发
- [ ] 测试：睡觉跨过触发点后当天补触发一次（不回溯更早的）
- [ ] 测试：带 `trigger` 的事件**不会**被行动后的随机池抽到
- [ ] 实现 `buildScheduledPool(state)`，`checkForEvent` 先随机池、后定时池
- [ ] 提交 `feat: add time-based event triggers`

**验收**：`?debug=1` 的事件表能看到定时事件及其"未到点/已触发"状态。

**风险**：`checkForEvent` 是所有行动结算的必经点，加逻辑要保证未命中时零副作用（不改 `rng.counter`）。

---

### S3 · 检定

**Files**
- Modify: `src/core/types.ts`（`ActivityCheck`、`ActivityDef.check` / `failureEffects` / `failureTexts`、`ActivityResultEntry.passed?`）
- Modify: `src/core/sim.ts`（`activityCheck`、`applyActivityDef` 分支）
- Modify: `src/core/scene.ts`（结果文案走成功/失败分支）
- Test: `src/core/activityCheck.test.ts`

**Interfaces**

```ts
export type ActivityCheck = {
  ref: AttributeRefInput;
  difficulty: Rank;
  shift?: number;   // 百分点
};

export function activityCheck(
  state: GameState, activity: ActivityDef, idolId?: string,
): { chance: number; passed: boolean } | undefined;
```

**Steps**
- [ ] 测试：同等级 50%，每级 ±15%，`shift` 生效，边界 clamp 到 0.05 / 0.95
- [ ] 测试：固定 seed 下成败可复现（同一 seed 两次结果相同）
- [ ] 测试：失败走 `failureEffects`，成功走 `effects`，两者都照扣时间/钱/体力
- [ ] 测试：缺 `failureTexts` 时回退 `resultTexts`，但日志必须写明失败
- [ ] 实现 `activityCheck`，在 `applyActivityDef` 里掷一次骰并把 `passed` 写进 `pendingResults`
- [ ] 提交 `feat: add activity checks with success and failure branches`

**验收**：fixture 里加一条检定行动，成功/失败两条文案和效果都正确。

**风险**：掷骰会多消耗一次 `Rng.next()`，旧测试里的固定 seed 断言可能变。先跑全量，把受影响的断言按新序列更新（不改变断言语义）。

---

### S4 · 检定 UI

**Files**
- Modify: `src/core/scene.ts`（`activityActionView` 增加档位标签）
- Modify: `src/ui/components/ScenePanel.tsx`（显示"五五开 / 很勉强"）
- Test: `tests/acceptance/checks.spec.ts`

**Steps**
- [ ] `checkPreview(state, activity)` 返回 `{ chance, label }`，label 三档：有把握 / 五五开 / 很勉强
- [ ] 行动按钮的 hint 追加档位；不显示具体百分比
- [ ] 结果页在失败时给出明确的一句话
- [ ] E2E：打开带检定的行动，能看到档位
- [ ] 提交 `feat: show check odds on actions`

---

### S5 · 饰品数据与状态

**Files**
- Modify: `src/core/types.ts`（`EquipSlot`、`EquipDef`、`GameState.equipment` / `ownedEquips` / `slots`、两个新 `Effect`）
- Modify: `src/core/contentIndex.ts`（`EQUIPS`、`equips` 索引）
- Modify: `src/core/sim.ts`（装备命令、`unlockSlot` / `grantEquip` 效果、`modifierSources` 接上装备）
- Test: `src/core/equipment.test.ts`

**Interfaces**

```ts
export type EquipSlot = 'charm';

export type EquipDef = {
  id: string;
  name: string;
  slot: EquipSlot;
  description: string;
  modifiers: Modifier[];
  icon?: string;
};

// GameState（全部可选，无迁移）
equipment?: Record<string, string>;    // 'charm1' → equipId
ownedEquips?: string[];
slots?: Partial<Record<EquipSlot, number>>;  // 缺省 charm: 1

// Effect
| { kind: 'unlockSlot'; slot: EquipSlot; amount?: number }
| { kind: 'grantEquip'; equipId: string }
```

**Steps**
- [ ] 测试：默认 1 个槽；`unlockSlot` 后 `charmSlotCount` 变 2
- [ ] 测试：`grantEquip` 幂等（重复发放不重复入包）
- [ ] 测试：`equip` 放进第一个空槽；槽满时拒绝
- [ ] 测试：`unequip` 后倍率恢复
- [ ] 测试：装备的 `modifiers` 真的进到 `resolveModifiers`（体力消耗下降）
- [ ] 实现 `charmSlotCount` / `equip` / `unequip` / `grantEquip` / `unlockSlot`
- [ ] `modifierSources` 把已装备饰品的 modifiers 标上 `label: 饰品名`
- [ ] 提交 `feat: add charm slots and equipment modifiers`

**验收**：装上一件"体力消耗 ×0.9"的 fixture 饰品，`activityCost` 的结果按预期下降。

---

### S6 · 饰品 UI

**Files**
- Modify: `src/ui/components/BackpackModal.tsx`（饰品区 + 装备中标记）
- Create: `src/ui/components/EquipSlotList.tsx`
- Modify: `src/App.tsx`（`equip` / `unequip` 命令接线）
- Modify: `src/index.css`
- Test: `tests/acceptance/equipment.spec.ts`

**Steps**
- [ ] 背包增加"饰品"分区，列出已拥有未装备的饰品
- [ ] 装备栏显示 `charm1..N`，空槽显示"空"，已装备显示名字 + 卸下按钮
- [ ] 点饰品上的"为什么"展开 `explainModifiers` 的分解
- [ ] E2E：装备 → 行动页面体力消耗数字变化 → 分解面板列出饰品名
- [ ] 提交 `feat: equipment panel with modifier breakdown`

---

### S7 · GameEvent 监听接口

**Files**
- Create: `src/core/gameEvents.ts`
- Modify: `src/core/sim.ts`（升级、剧情完成、换天、装备变化处各发一次）
- Test: `src/core/gameEvents.test.ts`

**Interfaces**

```ts
export type GameEvent =
  | { kind: 'activityDone'; activityId: string; passed?: boolean }
  | { kind: 'skillLevelUp'; ref: AttributeRef; rank: Rank; idolId?: string }
  | { kind: 'storyCompleted'; chainId: string }
  | { kind: 'dayStarted'; day: number }
  | { kind: 'equipChanged'; slot: string; equipId?: string };

export function setGameEventSink(sink?: (event: GameEvent, state: GameState) => void): void;
```

**Steps**
- [ ] 测试：注册 sink 后升级/完成/换天各收到一次
- [ ] 测试：未注册时无异常、无状态变化
- [ ] 测试：sink 抛异常不中断流程
- [ ] 实现并接线
- [ ] 提交 `feat: add a game event sink for future achievements`

**验收**：`GameState` 没有新字段，存档格式不变。

---

### S8 · 内容落地与体检

**Files**
- Modify: `src/core/content/equips.ts`（新，1 件饰品）
- Modify: `src/core/content/index.ts`（`EQUIPS`）
- Modify: `src/core/content/activities/*.ts`（一条检定行动 + 一条解锁槽位的行动）
- Modify: `src/core/contentAudit.ts`
- Modify: `src/save/version.ts`（`0.19.0`）

**Steps**
- [ ] 内容：1 件饰品（体力消耗 ×0.9），通过剧情 flag + `grantEquip` 发放
- [ ] 内容：一个活动解锁 `charm` 槽位（`unlockSlot`）
- [ ] 体检：`Modifier.key` 拼写；同一 `key` 乘算项数 > 3 → warning
- [ ] 体检：`check.ref` / `difficulty` / `shift` 范围；有 `check` 无失败分支 → warning
- [ ] 体检：`EquipDef.modifiers` 引用的 key 合法
- [ ] 全量验收 + `content:audit`
- [ ] 提交 `content: one charm and one check action`

---

## 4. 提交顺序与回滚点

```text
S0  纯新增，可独立回滚
S1  行为零变化的重构 —— 唯一必须单独成 commit 的阶段
S2  新增字段 + 一个检查点
S3  会改变部分既有行动的结算（新字段才有用，默认不影响）
S4  UI
S5  新增状态与命令
S6  UI
S7  纯新增
S8  内容 + 体检 + 版本号
```

任何一步出问题，回滚到上一个提交都不会让存档失效——所有新增字段都是可选的。

## 5. 总工时估计

| 阶段 | 估计 |
|---|---|
| S0 + S1 | 1 天 |
| S2 | 0.5 天 |
| S3 + S4 | 1 天 |
| S5 + S6 | 1.5 天 |
| S7 | 0.3 天 |
| S8 | 0.5 天 |
| 合计 | **约 4.5 天** |

## 6. 已确认

| 编号 | 问题 | 结论 |
|---|---|---|
| Q1 | 饰品获取方式 | 走剧情/活动发放（`grantEquip`），**不进商店** |
| Q2 | 槽位上限 | 不设硬上限，**靠内容控制**；体检不加"最多 3 个"的 warning |
| Q3 | 检定失败的消耗 | 照扣时间/钱/体力，无返还 |
| Q4 | `workMoney` | 这一轮**不接**，等正式内容有工作再挂上 |

## 7. 执行裁决

| 项 | 裁决 | 理由 |
|---|---|---|
| 直接在 `main` 上执行 | 不建 worktree | 本仓库一直如此工作，你已要求直接开工并推送 |
| `resolveModifiers` 的落点 | 纯计算放 `src/core/modifiers.ts`；状态相关部分（`modifierSources` / `resolveModifiers` / `explainModifiers`）放 `src/core/sim.ts` | `Modifier.when` 要调 `checkCondition`，而它依赖 `sim.ts` 里的 `resolveAttribute` / `isActorPresent`；反向导入会形成循环。纯函数仍独立可测 |
| S1 的接入范围 | 只接 `staminaCost` / `staminaCap` / `duration` / `trainingExp` | 见 Q4 |

## 8. 完成记录

| 阶段 | 提交 | 备注 |
|---|---|---|
| S0+S1 | `a4eed05` | 合并提交：接口一接上，两者之间没有可回滚的有意义状态 |
| S2 | `bda9757` | `checkScheduledEvent` 单独导出，测试不靠随机事件 |
| S3 | `912978f` | 掷骰复用行动同一条 RNG |
| S4 | `5a8111d` | 档位进 hint；浏览器断言挪到 S8 |
| S5 | `19ebb8d` | `EquipDef` / 命令 / 两个新 Effect |
| S6 | `868c223` | 背包饰品区；fixture 加发放活动供 E2E |
| S7 | `32f969c` | sink 只发不存 |

**S8 的裁决**：正式内容（饰品、检定行动、槽位解锁）这一轮**不加**。
你此前定过"等架构冻结再做内容"，加正式饰品会提前占掉那条线。
因此 S8 只做体检规则、版本号与文档，内容验证全部留在 fixture
（`equip.test.watch` / `equip.test.ribbon` / `test_old_drawer`）。
