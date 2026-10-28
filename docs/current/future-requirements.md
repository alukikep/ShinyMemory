# 未来需求记录

> 状态说明：第 1–3 节的方案已经确定并实施，历史步骤见
> [归档 · 统一属性计划](../archive/plan-unified-attributes.md)。
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

**触发方式：组合戏必须挂在具体行动之后**（`after: { ids: [动作 id] }`），不允许全局随机。这样一次多对象行动就是一个内容单元，也避免和日常随机事件抢触发。

内容预算（`content.test.ts` 强制）：

```text
每个行动锚点：专属双人剧情 ≤ 10 条，通用双人剧情 ≤ 3 条
```

内容分配策略（已定，暂不执行，留到整理内容生产规则时落实）：

- **组合之间平均分配**，不按“哪一对更有戏”集中倾斜。
- 专属预算按当前可用组合均摊；组合数多于预算时，优先覆盖还没写过专属的组合。
- 通用模板只补位，不用来替代专属。
- 新组合的专属内容按轮转顺序补齐，避免某一对长期拿不到专属戏。

当前 fixture 示例：`group_training`（统一训练，¥2000 / 2 小时 / 全员全属性 +1、信任 +1）挂 2 条专属 + 1 条通用。

### 事件 → 对话桥

统一入口：

```ts
openDialogue(state, {
  dialogueId,
  idolId?,          // 缺省用参与者第一个
  cast?,            // 缺省用 dialogue.participantIds
  returnTo?: { phase, result? },   // 缺省回 plan
})
```

- 事件选项：`EventChoice.dialogueId`。选择后先结算效果再进对话；对话结束回到 `eventResult`，沿用选项的 `result` 文案并写日志。
- 剧情链：`startStory` 内部改走 `openDialogue`，行为不变。
- 行动、调试强制事件都可以直接调用 `openDialogue`。
- 多人对话：`DialogueDef.participantIds`，文本支持 `{a}` / `{b}`，节点按 `speakerId` 换说话人。
- 对话内效果按参与者分配：偶像属性各一份，其余一次。

当前边界：

- 只支持两人，`cast` / `castSize` 都必须是 2。
- `DialogueDef.idolId` / `StoryChainDef.idolId` 仍是单值，三人剧情链无法表达。
- 正式内容只有一个偶像，所以双人场景目前只在 fixture 生效。
- 没有关系状态支撑，A+B 与 A+B+C 的剧情只能是互不影响的平行小剧场。

## 5. 存档槽

已实现：

- 自动存档（`shiny-memory.save.v1`）与手动槽完全分离。
- 手动槽 = 元数据索引 + 每槽独立键：
  - `shiny-memory.slots.v1`：槽位元数据（标签、创建时间、schemaVersion、gameVersion、contentEpoch、摘要）
  - `shiny-memory.slot.<id>`：存档本体
- 摘要包含：第几天、时刻、地点名、当前偶像名、金钱。
- 旧版单一手动存档（`shiny-memory.save.manual.v1`）首次读取时自动迁移成「旧手动存档」槽位，然后删除旧键。
- 读取/删除单个槽位不影响自动存档与其他槽位。
- 槽位格式与游戏状态解耦：`SAVE_VERSION` 不变，加槽位不需要迁移。
- 面板支持：新建、覆盖保存、读取、两步确认删除。
- 导出/导入：单槽导出为 JSON 文件，导入时校验版本号与内容纪元，落地为新槽位。

未做：

- 槽位重命名。
- 导入时合并同名槽位。

## 6. 内容体检

`npm run content:audit` 静态检查，构建流程（`content:validate`）会跑一次。
`src/core/contentAudit.test.ts` 对当前内容包断言零错误、零警告。

检查项：

- 引用完整性：`nextEventId`、`choice.nextEventId`、`choice.dialogueId`、`after.ids`、`afterNpc.ids`、`afterIdol.ids`、活动地点、剧情链的对话与地点、对话参与者。
- 组合戏规则：`cast` / `castSize` 必须是 2；组合戏必须带 `after` 锚点。
- 内容预算：每个锚点的专属双人剧情 ≤ 10、通用 ≤ 3。
- flag 一致性：条件读取了从未被写入的 flag 会告警（`test_` 前缀豁免，作为测试钩子）。

只做能可靠判定的检查，不做“剧情是否好玩”这类主观判断。

## 7. 组内关系（预留，不实现）

不做原因：状态面太大（28 人两两 + 各种组合），当前没有内容消费它。

未来接入位置（现在不写任何字段或类型，避免死代码）：

- 状态：`IdolState` 或独立的 `relationships` 映射，键用排序后的偶像 id。
- 条件：`pairAffinityAtLeast { a, b, value }`。
- 效果：`pairAffinity { a, b, delta }`。
- 展示：偶像名册里显示已建立的关系。
- 触发：`castPresent` 已存在，可以直接和关系条件组合。

## 7. 当前边界

- 自由时间已从地点页移到偶像互动页。
- 正式内容仍然只有真乃。
- 事件、工作、商店、物品正式内容仍为空。
- 制作人属性已进入 `GameState`（当前只有摄影），但正式内容还没有引用它。
- 多目标行动已实现，正式内容还没有使用 `all-present-idols`。
- 侧栏多偶像展示延后到有第二个正式偶像时。
