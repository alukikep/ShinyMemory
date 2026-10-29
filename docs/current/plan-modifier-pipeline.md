# 统一计算接口与饰品槽计划

> 状态：设计待确认，未动工
> 目标版本：`0.19.0`
> 存档：新增可选字段，`SAVE_VERSION` 不变
> 前置：无（这是装备、设施、增益的共同底座）

## 0. 已确认决策

| 编号 | 决策点 | 结论 | 来源 |
|---|---|---|---|
| D1 | 要不要引入倍率管线 | 要。散在各处的 `×0.95` 迟早互相打架 | 你 |
| D2 | 入口形态 | 一个 `resolveModifiers(state, key, ctx)`，不为每个倍率开函数 | 我 |
| D3 | 叠加规则 | 同类相加、跨类相乘，**全程只取整一次** | 我 |
| D4 | 饰品槽 | RPG 式饰品槽，一个槽起步，类型可扩展 | 你 |
| D5 | 饰品的表达 | 纯数据：`modifiers: Modifier[]`，不写代码、不加 `Effect` | 我 |
| D6 | 存档 | 只存"装了哪个饰品"，倍率是派生值不入档 | 我 |
| D7 | 可解释性 | 必须能给出"这个数是怎么来的"分解，和手册的 blocked 原因同一标准 | 我 |

## 1. 问题

现在的计算分散在四个地方，各自硬编码：

```ts
maxStamina(state)              → STAMINA_CAP_BY_RANK[rank]
activityStaminaCost(...)       → base × STAMINA_COST_MULTIPLIER_BY_RANK[rank]
activityDuration(...)          → activity.durationMinutes        // 直通
applyEffects · attributeExp    → training && stressed ? reduceExpTier(tier) : tier
```

加一件"体力消耗 ×0.9"的饰品，这四处没有一个能接。更要紧的是：一旦开始接，每加一件装备就要改一次这四个函数，而且取整会在每一层各做一次，最后数值会漂。

所以先做底座，再做饰品。饰品只是这个底座的第一个使用者，不是特例。

## 2. 目标形态

### 2.1 数据

```ts
// src/core/types.ts
export type ModifierKey =
  | 'staminaCost'    // 行动体力消耗
  | 'staminaCap'     // 体力上限
  | 'duration'       // 行动时长
  | 'trainingExp'    // 训练获得的 EXP
  | 'workMoney';     // 工作报酬

export type Modifier = {
  key: ModifierKey;
  /** 缺省 mul。mul 连乘，add 先各自相加。 */
  op?: 'mul' | 'add';
  value: number;
  /** 不满足时这条不生效。 */
  when?: Condition[];
  /** 只对某个偶像生效；省略 = 全体。 */
  idolId?: string;
};
```

`Modifier` 不带来源信息。来源由**收集器**决定：

```ts
type ModifierSource = {
  /** 展示用，同时用于分解面板 */
  label: string;
  modifiers: Modifier[];
};
```

### 2.2 解析

```ts
export function resolveModifiers(
  state: GameState,
  key: ModifierKey,
  ctx: { idolId?: string } = {},
): number;
```

规则，写死：

```text
add 部分：sum = Σ value            （无则为 0）
mul 部分：product = Π value        （无则为 1）
结果 = product × (1 + sum)
```

- 同类相加，跨类相乘：两件"消耗 ×0.9"是 ×0.81 还是 ×0.8，取决于它们都写 `op: 'mul'`（连乘）还是 `op: 'add'`（`value: -0.1`，合计 ×0.8）。**内容选哪种，数值就按哪种算，引擎不猜。**
- 只在调用方**最后一步**取整。中间层一律用浮点。

收集器：

```ts
function modifierSources(state: GameState, ctx): ModifierSource[];
```

当前只有装备。以后设施等级、临时增益、偶像心情往这里加一行，所有计算自动生效。

### 2.3 接入点改造

| 函数 | 改成 |
|---|---|
| `maxStamina` | `Math.round(baseCap × resolveModifiers(state,'staminaCap'))` |
| `activityStaminaCost` | `Math.max(1, Math.ceil(base × resolveModifiers(state,'staminaCost',{idolId})))` |
| `activityDuration` | `Math.max(1, Math.round(base × resolveModifiers(state,'duration')))` |
| `applyAttributeExp` | 增加可选参数 `opts?: { training?: boolean }`；`amount = EXP_TIER_VALUES[tier]`，训练时再 `× resolveModifiers(state,'trainingExp',{idolId})`，**取整后**累加 |
| 工作报酬结算 | 最终金额 `× resolveModifiers(state,'workMoney')` |

`applyAttributeExp` 现在没有 context，训练标记只在 `applyEffects` 里算过。所以要把 `training` 透传下来——这正是"需要改造统一数据计算接口"的那部分。

### 2.4 分解（可解释性）

```ts
export function explainModifiers(
  state: GameState,
  key: ModifierKey,
  ctx?: { idolId?: string },
): { total: number; parts: { label: string; value: number }[] };
```

UI 用它在饰品面板、行动按钮、手册的 `blocked` 原因里显示同一套来源。没有这个，玩家看到体力消耗 0.62 只会以为有 bug。

### 2.5 饰品

```ts
// types.ts
export type EquipSlot = 'charm';

export type EquipDef = {
  id: string;
  name: string;
  slot: EquipSlot;
  description: string;
  modifiers: Modifier[];
  price?: number;
  icon?: string;
};

// GameState
equipment?: Partial<Record<EquipSlot, string>>;
```

- 饰品走现有的 `ITEMS` / `SHOPS` / 背包？**不。** 物品是"数量"，饰品是"唯一实例 + 槽位"，混进 `inventory: Record<string, number>` 会立刻别扭（两件同名饰品、装备后从背包移出、卖出时检查是否装备中）。
- 新增 `EQUIPS: EquipDef[]` 与 `ContentIndex.equips`，商店加一个 `sells: 'items' | 'equips'` 或独立 `equipShop` 列表。
- 装备/卸下是命令：`{ type: 'equip'; equipId: string }` / `{ type: 'unequip'; slot: EquipSlot }`。不消耗时间（和购买/赠送一致）。

## 3. 阶段

| 阶段 | 内容 | 验收 |
|---|---|---|
| M0 | `Modifier` 类型 + `resolveModifiers` + `explainModifiers` + 单测 | 纯函数测试：add/mul 混合、`when` 过滤、`idolId` 作用域、只取整一次 |
| M1 | 四个接入点改走管线，**行为不变**（无装备时总和为 1） | 全量测试通过，数值逐条与改造前一致 |
| M2 | `EquipDef` / `EQUIPS` / 装备命令 / 存档字段 | fixture 装一件加成分，体力消耗与训练 EXP 按预期变化 |
| M3 | 背包里的饰品区 + 装备栏 + `explainModifiers` 分解显示 | 浏览器里装备 → 行动消耗数字变化 → 分解能对上 |
| M4 | 正式内容 1 件饰品 + 商店条目 | 内容体检 0 错误，production 包能买到并装上 |

M1 是纯重构，必须单独一个提交，且验收标准是"数值零变化"。

## 4. 陷阱

- **取整漂移**：中间层取整会让 0.95×0.95 变成 0.9025 → 0.9 → 再乘又变。只允许在最外层取整一次。
- **乘算通胀**：三个"×1.2 训练加成"叠起来是 1.728。内容体检要限制同一 `key` 的乘算项数（建议 ≤ 3），超出报 warning。
- **饰品混进物品系统**：见 2.5。`inventory` 是计数，槽位是唯一实例，两者语义不同。
- **装备影响条件判定**：`resolveAttribute` 读的是 rank，不吃倍率。如果以后想让饰品改 rank，那是另一件事（`attributeBonus`），别混进 `Modifier`。
- **存档不存派生值**：`equipment` 存 id，其余每次现算。否则改一件饰品的数值会让旧存档停在旧值。
- **UI 与结算同源**：行动按钮上的消耗必须调 `activityCost(state, activity)`，不能自己算一遍——这次改造之后这条更重要，因为倍率来源变多了。

## 5. 验收

```text
Vitest
  · resolveModifiers：add / mul / 混合 / when 过滤 / idolId 作用域
  · 同一 key 两个 mul 是连乘；两个 add 是相加
  · activityStaminaCost 只取整一次（0.95×0.95 不出现二次取整误差）
  · 无装备时所有数字与改造前逐条一致
  · applyAttributeExp 的训练加成只作用于 training 上下文

Playwright
  · 装备饰品后，行动按钮上的体力消耗数字变化
  · 分解面板列出来源

内容体检
  · Modifier 的 key 拼写、同一 key 乘算项数上限
```
