# 统一属性与上下文整理计划

> 状态：方案已确认，尚未动工
> 目标版本：`0.17.0`
> 存档：`SAVE_VERSION 12 → 14`
> 内容纪元：`CONTENT_EPOCH 3` 保持不变（正式内容 ID 未变）

## 0. 已确认决策

| 编号 | 决策点 | 结论 |
|---|---|---|
| D1 | 属性引用方式 | 统一成 `AttributeRef { scope, key }`，结算走同一个 `resolveAttribute()` |
| D2 | 收益结算 | `terms` 列表 + `combine: 'sum' \| 'product'`，默认 `sum` |
| D3 | 制作人「体力」 | 作为属性存在，驱动 `shared.stamina` 上限与恢复速率；本轮不实现 |
| D4 | 「当前偶像」 | 只留 `selectedIdolId`，删除 `activeIdolId` 与 `pendingIdolId` |
| D5 | 多目标结算 | 单目标核心 + 外层循环 |
| D6 | 侧栏多偶像 | 延后，等有第二个正式偶像再做 |
| R | 失败判定 | 与收益共用同一份 `terms`，取最差 gap |
| — | 制作人倍率表 | `1.0 – 1.5`（只加不减） |
| — | 乘法项数 | 建议 ≤ 2，超出进审查 warning |
| — | 首版属性 | 只做「摄影」 |

## 1. 目标形态

### 属性

```ts
type ProducerStatKey = 'photography';

type AttributeRef =
  | { scope: 'idol'; key: IdolStatKey }
  | { scope: 'producer'; key: ProducerStatKey };

type ProducerStats = Record<ProducerStatKey, IdolAttribute>;

// GameState 新增
producer: ProducerStats;
```

`AttributeRef` 与偶像属性共用 `IdolAttribute`（`rank / exp / maxRank`）和 `RANK_CURVE`，不引入第二套成长曲线。

### 属性解析的单一入口

```ts
function resolveAttribute(
  state: GameState,
  ref: AttributeRef,
  idolId?: string,
): IdolAttribute;
```

所有条件、效果、工作结算都只经过这一个函数。引擎里不再出现“偶像分支 / 制作人分支”。

### 收益

```ts
type WorkTerm = {
  attribute: AttributeRef;
  weight?: number;                              // 仅 sum 模式有效
  multipliers?: Partial<Record<Rank, number>>;  // 按项覆盖倍率表
};

type WorkReward = {
  baseMoney: number;
  terms: WorkTerm[];
  combine?: 'sum' | 'product';                  // 默认 'sum'
};
```

```
sum     : multiplier = Σ(weight × multiplier)，空 terms → 1.0
product : multiplier = Π(multiplier)
```

“不算制作人” = 列表里没有制作人项；“不算偶像” = 列表里没有偶像项。两者都不需要引擎分支。

### 失败风险

```ts
type WorkRisk = {
  attribute?: AttributeRef;   // 省略 = 对全部 terms 计算
  minRank?: Rank;             // 省略 = F
  safeRank: Rank;
  failureByGap?: Partial<Record<number, number>>;
  failureEventId?: string;
  successEventId?: string;
};
```

省略 `attribute` 时，对 `workReward.terms` 的每一项各算一次 gap，取**最大 gap**（短板决定风险）。

### 三种工作形态

```ts
// 1. 只看偶像 VO
workReward: { baseMoney: 3000, terms: [{ attribute: { scope: 'idol', key: 'vocal' } }] }

// 2. 只看制作人摄影
workReward: { baseMoney: 2000, terms: [{ attribute: { scope: 'producer', key: 'photography' } }] }

// 3. 偶像 VO × 制作人摄影
workReward: {
  baseMoney: 4000,
  combine: 'product',
  terms: [
    { attribute: { scope: 'idol', key: 'vocal' } },
    { attribute: { scope: 'producer', key: 'photography' } },
  ],
}
```

### 默认倍率表

```ts
DEFAULT_REWARD_MULTIPLIERS   // 偶像    F 0.8 … S 1.8
DEFAULT_PRODUCER_MULTIPLIERS // 制作人  F 1.0 … S 1.5
```

按 `scope` 选默认表，`WorkTerm.multipliers` 可逐项覆盖。

## 2. 阶段

### P0 · 上下文整理（纯重构，行为不变）· 已完成

目标：删掉隐式的全局偶像上下文。

- [x] `GameState.activeIdolId` → `selectedIdolId`
- [x] `pendingIdolId` → `pendingIdolReturnId`（见下方偏差说明）
- [x] `selectedIdolId` 只由 UI 写入（进入偶像页、侧栏点选、参与工作）
- [x] 删除 `applyActivity` 里的 `next.activeIdolId = idolId`
- [x] 去掉以下函数的 `idolId = state.activeIdolId` 默认值，改为显式传参：
  - `getIdolAttribute` / `getRank` / `applyIdolExp` / `getStatValue`
  - `workRewardPreview` / `workRewardSummary` / `workRiskPreview` / `workRiskSummary`
  - `activityAvailability` / `applyActivity`
- [x] `activityAvailability` 的 `idolId` 改为可选，但 `target` 需要偶像时必须传（缺失即判定失败）
- [x] `StatsPanel` / `IdolRoster` 改用 `selectedIdolId`
- [x] `jobs` 收成必填，删除 4 处 `state.jobs?.`
- [x] `STAT_MAX` 删除 `vocal` / `dance` / `expression` / `trust` 四条死值
- [x] 存档 `SAVE_VERSION 13`：`activeIdolId` / `pendingIdolId` → `selectedIdolId`

行为验收：

```text
188 个 Vitest 全绿
新游戏 → 序章 → 相遇 → 招募后，侧栏偶像不随行动跳变
偶像页的可用性判定基于当前页面的偶像，而不是全局指针
```

**偏差说明：`pendingIdolId` 没有删除，而是改名为 `pendingIdolReturnId`。**

原字段同时承担两个职责：偶像页的显示目标，以及行动结束后回到哪个偶像页。前者由 `selectedIdolId` 接管，后者需要一个独立字段——否则离开偶像页后再做地点页行动，会被错误地送回偶像页。改名后职责单一：只有 `train` / `work` / 偶像页活动会写它，`continueFromActivity` 消费它。

**顺带修正：** `applyEffects` 的 `idolExp` 效果现在要求显式偶像上下文，缺失即报错。事件和对话在无显式目标时回退到 `selectedIdolId`，并在代码里注明。`getIdol` 也去掉了「找不到就返回第一个偶像」的兜底，改为直接报错。

### P1 · 多目标行动 · 已完成

- [x] `ActivityTarget` 增加 `'all-present-idols'`
- [x] `activityTargets(state, activity, idolId?)` 解析目标列表
- [x] `applyActivityDef(state, activity, idolId?)` 承载结算逻辑（可脱离内容表测试）
- [x] `applyActivity()` 只做查表 + 转调
- [x] 克隆一次 → 扣一次体力/金钱 → 走一次时间 → 按目标循环结算
- [x] `activityAvailability` 支持多目标：没有在场偶像时隐藏
- [x] `buildPlan` 允许 `all-present-idols` 的行动出现
- [x] `buildActivityResult` 支持多段结果（每个偶像一个 block）
- [x] `GameState` 增加 `pendingResults?: ActivityResultEntry[]`
- [x] 偶像页不显示多目标行动
- [x] fixture 增加 `group_greeting` 作为多目标回归

关键约束：**体力、金钱、时间只扣一次**，只有效果和结果按偶像数量复制。

验收：

```text
同一地点两名在场偶像，地点页一次行动对两人都生效
时间只前进一次，体力只扣一次
偶像页的自由时间仍然只作用于当前偶像
```

**偏差说明：**

1. 计划里的 `applyActivityToIdol(next, activity, idolId)` 没有单独导出。结算循环需要共享同一份 `stamina` / `stressed` / RNG，拆成独立函数反而要把这些当参数传递。改为内部按目标 `map` 结算，并把入口拆成 `applyActivityDef`（逻辑）+ `applyActivity`（查表），测试价值相同。
2. `pendingActivityIdolIds` 改为 `pendingResults: Array<{ idolId, text }>`。结果文本是随机抽取的，只存 id 无法在之后还原同一段叙事。

**规则：多目标行动不能带工作结算。** `workReward` / `workRisk` 依赖单一偶像的失败/成功事件跳转，与多目标冲突。`activityAvailability` 会直接隐藏这类配置，`content.test.ts` 也有断言。

**规则：`sharedStat` 效果按偶像各算一份。** 多目标行动的体力/压力增减会乘以人数；`cost` 只扣一次。结果页因此把消耗和「每人」效果分开显示。

### P2 · 统一属性 · 已完成

- [x] `types.ts`：`ProducerStatKey` / `ProducerStats` / `AttributeRef` / `AttributeRefInput`
- [x] `GameState.producer` 初始化（摄影 F / 0 exp）
- [x] `resolveAttribute()` 成为唯一属性读取入口
- [x] `applyAttributeExp()` 取代 `applyIdolExp()`
- [x] `Condition`：`attributeAtLeast { ref, rank }` 取代 `rankAtLeast`
- [x] `Effect`：`attributeExp { ref, tier, direction? }` 取代 `idolExp`
- [x] `WorkReward.checks` → `WorkReward.terms`
- [x] `WorkTerm.multipliers` 逐项覆盖，默认表按 `scope` 选择
- [x] `WorkRisk.ref` 可选；省略时对全部 terms 取最差 gap
- [x] `workRewardPreview` / `workRiskPreview` 改为基于 terms
- [x] `effectSummary` 支持制作人 EXP 展示
- [x] 侧栏增加制作人区块（摄影 rank / exp）
- [x] 存档 `SAVE_VERSION 14`：初始化 `producer`
- [x] 审查与校验：
  - [x] `terms` / `combine` / `AttributeRef` 的 schema
  - [x] 禁止：`combine: 'product'` 时出现 `weight`

验收：

```text
三种形态各有一条 fixture 工作通过
sum 模式在现有单偶像工作上与原加权平均逐位一致
product 模式下制作人倍率表落在 1.0–1.5
风险省略 attribute 时取最差项
```

**偏差说明：**

1. **存档不需要迁移 `checks` → `terms`。** 内容定义不进入存档，只有状态进入。所以 14 只做 `producer` 初始化，比计划少一半工作。
2. `AttributeRefInput = IdolStatKey | AttributeRef`。内容里可以直接写 `ref: 'vocal'`，制作人才写 `{ scope: 'producer', key: 'photography' }`。避免每一条偶像内容都套一层对象。
3. **只用一条规则替代了原计划的 schema + warning 两条**：`content.test.ts` 断言 `product` 模式下 `weight` 必须缺省。这比「warning 提示」更早暴露问题。
4. 三种形态的验证放在 `sim.test.ts` 用合成 `WorkReward` 覆盖（`workRewardPreview` / `workRiskPreview` 是纯函数），不新增正式内容。fixture 工作留到 P3。

**验证结果：** 迁移后所有工作数值不变。因为旧内容权重合计为 1，`Σ(w × m)` 与原加权平均逐位相等。

### P3 · 验证 · 已完成

- [x] fixture 增加 3 条工作，覆盖三种形态
  - `demo_recording`：只看偶像歌唱
  - `photo_shoot`：只看制作人摄影
  - `cover_shoot`：表现 × 摄影（`product`），风险省略 `ref` 取最差
- [x] Vitest：`sum` / `product` / 单项 / 空 terms / 风险取最差 / 条件与效果泛化
- [x] 全部 E2E（引擎、内容、序章、审查）

### P4 · 之后（不在本轮）

- [ ] 制作人「体力」属性：驱动 `shared.stamina` 上限与恢复速率
- [ ] 口才属性
- [ ] 侧栏多偶像展示（D6）
- [ ] 正式内容

## 3. 关键陷阱

1. **多目标不能循环调用完整的 `applyActivity`**，否则体力、金钱、时间会被扣 N 次。成本必须留在外层。
2. **`product` 下的 `weight` 没有定义**。允许存在会让内容作者写出难以解释的配置，应在审查阶段报错。
3. **空 `terms` 必须兜底为 1.0**，否则收入归零。
4. **两次存档迁移**：P0 做字段改名（13），P2 做属性与 terms（14）。不要合并，否则一次迁移里同时改语义和结构，出问题难定位。
5. **`sum` 模式的权重是绝对贡献**，不再是相对份额。写内容时总和决定收益上限。

## 4. 开工顺序

```text
P0 上下文整理 → P1 多目标 → P2 统一属性 → P3 验证
```

每阶段单独提交，P0/P1 不改变玩法数值，P2 才引入制作人属性。
