# 未来需求记录

> 状态说明：第 1–3 节的方案已经确定，实施步骤见
> [统一属性与上下文整理计划](plan-unified-attributes.md)。
> 本文档只保留需求与规则本身，不再重复实施顺序。

## 1. 活动目标规则

当前规则：

```text
地点页：无偶像对象的制作人/生活行动
偶像互动页：需要明确偶像对象的行动
```

已实现：

- `ActivityDef.target?: 'none' | 'present-idol' | 'all-present-idols'`
- `free` 标记为 `present-idol`
- `group_greeting`（fixture）标记为 `all-present-idols`
- 地点页过滤 `present-idol` 活动
- 偶像页过滤 `all-present-idols` 活动
- 偶像互动页展示当前在场偶像的 `bond` 活动
- 活动命令显式携带 `idolId`

未来规则：

1. **地点页行动作用于所有在场偶像时，不做额外选择**
   - 行动直接作用于当前地点所有符合条件的在场偶像。
   - 不弹出目标选择器。
   - 如果当前地点没有符合条件的偶像，行动隐藏。
   - 每个目标分别应用效果和结果文本。

2. **需要选择特定偶像的活动放在偶像交互页**
   - 例如自由时间、单独吃饭、单独散步、关系剧情。
   - 目标由进入偶像页时确定。
   - 不在地点页显示多目标选择。

3. 未来可增加：

```ts
target?: 'none' | 'present-idol' | 'all-present-idols' | 'selected-idol';
```

其中：

- `all-present-idols`：地点页行动，作用于当前地点所有在场偶像。
- `selected-idol`：仅在偶像交互页出现。

已确认的结算约束：

- 一次行动只扣一次体力、金钱和时间。
- 每个在场偶像分别结算效果与结果文本。
- 没有符合条件的在场偶像时，行动隐藏。
- 实施结构采用“单目标核心 + 外层循环”。
- 多目标行动不能带 `workReward` / `workRisk`（依赖单偶像的成败事件跳转）。
- `sharedStat` 效果按偶像各算一份；`cost` 只扣一次。

## 2. 制作人属性

制作人属性与偶像属性**是同一套东西**，只是作用域不同：偶像属性只作用于单个偶像，制作人属性对所有偶像全局生效。

已实现：

- 统一引用 `AttributeRef { scope: 'idol' | 'producer', key }`。
- 内容里可直接写偶像属性名（`ref: 'vocal'`），等价于 `{ scope: 'idol', key }`。
- 共用 `IdolAttribute`（rank / exp / maxRank）与同一条 `RANK_CURVE`。
- 所有结算经过同一个 `resolveAttribute()`，引擎里不出现“偶像分支 / 制作人分支”。
- 首版只实现「摄影」。
- 「体力」作为制作人属性存在时会驱动 `shared.stamina` 的上限与恢复速率，本轮不实现。
- 制作人倍率默认表为 `1.0 – 1.5`（只加不减），偶像仍为 `0.8 – 1.8`。

工作结算：

```ts
type WorkTerm = {
  ref: AttributeRef | IdolStatKey;
  weight?: number;                              // 仅 sum 模式有效
  multipliers?: Partial<Record<Rank, number>>;
};

type WorkReward = {
  baseMoney: number;
  terms: WorkTerm[];
  combine?: 'sum' | 'product';                  // 默认 'sum'
};
```

- `sum`：`multiplier = Σ(weight × multiplier)`，空列表兜底为 1.0。
- `product`：`multiplier = Π(multiplier)`，建议项数 ≤ 2，且不应写 `weight`。
- “只看偶像 VO” / “只看制作人摄影”都是只有一项的列表；“两者相乘”是同一列表加 `combine: 'product'`。

失败风险：

- `WorkRisk.ref` 变为可选。
- 省略时对全部 `terms` 各自算 gap，取最差，短板决定失败率。

### 制作人体能属性

已实现，链路可用；**正式内容暂不产出制作人 EXP**，先用测试事件验证。

| Rank | 体力上限 | 消耗倍率 |
|---|---:|---:|
| F | 100 | 1.00 |
| E | 125 | 1.00 |
| D | 150 | 0.95 |
| C | 175 | 0.95 |
| B | 200 | 0.90 |
| A | 225 | 0.85 |
| S | 250 | 0.80 |

规则：

- 体力上限由体能 rank 推导（`maxStamina(state)`），不进存档。
- 行动消耗 = `max(1, ceil(基础消耗 × 倍率))`。
- 判定、扣除、结果页预告都走 `activityCost(state, activity)`，不允许各处直接读 `activity.cost.stamina`。
- 倍率只作用于 `cost.stamina`，不修改 `effect` 里 `sharedStat` 的数值。
- 多目标行动中，制作人属性效果只在循环外结算一次。

测试：

- fixture 事件 `evt.producer_stamina_drill`，用 flag `test_producer_drill` 门控，正常游玩不会触发。
- 覆盖 EXP → rank → 体力上限、消耗倍率、多目标只结算一次三条链路。

## 3. 「当前偶像」字段

已收敛为单一 `selectedIdolId`（P0 已完成）：

- 删除 `activeIdolId`（旧实现里会被 `applyActivity` 改写，导致侧栏随行动跳变）。
- `selectedIdolId` 只由 UI 写入。
- 所有业务函数显式接收 `idolId`，不再有隐式全局默认值。
- `pendingIdolId` 保留但改名为 `pendingIdolReturnId`，只表示「行动结束后回到哪个偶像页」。

## 4. 多人剧情（双人切片）

方向：组合内容是未来的主要体量来源，先支持两人。

已实现：

- `EventDef.cast?: string[]`：显式组合，要求全部在场。
- `EventDef.castSize?: number`：泛化组合，从在场偶像里随机挑 N 人（当前只支持 2）。
- `Condition.castPresent { idolIds }`：判定这些偶像是否都招募且在场。
- `GameState.pendingEventCast`：本场戏的参与者。
- `EventDef.pairCooldownActions`：按「事件 + 排序后的组合」计数冷却，同一对不会连续刷。
- 文案模板 `{a}` / `{b}`，按参与者顺序替换。
- 多人剧情的效果归属：偶像属性效果按参与者各一份，其余效果只结算一次。

声明方式（方案 C 混合）：

- 重点组合写专属文案（`cast` + `text`）。
- 其余组合走模板（`castSize: 2` + `{a}` `{b}`）。

当前边界：

- 只支持两人，`cast` / `castSize` 都必须是 2。
- 事件不能启动对话，多人剧情目前是「文本 + 选项」，没有多说话人结构。
- `DialogueDef.idolId` / `StoryChainDef.idolId` 仍是单值，三人剧情链无法表达。
- fixture 里的两条双人事件都用 `test_pair_scenes` flag 门控，正常游玩不触发；正式启用需要内容与日程设计。
- 没有关系状态支撑，A+B 与 A+B+C 的剧情只能是互不影响的平行小剧场。

## 5. 当前边界

- 自由时间已从地点页移到偶像互动页。
- 正式内容仍然只有真乃。
- 事件、工作、商店、物品正式内容仍为空。
- 制作人属性已进入 `GameState`（当前只有摄影），但正式内容还没有引用它。
- 多目标行动已实现，正式内容还没有使用 `all-present-idols`。
- 侧栏多偶像展示延后到有第二个正式偶像时。
