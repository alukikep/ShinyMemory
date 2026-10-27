# 灯织相遇事件：垂直切片与架构设计

> 状态：设计草案 v0.1  
> 日期：2026-10-27  
> 目的：用一个完整的“遇见灯织 → 认识 → 两天后再次遇见 → 招募”事件，验证对话、剧情链、偶像生命周期的可行性和稳固性。  
> 本文不是实施计划；通过评审后再拆任务。

---

## 1. 为什么先做这个事件

当前游戏里所有偶像一开始就出现在名册，直接可以训练、工作和送礼物。

缺少的是：

```text
她是谁
我为什么认识她
她为什么进入我的制作名单
```

灯织相遇事件同时验证五个问题：

1. 长对话节点能否像 Galgame 一样连续推进；
2. 选项能否只影响下一段对话和数值，而不需要复杂结果分支；
3. 剧情链能否可靠地按地点和天数推进；
4. 偶像能否从未知变为认识、再变为招募；
5. 未招募偶像能否从名册、日程、场景和训练入口中完全隐藏。

---

## 2. 范围

### 本轮做

```text
灯织一个偶像
公园一个地点
两次相遇
一条剧情链
约 18–22 个对话节点
约 6–8 个选择
认识状态
招募状态
名册/日程/场景/训练过滤
对话中途存档
单元 + 集成 + E2E 验证
```

### 本轮不做

```text
第二个未招募偶像
完整剧情编辑器
复杂变量系统
多结局分支
语音、动画、Live2D
好感度独立新系统
新地图
第三偶像
```

---

## 3. 当前架构约束

### 已有能力

- [types.ts](../../../src/core/types.ts) 中已有 `IdolState`、`Effect`、`Condition`、`ActionCommand`；
- [sim.ts](../../../src/core/sim.ts) 已有事件、选项、效果、时间推进、工作、训练；
- [scene.ts](../../../src/core/scene.ts) 已有场景、偶像页、地点行动；
- [IdolRoster.tsx](../../../src/ui/components/IdolRoster.tsx) 显示全部 `state.idols`；
- [IdolSchedule.tsx](../../../src/ui/components/IdolSchedule.tsx) 显示全部偶像日程；
- 存档 v11，已有迁移链；
- 审查页支持 event/job，活动/物品是静态 TS 例外。

### 关键缺口

| 缺口 | 影响 |
|---|---|
| `IdolState` 没有未知/认识/招募状态 | 名册和日程无法过滤 |
| 没有对话节点模型 | 长对话只能拆成多个事件，结果页会打断 |
| 没有剧情链状态 | “两天后再来”只能用 flag 硬拼，容易错 |
| 没有对话中途存档 | 长对话中途退出会丢进度 |
| 没有目标偶像上下文 | 对话给灯织加信任时，当前 active idol 可能是真乃 |
| 未招募角色仍在 actor 列表 | 公园可能提前出现灯织 |

---

## 4. 目标体验

### 初始状态

```text
真乃：已招募，当前偶像
灯织：未知
名册：只显示真乃
日程：只显示真乃
公园：不会出现灯织 actor
```

### 第一次相遇

```text
时间：第 1 天或之后
地点：公园
时段：10:00–18:00

这是剧情专用 placement：灯织尚未招募，不按 `ActorDef.schedule` 出现在公园；只有剧情行动会让她出现。招募后才恢复常规日程。
```

玩家在公园主栏位看到：

```text
[在长椅旁停下]
```

进入后是连续对话，不是事件结果页。

对话内容方向：

```text
公园长椅
→ 灯织戴着耳机，在笔记本上写东西
→ 风吹散纸页
→ 玩家帮忙 / 不打扰 / 问她在写什么
→ 灯织试探玩家是不是制作人
→ 第一次对话结束
```

完成第一次后：

```text
灯织 status = known
名册出现灯织，但显示“尚未招募”
日程仍不显示灯织
不能训练/工作
公园不会出现灯织 actor
剧情链进入第 2 步
下次可触发日 = 完成日 + 2 天
```

### 第二次相遇

```text
时间：第一次完成后的第 2 天或之后
地点：公园
时段：10:00–18:00
```

主栏位出现：

```text
[去公园看看]
```

第二次对话根据第一次的选择有不同开场，但最终都能招募。

完成第二次后：

```text
灯织 status = recruited
名册完整显示灯织
日程显示灯织（来源是 `ActorDef.schedule`，不是 `IdolDef`）
按现有日程在练习室、录音棚、商业街等地点出现；公园不作为她的常规日程
可以进入偶像页、训练、工作、送礼物
剧情链 completed
```

招募不会自动切换当前偶像；当前偶像仍是真乃，玩家可自行进入灯织页面切换。

---

## 5. 对话内容设计

### 5.1 第一次相遇

目标：建立“她是谁”和“她为什么记住玩家”。

节点草案：

```text
N01 旁白：公园长椅，耳机，笔记本
N02 灯织：你站在这里很久了
N03 选择：
    A 帮她捡被风吹散的纸
    B 站远一点，不打扰
    C 问她是不是在写歌
N04A/B/C 对应下一段文本
N05 灯织：你是制作人？
N06 选择：
    A 是，283 的制作人
    B 只是路过
    C 想听你唱歌
N07 灯织：……
N08 第一次结束，认识灯织
```

第一次选择只影响：

- 下一段文本；
- 灯织信任 EXP；
- 一个 flag，用于第二次开场变体。

不产生成功/失败分支。

### 5.2 第二次相遇

目标：完成招募，验证“跨天剧情链”。

节点草案：

```text
N10 公园，灯织在同一张长椅
N11 根据 flag 分支开场
N12 灯织：你上次说的话，我想了很久
N13 选择：
    A 我想正式负责你的工作
    B 先从朋友开始
    C 你不用现在回答
N14 灯织：……
N16 灯织同意加入
N17 招募完成
```

三个选择都进入招募，但文本、信任和 flag 不同。

### 5.3 选择原则

- 选择不改变“是否招募”；
- 选择改变下一段对话、信任 EXP、flag；
- 不允许出现“选错就永远错过”；
- 不出现假选择：至少下一段文本或数值有可感知差异。

---

## 6. 数据模型

### 6.1 偶像生命周期

```ts
export type IdolStatus = 'unknown' | 'known' | 'recruited';

export type IdolState = {
  id: string;
  stats: IdolStats;
  status: IdolStatus;
  knownAt?: number;
  recruitedAt?: number;
};
```

规则：

| 状态 | 名册 | 日程 | 场景 actor | 训练/工作 | 礼物 |
|---|---|---|---|---|---|
| unknown | 隐藏 | 隐藏 | 隐藏 | 禁止 | 禁止 |
| known | 显示，标记“尚未招募” | 隐藏 | 隐藏 | 禁止 | 禁止（v1） |
| recruited | 完整 | 显示 | 按日程出现 | 允许 | 允许 |

建议 known 阶段：

- 名册显示头像、名字、简介；
- 不显示完整属性条；
- 显示“尚未招募”；
- 不显示日程；
- 不可训练/工作；
- 不可送礼物（v1 简化，避免招募前用礼物刷信任）。

### 6.2 对话节点

```ts
export type DialogueNode = {
  id: string;
  speakerId?: string;
  text: string;
  nextNodeId?: string;
  choices?: DialogueChoice[];
  effects?: Effect[];
};

export type DialogueChoice = {
  label: string;
  nextNodeId: string;
  effects?: Effect[];
  requires?: Condition[];
};

export type DialogueDef = {
  id: string;
  idolId: string;
  startNodeId: string;
  nodes: Record<string, DialogueNode>;
};
```

说明：

- `nextNodeId` 用于无选择时点击继续；
- `choices` 存在时，玩家必须选一个；
- `effects` 在进入节点或选择时应用一次；
- `idolId` 提供目标偶像上下文，避免把灯织的信任加到真乃身上；
- 对话节点没有“结果页”。

### 6.3 剧情链

```ts
export type StoryChainStep = {
  id: string;
  locationId: string;
  earliestDay?: number;
  minDaysAfterPrevious?: number;
  timeWindow?: TimeWindow;
  dialogueId: string;
  actionLabel: string;
};

export type StoryChainDef = {
  id: string;
  idolId: string;
  steps: StoryChainStep[];
};

export type StoryChainState = {
  chainId: string;
  stepIndex: number;
  nextEligibleDay?: number;
  completed?: boolean;
};
```

`StoryChainState` 存在 `GameState.storyChains` 中。

### 6.4 对话状态

```ts
GameState:
  storyChains: Record<string, StoryChainState>;
  pendingDialogueId?: string;
  dialogueNodeId?: string;
  dialogueReturnPhase?: Phase;
  dialogueTargetIdolId?: string;
```

对话结束或中断时：

- 清除 `pendingDialogueId` / `dialogueNodeId`；
- 回到 `dialogueReturnPhase`；
- 剧情链完成状态只在对话 terminal 节点应用一次。

---

## 7. 架构方案比较

### 方案 A：全部用现有事件系统

做法：

```text
每个对话节点 = 一个 EventDef
选择 nextEventId 进入下一个节点
用 flag 记录剧情步骤
```

优点：

- 不新增引擎；
- 内容审查可复用；
- 实现快，约 1–2 周。

缺点：

- 每个节点后进入事件结果页，不像 Galgame；
- 无法自然做连续文本推进；
- “两天后”仍需要 flag + dayAtLeast 硬拼；
- 每个节点要写 title/result/effects，内容冗余；
- 对话历史、存档体验差。

结论：**适合临时验证，不适合最终体验。**

### 方案 B：独立对话引擎 + 剧情链 + 偶像状态（推荐）

做法：

```text
DialogueNode + DialogueDef
StoryChainDef + StoryChainState
IdolStatus
```

优点：

- 连续对话体验；
- 剧情链可靠；
- 名册/日程/场景过滤清晰；
- 可复用为所有角色相遇；
- 能支撑后续关系剧情。

缺点：

- 需要新状态、UI、存档迁移；
- 工作量约 3–4 周；
- 新内容暂时不进审查页。

结论：**推荐作为正式方向，但先做单偶像垂直切片。**

### 方案 C：通用叙事图/任务引擎

做法：

```text
节点、边、变量、条件、任务状态、全局事件、存档分支
```

优点：

- 长期扩展性最好；
- 可以做复杂剧情。

缺点：

- 对当前两个偶像的规模过度设计；
- 变量系统容易变成第二套编程语言；
- 会拖延第一个可玩内容。

结论：**暂不采用。**

### 决策矩阵

| 维度 | A 事件链 | B 对话+剧情链 | C 通用叙事引擎 |
|---|---|---|---|
| 连续对话体验 | 差 | 好 | 好 |
| 实现成本 | 低 | 中 | 高 |
| 两天后触发可靠性 | 中 | 高 | 高 |
| 名册/日程过滤 | 需另做 | 需另做 | 需另做 |
| 长期扩展 | 中 | 高 | 很高 |
| 过度设计风险 | 低 | 中 | 高 |
| 建议 | 不采用 | **采用** | 暂缓 |

### 预计改动面

| 文件/模块 | 改动 |
|---|---|
| `src/core/types.ts` | IdolStatus、DialogueNode、StoryChain、ActionCommand、GameState 字段 |
| `src/core/content/dialogues.ts` | 灯织对话节点 |
| `src/core/content/storyChains.ts` | 灯织相遇链 |
| `src/core/contentIndex.ts` | dialogue/story map |
| `src/core/sim.ts` | start/advance/choose 对话、剧情链触发、状态过滤 |
| `src/core/scene.ts` | 公园剧情行动、actor/hero 过滤 |
| `src/ui/components/DialogueOverlay.tsx` | 对话 UI |
| `src/ui/components/IdolRoster.tsx` | unknown/known/recruited 显示 |
| `src/ui/components/IdolSchedule.tsx` | 只显示 recruited |
| `src/ui/components/BackpackModal.tsx` | 赠送对象按状态过滤 |
| `src/save/version.ts` / `save.ts` | v12 迁移 |
| `src/save/localStorageRepository.test.ts` | 旧存档迁移测试 |
| `src/core/*.test.ts` | 状态、对话、剧情链测试 |
| `tests/acceptance/hiori.spec.ts` | 完整浏览器流程 |

---

## 8. 触发与生命周期

### 新游戏

```text
真乃 status = recruited
灯织 status = unknown
storyChains = {}
```

### 第一次相遇

```text
条件：
- locationId = park
- day >= 1
- 10:00 <= time < 18:00
- chain.stepIndex = 0
- 没有 active dialogue
- 不处于 forced_rest
→ 主栏位显示“在长椅旁停下”
→ 点击进入 dialogue
```

完成后：

```text
灯织.status = known
chain.stepIndex = 1
chain.nextEligibleDay = 当前天 + 2
```

### 第二次相遇

```text
条件：
- locationId = park
- day >= chain.nextEligibleDay
- 10:00 <= time < 18:00
- chain.stepIndex = 1
- 没有 active dialogue
- 不处于 forced_rest
→ 主栏位显示“去公园看看”
→ 点击进入 dialogue
```

完成后：

```text
灯织.status = recruited
chain.completed = true
日志：灯织加入了制作名单
```

### 不触发的情况

- 灯织已招募；
- 当前已有对话；
- 不在公园；
- 时段不对；
- 未到 `nextEligibleDay`；
- 剧情链已完成；
- 当前阶段不是 `plan`；
- 处于 `forced_rest`。

### 状态机

```text
new_game
  ↓
idle(step 0)
  ↓ 公园、时段、天数满足、点击剧情行动
dialogue_first
  ↓ terminal
known + step 1 + nextEligibleDay = day + 2
  ↓ 到日、公园、时段满足、点击剧情行动
dialogue_second
  ↓ terminal
recruited + completed
  ↓
idle(no story action)
```

不变量：

- 同一时间只能有一个 active dialogue；
- terminal 只能完成一次；
- known 之后不会再回到 unknown；
- recruited 之后不会再回到 known；
- 剧情链 completed 后不再生成剧情行动；
- activeIdolId 不因招募自动改变。

### 确定性测试夹具

所有单元/集成测试使用固定状态：

```text
seed = 1
day = 1
minuteOfDay = 10:00
locationId = park
activeIdolId = mano
mano.status = recruited
hiori.status = unknown
storyChains = {}
money = 3000
```

这样测试不依赖随机事件，能够稳定复现。

---

## 9. 过滤点

只改名册不够。需要一起处理：

### 名册

[IdolRoster.tsx](../../../src/ui/components/IdolRoster.tsx)：

```text
unknown 不显示
known 显示，但无日程、无完整属性
recruited 完整显示
```

### 日程

[IdolSchedule.tsx](../../../src/ui/components/IdolSchedule.tsx)：

```text
只显示 recruited
```

### 场景 actor/hero

[scene.ts](../../../src/core/scene.ts) 的 `presentActors` / `buildHero` / `buildActorViews`：

```text
只让 recruited 偶像进入普通场景
known 和 unknown 不进入 actor 列表
```

第一次/第二次相遇使用剧情对话 UI，不依赖 actor 出现。

### 训练/工作

[sim.ts](../../../src/core/sim.ts) 的 `enterIdol` / `train` / `work`：

```text
只有 recruited 才能进入偶像页和训练/工作
```

### 礼物

[BackpackModal.tsx](../../../src/ui/components/BackpackModal.tsx)：

```text
赠送对象只列 recruited；unknown 和 known 都不出现。
```

### 当前偶像

```text
activeIdolId 保持真乃
招募灯织不自动切换
```

---

## 10. 存档与迁移

### 版本

`SAVE_VERSION` 从 11 → 12。

新增字段：

```ts
IdolState.status
IdolState.knownAt
IdolState.recruitedAt
GameState.storyChains
GameState.pendingDialogueId
GameState.dialogueNodeId
GameState.dialogueReturnPhase
GameState.dialogueTargetIdolId
```

### 旧存档迁移

旧存档里所有偶像都曾可见，迁移时不能突然把灯织隐藏。

建议：

```text
旧存档（schemaVersion <= 11）：
- 所有已有偶像设为 recruited
- storyChains = {}
- 对话字段清空
```

新游戏才使用：

```text
真乃 recruited
灯织 unknown
```

### 对话中途存档

保存时保留：

```text
pendingDialogueId
dialogueNodeId
dialogueTargetIdolId
dialogueReturnPhase
```

读档后恢复到同一节点，不重复应用已进入节点的 effects。

### 幂等

- 同一节点重复点击不会重复加信任；
- 无效 `nodeId` / `choice` 直接 no-op；
- 对话 terminal 只完成一次剧情链；
- 已招募后不会再次触发相遇。

### 效果应用顺序

```text
进入节点
→ 应用节点 effects
→ 保存状态
→ 等待玩家点击/选择
```

选择时：

```text
校验 choice
→ 应用 choice effects
→ 切换到 nextNodeId
→ 保存状态
```

读档时：

```text
恢复 pendingDialogueId + dialogueNodeId
→ 不重新应用已进入节点的 effects
```

因此节点 `effects` 必须是“只在进入时生效”的语义；不能依赖 UI 重渲染来触发。

---

## 11. 对话 UI

最小形态：

```text
全屏/大遮罩
→ 场景背景（可暂时纯色）
→ 说话人名字 + 头像
→ 正文
→ 点击/空格继续
→ 有选项时显示选项按钮
→ Esc 不关闭，避免误触退出
```

第一版不做：

- 自动播放；
- 跳过；
- 历史回看；
- 语音；
- 打字机效果可做，但不是必需。

必须做：

- 键盘可操作；
- 焦点不跑到背后页面；
- 移动端无横向溢出；
- 对话中存档/读档；
- 选项文字不溢出。

---

## 12. 全面验证矩阵

### 验证策略

按四层推进，前一层不稳定就不进入下一层：

```text
A. 纯状态机
   不接 UI，只测状态转换、条件、效果、幂等

B. 存档层
   每个关键状态保存/读取，确认不重复、不丢失

C. UI 层
   对话推进、选项、焦点、移动端、键盘

D. 回归层
   真乃训练、工作、商店、事件、旧存档不受影响
```

可行性判断不靠“看起来能跑”，而是靠：

```text
状态机测试通过
+ 存档迁移通过
+ 浏览器流程通过
+ 旧功能回归通过
```

### A. 新游戏与过滤

| ID | 场景 | 操作 | 期望 |
|---|---|---|---|
| V01 | 新游戏 | 打开名册 | 只有真乃 |
| V02 | 新游戏 | 打开日程 | 只有真乃 |
| V03 | 新游戏 | 去公园 | 灯织 actor 不出现 |
| V04 | 新游戏 | 尝试训练灯织 | 入口不存在/不可用 |
| V05 | 新游戏 | 打开背包赠送 | 灯织不在赠送对象 |

### B. 第一次相遇

| ID | 场景 | 操作 | 期望 |
|---|---|---|---|
| V06 | 第 1 天 10:00 公园 | 查看行动 | 出现“在长椅旁停下” |
| V07 | 第 1 天 09:00 公园 | 查看行动 | 不出现（时段未到） |
| V08 | 第 1 天 10:00 事务所 | 查看行动 | 不出现（地点不对） |
| V09 | 进入对话 | 连续点击 | 文本推进，无事件结果页 |
| V10 | 选择 A | 检查状态 | 信任增加，flag 设置，下一节点正确 |
| V11 | 选择 B | 检查状态 | 另一段文本，信任/flag 不同 |
| V12 | 第一次结束 | 打开名册 | 灯织出现，标记“尚未招募” |
| V13 | 第一次结束 | 打开日程 | 灯织仍不出现 |
| V14 | 第一次结束 | 去公园 | 灯织 actor 不出现 |

### C. 跨天剧情链

| ID | 场景 | 操作 | 期望 |
|---|---|---|---|
| V15 | 完成第一次当天 | 公园 | 第二次行动不出现 |
| V16 | 完成第一次 +1 天 | 公园 | 第二次行动不出现 |
| V17 | 完成第一次 +2 天 | 公园 | 出现“去公园看看” |
| V18 | 完成第一次 +10 天 | 公园 | 仍可出现，不因过期错过 |
| V19 | 完成第一次后离开公园 | 任意地点 | 不出现剧情行动 |
| V20 | 未到时间，调试跳天 | 公园 | 只有满足天数才出现 |

### D. 第二次相遇与招募

| ID | 场景 | 操作 | 期望 |
|---|---|---|---|
| V21 | 第二次对话 | 根据第一次 flag | 开场文本不同 |
| V22 | 第二次选择 A/B/C | 完成 | 都进入招募，文本/信任不同 |
| V23 | 招募完成 | 名册 | 灯织完整显示 |
| V24 | 招募完成 | 日程 | 灯织出现 |
| V25 | 招募完成 | 练习室/录音棚/商业街 | 按现有 `ActorDef.schedule` 出现，不要求公园 |
| V26 | 招募完成 | 偶像页 | 可进入、训练、工作 |
| V27 | 招募完成 | 当前偶像 | 仍是真乃，不自动切换 |
| V28 | 招募完成 | 再次去公园 | 不再触发相遇 |

### E. 存档/读档

| ID | 场景 | 操作 | 期望 |
|---|---|---|---|
| V29 | 第一次对话中途 | 保存并刷新 | 回到同一节点 |
| V30 | 第一次结束后 | 保存并刷新 | status=known，stepIndex=1 |
| V31 | 第二次对话中途 | 保存并刷新 | 回到同一节点 |
| V32 | 第二次结束后 | 保存并刷新 | status=recruited，chain completed |
| V33 | 旧 v11 存档 | 加载 | 灯织=recruited，不丢角色 |
| V34 | 对话中重复点击 | 快速双击 | effects 不重复 |
| V35 | 对话中直接移动 | 尝试 | 不允许/被对话界面阻止 |
| V36 | 已完成对话后读档 | 读档 | 不重复触发/不重复奖励 |

### F. 回归

| ID | 场景 | 操作 | 期望 |
|---|---|---|---|
| V37 | 真乃训练 | 正常流程 | 不受灯织状态影响 |
| V38 | 工作接取/参与 | 正常流程 | 不受影响 |
| V39 | 商店/背包/礼物 | 正常流程 | 不受影响 |
| V40 | 事件触发 | 正常流程 | 不受影响 |
| V41 | 移动端 390px | 对话/名册/日程 | 无横向溢出 |
| V42 | 键盘 | 空格/回车/Esc | 对话可推进，不误退出 |

### G. 内容完整性

| ID | 检查 | 期望 |
|---|---|---|
| V43 | 所有 `nextNodeId` | 存在 |
| V44 | 所有 choice.nextNodeId | 存在 |
| V45 | 所有节点可达 | 无孤立节点 |
| V46 | terminal 节点 | 只有预期结束节点 |
| V47 | 剧情链 dialogueId | 存在 |
| V48 | 剧情链 locationId | 存在 |
| V49 | 目标 idolId | 存在 |
| V50 | 旧存档迁移 | 不丢失原有偶像 |

---

### 自动化落点

建议新增：

```text
src/core/idolStatus.test.ts
src/core/dialogue.test.ts
src/core/storyChain.test.ts
src/save/storyMigration.test.ts
src/ui/dialogue.test.tsx
tests/acceptance/hiori.spec.ts
```

剧情内容静态校验：

```text
所有 dialogueId 存在
所有 nextNodeId 存在
所有 choice 的 nextNodeId 存在
所有节点从 startNodeId 可达
terminal 节点符合预期
story chain 的 location/idol/dialogue 引用存在
```

---

## 13. 验收标准

### P0 必须通过

```text
新游戏灯织隐藏
公园第一次相遇可触发
第一次结束进入 known
两天后公园第二次可触发
第二次结束进入 recruited
招募后名册/日程/训练可用
未招募前日程/场景/训练不泄露
对话中途可存读档
旧存档迁移不丢角色
```

### P1 稳固性

```text
重复点击不重复奖励
无效节点/选项 no-op
跳过 10 天仍可继续剧情
已完成不重复触发
移动端无溢出
键盘可操作
```

### P2 内容质量

```text
两次对话共 18–22 节点
选择文本有差异
第一次选择影响第二次开场
灯织语气一致
没有假选择
```

---

## 14. 风险

| 风险 | 影响 | 处理 |
|---|---|---|
| 全部偶像未知破坏 activeIdol | 开场/训练不可用 | 真乃初始 recruited |
| 只过滤名册，日程泄露 | 玩家提前看到灯织 | 统一 `recruited` 过滤 |
| 对话中途丢失 | 长对话体验差 | 持久化 pending dialogue |
| 旧存档丢角色 | 玩家数据损坏 | v12 迁移全部 recruited |
| 选项没有差异 | 玩家觉得假选择 | 下一节点/信任/flag 至少一项不同 |
| 剧情链用 flag 硬拼 | 两天后不可靠 | 显式 `nextEligibleDay` |
| 对话/剧情无法审查 | 内容流程缺口 | 垂直切片接受静态 TS 手工审查 |
| 文本量过大 | 开发拖延 | 每节点 2–4 句，先 18–22 节点 |

---

## 15. 架构实施顺序

### Spike 1：状态与过滤

- `IdolStatus`
- `IdolState.status`
- 名册/日程/actor/训练过滤
- v12 迁移
- 单元测试

### Spike 2：对话引擎最小版

- `DialogueDef`
- `pendingDialogueId` / `dialogueNodeId`
- 文本推进、选项、effects、terminal
- 存档/读档
- UI

### Spike 3：剧情链

- `StoryChainDef/State`
- `nextEligibleDay`
- 公园行动
- known/recruited 状态转换

### Spike 4：灯织内容

- 18–22 节点
- 6–8 选择
- 两次相遇
- 对话变体

### Spike 5：验证

- 单元测试
- 集成测试
- Playwright E2E
- 390px
- 旧存档迁移

---

## 16. 已确定的设计选择

这些是设计稿当前采用的默认决定，评审时可以推翻：

1. **第二次相遇的三个选择都进入招募**，只有文本、信任和 flag 不同；不做第三次相遇。
2. **对话不消耗游戏时间**，只检查进入时的地点、日期和时段；这样不会因对话中途跨过 18:00 或 forced_rest 打断。
3. **灯织的日程来源是 `ActorDef.schedule`**，不是 `IdolDef`；公园相遇是剧情专用 placement，不写入常规日程。
4. **known 阶段只显示头像、名字、简介和“尚未招募”**，不显示属性/日程，不可训练/工作/送礼物。
5. **招募后不自动切换 active idol**，仍由玩家选择。
6. **对话/剧情内容先静态 TS**，不进入审查页；第二个偶像前再决定是否扩展。
7. **对话历史/回看不做进 v1**，只保留当前节点和当前选择记录。
8. **旧存档迁移时所有已有偶像都设为 recruited**，避免老玩家丢角色。

---

## 17. 结论

这个事件值得作为第一个架构验证切片。

它不应该被做成“几个事件文件”，而应该验证：

```text
状态
触发
对话
存档
过滤
UI
回归
```

如果这个切片能稳定通过 V01–V50，那么后续第二个偶像、关系剧情和更多剧情链都可以复用同一套基础。
