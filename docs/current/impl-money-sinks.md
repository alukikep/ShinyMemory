# 金钱出口与设施升级 · 实施计划

> 状态：**已实施（Phase 0–6，2026-11-02）**
> 日期：2026-11-02
> 设计依据：[money-sinks](money-sinks.md)
> 本轮范围：`ExpTier` 放宽、商店冷却/永久限购、行动等级解析、三个练习室设施、事务所工作区与取消。
> 不在本轮：汽车、永久成长道具、约会/Live/收藏内容。

## 0. 已定参数

| # | 项 | 决定 |
|---|---|---|
| 1 | 开局资金 | **¥3,000**（不变） |
| 2 | 训练金钱 | **¥150 / 次**（四档不变） |
| 3 | 训练体力 | **15 / 次**（三个房间统一） |
| 4 | 设施数值 | 60/50/40/30 分钟 · 2/3/4/5 EXP · ¥150 · 体力 15 |
| 5 | 升级费用 | 5,000 / 10,000 / 15,000；每间房 ¥30,000，三间 ¥90,000 |

残余风险：F→E 要 10 次初级 = **¥1,500 / 10 小时**，占开局 50%；结束剩 ¥1,500，容错明显好转。Phase 4 仍要跑模拟确认负现金/时间排布。

## 1. Phase 0：`ExpTier` 放宽

**目标**：让设施可以用 2 / 3 / 4 / 5 EXP，同时不破坏旧内容。

改动：

- `src/core/types.ts`：`ExpTier = 1 | 2 | 3 | 4 | 5 | 10 | 20`。
- `src/core/growth.ts`：`EXP_TIER_VALUES` 增加 2 / 4；`reduceExpTier` 映射 20→10、10→5、5→3、4→3、3→1、2→1。
- `src/core/sim.ts`：删掉本地 `previousExpTier`，统一调用 `reduceExpTier`，避免两份降档逻辑漂移。
- `src/review/validation.ts`：`EXP_TIERS` 增加 2 / 4。
- 文档：[content-standards](../current/content-standards.md) §6.4 已写放宽规则。

测试：

- `EXP_TIER_VALUES[2] === 2`、`[4] === 4`。
- `reduceExpTier(4) === 3`、`reduceExpTier(2) === 1`。
- 审查校验接受 2 / 4，拒绝 6 / 7。
- 全量 `npm test` 不回归。

验收：现有内容全部通过；设施配置可以写 `tier: 2 / 4`。

## 2. Phase 1：商店冷却 + 永久限购

**目标**：24h / 72h / 永久限购三种商品并存。

改动：

- `src/core/types.ts`：
  - `ItemDef.cooldownMinutes?: number`；
  - `GameState.shopCooldowns?: Record<string, number>`。
- `src/save/version.ts`：`SAVE_VERSION 18 → 19`。
- `src/save/save.ts`：迁移补 `shopCooldowns = {}`。
- `src/core/sim.ts` `buyItem`：
  1. `maxPurchases` 达到 → 拒绝；
  2. `cooldown` 未到 → 拒绝；
  3. 扣钱、加库存、`shopPurchases += 1`、`shopCooldowns[id] = now`。
- `src/ui/components/ShopModal.tsx`：三态（购买 / 冷却中 / 已售罄）；冷却显示剩余时间；永久限购购买前提示“不可再买”。
- 内容：现有 5 件物品改 `cooldownMinutes`（24h / 72h）；预留一个 `maxPurchases: 1` 的 fixture。

测试：

- 买 → 冷却中拒绝 → 推进 24h → 可买。
- `maxPurchases: 1` 买完后永久拒绝，不显示倒计时。
- v18 旧档迁移后 `shopCooldowns` 存在，旧 `shopPurchases` 仍生效。
- E2E：买一次 → 按钮变“冷却中” → 睡一觉 → 可再买。

## 3. Phase 2：行动等级解析

**目标**：替换训练选项，但保留 action id。

改动：

- `src/core/types.ts`：
  - `ActivityLevel`（level / requires / name / description / durationMinutes / cost / effects / resultTexts）；
  - `ActivityDef.levels?: ActivityLevel[]`。
- `src/core/sim.ts`：`resolveActivity(state, activity)`；接入 `activityCost` / `activityDuration` / `activityStaminaCost` / `applyActivityDef`。
- `src/core/scene.ts`：按钮名称、描述、消耗预告、`buildActivityResult` 全部用解析后的行动。
- 事件上下文 `lastActivityId` 继续写基础 id。

测试：

- 四档（60/50/40/30 分钟，2/3/4/5 EXP，¥300）都能解析。
- `requires` 不满足时回退到低等级。
- 升级后 `after: { ids: ['vocal'] }` 仍触发。
- **UI 预告 = 实际结算**：时间/金钱/EXP 三项一致。
- `effects` 整字段覆盖，压力等效果不丢。

## 4. Phase 3：设施数据、面板、升级命令

**目标**：三个独立房间，四档，练习室里的「设施管理室」入口。

改动：

- `src/core/types.ts`：
  - `FacilityLevel`（level / cost / requires / description）；
  - `FacilityDef`（id / name / locationId / activityId / varKey / levels）。
- `src/core/contentIndexCore.ts`：`ContentPack.facilities?: FacilityDef[]`，`ContentIndex.facilities`。
- `src/core/content/facilities.ts`：三个房间、四档数值（60/50/40/30、15 体力、2/3/4/5 EXP、¥150、升级 5k/10k/15k）。
- `src/core/sim.ts`：`upgradeFacility(state, facilityId)`：
  - 地点必须是 `practice_room`，阶段 `plan`；
  - 当前等级、金钱、门槛检查；
  - 扣钱、`vars[varKey] += 1`、日志。
- `src/core/scene.ts`：`practice_room` 增加 `facilityEntry`（沿用 `shopEntry` 模式）。
- `src/ui/components/FacilityModal.tsx`：三行房间，当前等级 → 下一级费用/效果；升级按钮。
- `src/App.tsx`：打开/关闭面板，接 `upgradeFacility` 命令。
- `src/core/contentAudit.ts`：校验 `FacilityDef.activityId` / `varKey` / `levels` 引用。

测试：

- 三个房间互不影响；升声乐不改变舞蹈等级。
- 钱不够 / 已满级 / 不在练习室：拒绝并给原因。
- 升级后旧训练按钮消失，新按钮名称/数值正确。
- 面板显示当前等级与下一级费用。
- 存档只存 `vars`，不需要新字段。

## 5. Phase 4：平衡与内容

**前置**：第 0 节参数已定；Phase 0–3 已通过。

工作：

- 跑早期经济模拟：新游戏 → 只训练声乐到 E，记录金钱、时间、是否负现金。预期花 ¥1,500，剩 ¥1,500。
- 如果第一天就负现金：按 [money-sinks](money-sinks.md) §3.6 的备选方案调整（下调初级费用 / 提高开局资金 / 加零工收入）。
- 填三个房间的最终数值（当前：60/50/40/30、15 体力、2/3/4/5 EXP、¥150、5k/10k/15k）。
- 检查每日训练支出与工作收入：6–8 次 × ¥150 = ¥900–1,200。
- 检查 82 条训练后事件的回归。

验收：

```text
npm test
npm run content:validate
npm run build
相关 E2E：shop / facility / training / event anchor
```

## 5.5 Phase 5：事务所工作区与取消（2026-11-02）

**目标**：把“工作分派数”变成事务所的第二个金钱出口，并给 B 方案（未完成工作总数）补上取消。

改动：

- `FacilityDef.activityId` 改为可选；`office_jobs` 没有对应训练行动。
- `src/core/content/facilities.ts` 新增 `office_jobs`：
  - 地点 `office`，`varKey: office.jobSlotLevel`；
  - Lv1/2/3 = ¥5,000 / ¥15,000 / ¥30,000，对应 2/3/4 席。
- `src/core/sim.ts`：
  - `jobSlotCap(state) = 1 + getVar('office.jobSlotLevel')`；
  - `acceptJob` 在创建实例前检查 `state.jobs.length >= cap`；
  - `cancelJob(state, assignmentId)`：仅 `plan` + `office` + 开场前；同时删 `jobs` 与 `scheduleOverrides`；不退钱、不耗时间、不写冷却。
- `src/core/scene.ts`：`JobBoardView.slots = { used, cap, full }`。
- `src/ui/components/JobBoard.tsx`：显示已排工作、工作上限、取消按钮；排满时禁用接取。
- `src/ui/components/FacilityModal.tsx`：按 `locationId` 过滤，事务所标题为“事务所管理”；工作区显示“可同时负责 1 份 → 2 份”。
- `src/App.tsx`：事务所场景也显示设施入口。
- 存档：只写 `vars`，旧档默认 0，不需要升 `SAVE_VERSION`。

测试：

- 1 席时第二份（同日或不同日）被拒；
- 升到 2 席后可接第二份；
- 取消后 `jobs` 和 `scheduleOverrides` 都为空，周日程恢复，同一天可重新接；
- 开场后取消被拒；
- 工作板 `slots.full` 正确；
- E2E：事务所管理面板、满席提示、取消、重新接取。

## 5.6 Phase 6：沙发、体力上限与信赖道具（2026-11-02）

- 体能上限：F100/E110/D120/C130/B140/A150/S160；消耗倍率 1.00/0.98/0.97/0.95/0.93/0.92/0.90。
- 沙发：固定 120 分钟；15/20/25/30 体力，−4/−6/−8/−10 压力；升级 3k/6k/9k。
- 信赖 A：A 级剧情完成时 `grantItem` 统一道具「信赖的证明」；使用后 `vars['stamina.trustBonus'] += 2`，体力上限永久 +2。
- 背包新增消耗品使用；制作人面板显示 `基础 + 信赖` 拆分。
- 测试剧情放在 fixture（`trustReward.test`），不写入正式内容；正式 A 级剧情后续补。
- 旧存档补发以 `trust >= A` + `flags['trustReward.<idol>.A']` 为准，待正式剧情接入时实现。

## 6. 风险与回滚

| 风险 | 缓解 |
|---|---|
| 存档 v19 迁移失败 | 迁移测试 + 旧档 fixture；失败可回退版本号与字段 |
| 等级解析漏接入点 | UI/结算同源测试；`scene` 与 `sim` 都走 `resolveActivity` |
| `ExpTier` 放宽影响旧内容 | 只增不改；旧值全部保留；审查校验补测试 |
| 设施数值导致早期破产 | Phase 4 的模拟是硬门；不过就不上内容 |
| 三个房间面板膨胀 | 一行一个房间，只显示当前 → 下一级 |

## 7. 交付顺序

```text
Phase 0  ExpTier 放宽          （0.5–1 天）
Phase 1  商店冷却/永久限购      （1–2 天）
Phase 2  行动等级解析           （2–3 天）
Phase 3  设施面板 + 三房间      （2 天）
Phase 4  平衡 + 内容            （2–3 天，需先定早期资金/体力）
Phase 5  事务所工作区 + 取消     （1–2 天）
Phase 6  沙发 + 上限 + 信赖道具  （2 天）
```

每个 Phase 单独提交，单独跑测试；Phase 2 之前不写设施内容。

## 8. 实施结果（2026-11-02）

```text
npm test                  474 passed / 68 files
npm run content:validate  0 错误 0 警告
npm run build             production 通过
Playwright prologue       41 passed（含 job / facility）
Playwright acceptance     20 passed
Playwright content        3 passed
Playwright review         2 passed（配置 retries=1；Vite 冷启动偶发）
```

关键测试：

- `activityLevels.test`：每级 `resolved.id === 'vocal'`，事件锚点不破；
- `facility.test`：三房间独立、满级/钱不足/地点不符拒绝；
- `facilityContent.test`：四档 60/50/40/30、2/3/4/5、¥150、90k 总价；
- `officeJobs.test`：1 席拒绝第二份、升级后 2 席、取消恢复日程、开场后拒绝、`slots.full`；
- `staminaSofa.test`：沙发四档、3k/6k/9k、F100→S160、S 消耗 0.90、信赖 +56；
- `trustReward.test`：剧情 `grantItem`、背包使用、体力上限 +2/全部使用；
- `economy.test`：冷却/永久限购；
- `shopMigration.test`：v18 → v19。
