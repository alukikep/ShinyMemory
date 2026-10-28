# 制作人手册（任务与剧情链追踪）

> 当前有效 · `0.18.0` 起
> 存档：零改动（不新增 `GameState` 字段）
> 内容纪元：`CONTENT_EPOCH 3`
> 参考：塞尔达传说 梅祖拉的假面 · 炸弹小队手册（只取机制，不取它的循环前提）

## 0. 设计决策

| 编号 | 决策点 | 结论 | 来源 |
|---|---|---|---|
| D1 | 参考对象 | 取炸弹小队手册的**机制**，不取它的外观与循环前提 | 你 |
| D2 | 核心用途 | 追踪进行中的任务/剧情链，结束后归档，从当前条目移除 | 你 |
| D3 | 存在理由 | 为“以后要频繁新增的任务与剧情链”提供可见性 | 你 |
| D4 | 条目来源 | 只做剧情链投影，不写手写内容 | 我 |
| D5 | 存档 | 零改动；**不做已读状态**，侧栏用派生数字角标 | 我 |
| D6 | 界面形态 | 扁平“接下来”列表，不做三天网格日程表 | 我 |
| D7 | 未知占位 | 不做 `？？？`，条目出现即完整 | 我 |
| D8 | 文案口径 | 第一人称手记；`blocked` 显示**派生的具体原因**，不留白 | 你 |
| D9 | 引擎扩展 | `revealWhen` / `when` / `effects` + 多链并存 + 3 个新 `Condition`（**不引入 `requires`**） | 我 |
| D10 | 第一步是否可见 | 默认隐藏；内容显式给 `revealWhen` 才可见 | 我 |
| D11 | 手册入口 | 常驻侧栏，不作为物品、不设获得门槛 | 你 |

## 1. 为什么需要它

### 1.1 引擎每天算出一个事实，然后丢掉

剧情链的触发判定是三个条件的交集：

```ts
// src/core/sim.ts · getEligibleStory
if (chainState.nextEligibleDay && day < chainState.nextEligibleDay) continue;
const step = chain.steps[chainState.stepIndex];
if (!step || step.locationId !== state.locationId) continue;
if (step.timeWindow && (minute < step.timeWindow.fromMinute
                     || minute > step.timeWindow.toMinute)) continue;
```

任一条件不满足，就是**完全静默**：地点页没有行动、侧栏没有提示、日志没有记录。

真乃第一次相遇后写入 `nextEligibleDay = day + 2`。接下来这两天，游戏里没有任何地方说过“两天后的下午去公园”这句话。忘了就是永久卡住。

这些事实分散在两处：地点与时间窗在 `StoryChainDef`，最早天数在 `StoryChainState.nextEligibleDay`。都是现成的，只是没有一个出口。手册就是出口。

### 1.2 手册不是任务列表

三条硬边界，写进代码和文案里：

- **只能记录已经知道的事**：条目由剧情链推进自动产生，玩家没经历过的事不会出现。
- **未启动的链不留痕**：真乃处于 `unknown` 时，手册里不能出现“真乃”三个字。第一次去哪找她，只能靠探索，手册不负责。
- **是手记，不是提示**：写“她说周末下午常在公园唱歌，这两天再去看看”，不写“任务：前往公园”。

## 2. 目标形态

### 2.1 数据：投影优先

第一版**不新增任何持久化状态**。条目完全由现有状态算出来：

```ts
// src/core/handbook.ts（新增）
export type HandbookStatus =
  | 'waiting'    // 天数没到
  | 'blocked'    // 到了，但条件不满足，或当前不方便
  | 'off-hours'  // 条件满足，但不在时间窗
  | 'available'  // 现在去就能触发
  | 'done';      // 已归档

export type HandbookEntryView = {
  id: string;                 // `chain:${chain.id}`
  title: string;              // StoryChainDef.title ?? `${偶像名} · ${首步标签}`
  idolId: string;
  idolName: string;
  status: HandbookStatus;
  locationName: string;
  timeWindowText: string;     // '10:00–18:00'
  /** 仅 blocked 时有值，由 describeCondition 派生。 */
  reason?: string;
  earliestDay?: number;       // chainState.nextEligibleDay
  daysLeft?: number;          // 相对当前天
  steps: { label: string; done: boolean; current: boolean }[];
};

export function buildHandbook(state: GameState): HandbookView;

export type HandbookView = {
  active: HandbookEntryView[];
  archive: HandbookEntryView[];
};
```

`buildHandbook` 只读 `state` 与 `CONTENT_INDEX`，纯函数，不做副作用。这样它不可能和真实状态脱节——这是选择投影而不是“写条目”的全部理由。

**可见性规则（唯一一条）**：

```text
可见 = state.storyChains[chain.id] 存在
     ∨ chain.revealWhen 全部满足
```

`getEligibleStory` 只读不建，`finishDialogue` 才写入，所以有记录等价于“第一步已经走过”。未相遇的偶像天然没有记录，手册是空的，不需要额外判 `idol.status`。

判定统一走 `evaluateStoryChain(state, chain)`：它返回一组 `blocks`（已完成 / 忙 / 未到天数 / 条件 / 时段 / 地点），地点页、手册、调试面板读同一份。手册只决定“怎么显示”，不再自己判断一遍——两套判断迟早会对不上。

### 2.2 状态判定顺序

按顺序取第一个命中的，避免两根轴打架：

```text
1. chainState.completed                    → done
2. pendingDialogueId ∨ flags.forced_rest   → blocked（"现在不行。"）
3. day < nextEligibleDay                   → waiting（"还有 N 天"）
4. step.when 不满足                        → blocked（派生原因，见 2.5）
5. 不在 step.timeWindow                    → off-hours（"明天 10:00 之后"）
6. 否则                                     → available（"现在可以去"）
```

第 2 步是把 `getEligibleStory` 里的短路（`sim.ts:837`）镜像过来，否则会出现“手册说可以去、地点页没有行动”。第 4 步是 `blocked` 而不是藏起来：链已经存在，藏起来玩家会以为它消失了。

`waiting` 压过 `blocked`：时间没到时先告诉玩家“还有几天”，到了再暴露真正的门槛。一次只给一个“当前最近的阻碍”，不给清单。

`blocked` 的文案见 2.5——**必须说清差什么**，否则玩家会卡在这里反复试。文字全部从 `Condition` 派生，不给内容加字段时间，D4 的承诺（条目完全可派生）不受影响。

不设 `expired`：引擎本身不会让步骤过期，`nextEligibleDay` 只约束“最早”，过了就一直是可触发。手册不能比引擎更严格。

`available` 只表示“世界允许”，不考虑玩家当前在哪。它本来就是个“该动身了”的提示，不是在替玩家点按钮。

### 2.3 界面

侧栏第 7 项「手册」，右侧显示进行中条数（`2`），该数字由 `buildHandbook` 派生，不存状态。面板分两段：

```text
进行中
─────────────────────────────
真乃 · 公园的歌声
① 循着歌声 ✓   ② 再次听见歌声 →
公园 · 10:00–18:00 · 还有 2 天

归档
─────────────────────────────
▸ 真乃（1）   ✓ 公园的歌声
```

要点：

- 进行中按“最早可行动日”升序；`available` 永远排最前。
- `blocked` 把原因接在同一行末尾：`公园 · 10:00–18:00 · 还差 ¥1,200`。不做折叠、不做悬浮提示，原因必须一眼看到。
- 归档按偶像分组，默认折叠，不参与排序。归档无限增长也不影响主视图。
- **不做“有新条目”的小圆点**。`waiting → available` 是时间自然流逝造成的，没有引擎事件；要判断“上次看到的是什么”就必须存快照，就得加 `GameState` 字段 + 迁移。数字角标是派生值，永远准，而且零成本。
- 空状态不写引导语，写“还没有值得记下的事。”

### 2.4 v0 需要的两个新内容字段

```ts
export type StoryChainDef = {
  id: string;
  idolId: string;
  priority?: number;
  /** 手册条目标题；缺省回退到「偶像名 · 首步标签」。 */
  title?: string;
  /** 链尚未启动时，满足它就允许出现在手册里。默认要求已有存档记录。 */
  revealWhen?: Condition[];
  steps: StoryChainStep[];
};
```

两个字段都可选，现有 `mano-encounter` 不改也能跑。但真乃那条链建议补 `title: '公园的歌声'`——`actionLabel`（“循着歌声”）在第一步做完之后就过时了，不适合当条目标题。

`revealWhen` 存在的意义：默认规则是“走完第一步才进手册”，那对相遇型剧情是对的（第一次见面必须靠探索），对**已告知的任务**是错的（社长交代的事应该立刻记下来，哪怕现在还做不了）。给内容一个开关注的开关，比改全局默认规则安全。

### 2.5 `blocked` 的原因文案

`blocked` 必须说清差什么，否则玩家会卡在这里反复试。文案不手写，从当前步的 `when` 派生：

```ts
// src/core/handbook.ts
export function describeCondition(
  condition: Condition,
  state: GameState,
): string | undefined;
```

返回 `undefined` 表示这条条件无法翻译成人话，交给调用方回退。

| 条件 | 文案 | 说明 |
|---|---|---|
| `moneyAtLeast` | `还差 ¥1,200` | 用当前钱算差额，不给总额 |
| `idolStatus` | `还得先正式认识风野灯织` / `得先让风野灯织加入` | 用全名，不用代词；未知偶像回退 |
| `hasItem` | `还缺 生日礼物 ×1` | 用物品显示名，不用 id |
| `attributeAtLeast` | `歌唱还得练到 D` | 复用 `attributeLabel` |
| `atLocation` | `得回事务所一趟` | |
| `timeWindow` / `dayAtLeast` | `过两天再说` | 时间类不给精确数字 |
| 其余（`flag` / `sharedStat*` / `castPresent` / 组合条件） | `undefined` | 不猜语义 |

规则：

- 最多显示 **2 条**，`、` 连接，其余折叠成“等 N 项”。
- 全部返回 `undefined` 时回退到固定句 `还不到时候。`
- **泄露护栏**：条件里引用的偶像若还不是 `known` / `recruited`，整条原因降级为回退文案，绝不能出现名字。
- 短句、不带主语、不加句末标点，和手记里其他行同一个语气。
- `describeCondition` 与 `checkCondition` 吃的是**同一个 `Condition` 对象**，不另写一套判断。新增条件类型时忘了写文案只会退化成通用句，不会显示错误原因。

## 3. 顺手要补的引擎能力

这一节回答“现在能不能随便加任务和剧情链”。结论：**能加，但只能加一种形状，加第二条会撞车，而且举得出的需求一半写不出来。**

### 3.1 现状：两条轨，各缺一半

| | `EventDef`（事件） | `StoryChainDef`（剧情链） |
|---|---|---|
| 触发条件 | 完整 `Condition` 系统 + `after` / `afterNpc` / `afterIdol` / `chance` / `weight` | 只有地点 + 时间窗 + 最早天数 |
| 持久状态 | 无。`once` 靠 `flags['seen:<id>']` | 有。`stepIndex` / `nextEligibleDay` / `completed` |
| 多步 | 靠 `nextEventId` 串，但不记录“进行到哪” | 线性推进，记录进度 |
| 奖励 | `Effect[]` 完整 | 只有 `complete.status` 与 `nextStepDelayDays` |
| 适合 | 一次性的、条件复杂的插入戏 | 有进度、要跨天的线 |

### 3.2 要补的五件事

**a. `StoryChainStep.when?: Condition[]`**——这一步的额外门，每次判定都算。

```ts
if (step.when && !step.when.every((c) =>
  checkCondition(c, state, { idolId: chain.idolId }))) continue;
```

**b. `StoryChainDef.revealWhen?: Condition[]`**——手册可见性开关，只在链还没有存档记录时起作用。

默认规则是“走完第一步才进手册”，这对相遇型剧情是对的（第一次见面要靠探索），对已告知的任务是错的（社长交代的事应该立刻记下来，哪怕现在还做不了）。

**明确不引入 `requires`。** 早先设想过一个“整条链的入场门”，但它和第一步的 `when` 语义重复：一旦把 `requires` 设计成持续生效，进行中的链会因为“钱花掉了”而从地点页和手册同时消失，玩家丢线索；设计成只在入场时检查，那它就和 `steps[0].when` 完全等价。少一个字段，少一处歧义。

需要“招募之后才出现”的链，写 `revealWhen: [{ kind: 'idolStatus', idolId: 'mano', status: 'known' }]`；需要“招募之后才能做但先记账”的链，写 `revealWhen`（宽松）+ 第一步 `when`（严格），手册会显示 `blocked` 并说清差什么。

**c. `StoryChainStep.effects?: Effect[]`**——步骤完成时结算一次。`applyEffects` 已经存在，改动是 `finishDialogue` 里三行：

```ts
if (step?.effects?.length) {
  applyEffects(next, step.effects, { idolId: chain.idolId });
}
```

**d. 多链并存**——现在是 `getEligibleStory` 返回**单个**最优链：

```ts
if (!best || (chain.priority ?? 0) > (best.chain.priority ?? 0)) best = { ... };
```

同一地点同时满足两条链时，priority 低的**静默消失**。改成 `getEligibleStories(state): StoryChainEntry[]` 返回全部（按 `priority` 降序），`buildPlan` 全部推成行动，`startStory` 在数组里查 id。

- 调用点：`src` 内只有 `scene.ts:310`、`sim.ts:873` 两处。
- **`storyChain.test.ts` 有 7 处调用，其中「uses story priority」那条断言的正是“只有最高优先级出现”。这是被编码下来的旧行为，P2 必须把它改成“两条都出现、且按 priority 排序”。**
- 改完之后 `priority` 从“选谁”变成“排序位”，字段保留，语义写进注释。

**e. 补三个 `Condition`**——现有 16 种，缺的正好是任务最常用的三种：

| 新增 | 形态 | 用途 |
|---|---|---|
| `moneyAtLeast` | `{ kind, value }` | 攒够钱再去 |
| `idolStatus` | `{ kind, idolId?, status }` | 招募之后才出现 |
| `hasItem` | `{ kind, itemId, count? }` | 拿到某物品之后才出现 |

`idolId` 省略时取当前偶像／链的偶像。三个都只改 `checkCondition` 的一个 `case`，不改存档、不改存档格式。补完之后条件总数 19 种。

不加这三个，“加一条任务”就只能写“地点 + 时间窗”那一种形状，字段加了等于没加。

### 3.3 明确不做的

| 不做 | 理由 |
|---|---|
| 分支剧情图 / 节点边 | 归档里的方案 C 已否决，会变成第二套编程语言 |
| 并行编排、任意跳转 | 线性 `stepIndex` 足够，复杂编排用事件系统 |
| 计数器任务（“完成 3 次舞蹈课”） | 需要新 `GameState.counters` + 新 `Effect` + 新 `Condition`，等真有这种内容再加 |
| 任务失败/超时 | 当前设计没有失败态，加了会破坏“无压力”定位 |
| `StoryChainDef.requires` | 与第一步 `when` 语义重复，见 3.2b |
| 手写手册条目（`HandbookNoteDef`） | v1 再评估；v0 用投影已覆盖全部现有链 |

### 3.4 新增一条链的实际操作

对**已有偶像**（这是唯一成立的形式，理由见 3.5）：

```text
1. src/core/content/storyChains.ts   加一条 def（title / revealWhen / when / effects 按需）
2. src/core/content/dialogues/*.ts   加对话节点
3. 手册条目                          不用写，投影自动出现
4. npm test && npm run content:audit
```

两个文件，手册零维护。这就是把手册设计成投影而不是手写条目的收益。

### 3.5 P3 的验证放在 fixture，不在 production

`src/core/content` 里只有 mano 一个偶像、一条链；灯织与巡只存在于冻结的 `src/core/content-fixture`。所以：

- 多链撞车、`revealWhen`、`when`、`effects`、`describeCondition` 全部用 **fixture** 验证（fixture 已有 `hiori-encounter` / `meguru-encounter` 两条链可复用）。
- production 只在 `mano-encounter` 上补一个 `title`。
- **不在本轮引入第二个正式偶像**——那是完整的内容工作（立绘、日程、起始状态、canon 来源），不属于这个计划。

## 4. 沿革

| 阶段 | 内容 | 状态 |
|---|---|---|
| P0 | `handbook.ts` 投影 + `describeCondition` + 单测 | ✅ 已完成 |
| P1 | `HandbookPanel.tsx` + 侧栏第 7 项 + 数字角标 + 归档分组 | ✅ 已完成 |
| P2 | `revealWhen` / `when` / `effects` + 多链并存 + 3 个条件 | ✅ 已完成 |
| P3 | production `mano-encounter` 补 `title` | ✅ 已完成 |
| P4 | `evaluateStoryChain` 单一判定 + `getStoryTriggerReport` 调试面板 | ✅ 已完成 |

`when` / `effects` 的验证没往正式包或冻结 fixture 里塞内容：测试用 `CONTENT_INDEX` 临时注册链，
避免留下“永远不触发”的死内容。逐任务拆解见 `docs/archive/impl-producer-handbook.md`。

## 5. 关键陷阱

- **两根轴打架**：状态判定不能各写一套。现在统一由 `evaluateStoryChain` 产出 `blocks`，手册按“忙 > 等天数 > 条件 > 时段”的顺序取第一个显示；地点页只看 `eligible`。
- **原因说错比不说更糟**：`describeCondition` 必须和 `checkCondition` 吃同一个 `Condition` 对象。另写一套判断就会漂成“手册说还差钱、其实早就够了”。
- **原因文案泄露**：见 2.5 的护栏。条件里引用的偶像还没有名字时，只能回退成通用句。
- **多链撞车**：见 3.2d，不修就会静默吞内容。
- **归档无限增长**：必须分组折叠，不要按时间平铺。
- **文案漂移**：条目文字来自内容（`title`、`actionLabel`），不来自 UI 硬编码。加链的人负责文案，UI 只负责排版。
- **投影的盲区**：投影只能显示被数据化的东西。“真乃说她周二下午在公园”这种纯对话信息，除非写进链里，否则手册显示不出来。第一版接受这个限制，不要为它加新状态。
- **和地点页重复**：地点页只写“现在能做什么”，手册写“什么时候能做什么”。两边都不要越界。

## 6. 验收

```text
Vitest
  · buildHandbook 五态判定（含 2.2 的短路顺序）
  · 未启动偶像零条目；revealWhen 满足后出现
  · 进行中的链不会被 when 之外的因素撤下（无 requires 回归）
  · blocked 时 describeCondition 给出正确差额/状态/物品名
  · describeCondition 在不可翻译的条件上返回 undefined
  · describeCondition 对未知名偶像不输出名字
  · 多链并存时两条都在列表里，按 priority 降序
  · completed 链进入归档、不占进行中
  · effects 只在步骤完成时结算一次
  · 新增 moneyAtLeast / idolStatus / hasItem 各一条

Playwright
  · 侧栏角标数字 = 进行中条数
  · 推进两天 → 条目从“还有 N 天”变成“现在可以去”
  · 完成链 → 从进行中消失、出现在归档

内容体检
  · StoryChainDef.title 缺省回退可读
  · 两条链 (地点, 时间窗) 完全重叠且有优先级差 → warning
```

## 7. 不在本轮

- 手写条目（`HandbookNoteDef`）与“传闻”采集机制
- MM 式的 `？？？` 与三天网格日程
- “有新条目”小圆点（需要存快照，破坏零存档改动）
- 条目来源行（“第 3 天，公园得知”）——需要新状态，v0 用当前步骤代替
- 手册与存档导出联动
- 计数器型任务
- 第二个正式偶像
