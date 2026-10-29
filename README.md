# ShinyMemory

《偶像大师 闪耀色彩》同人生活模拟游戏（开发中）。

一个以“制作人”为视角、文本为主、数据驱动的养成 / 生活模拟游戏。
当前采用开放时间循环：天数持续增加，不设固定通关日。

## 当前原型

- 开放日历 × 24 小时时间系统：第 1 天为 2026 年 4 月 6 日（星期一），行动按小时推进
- 8 个地图地点：事务所、车站、练习室、录音棚、家、公园、商业街、学校；地点永久开放，相邻节点步行移动，车站提供公交，任意地点提供出租车
- 选项面板下方直接显示同宽 SVG 城市地图：仅在地点菜单（plan）显示；当前节点、相邻节点、步行分钟数；点击相邻节点直接移动
- 桌面端固定左侧栏：品牌、地点场景、状态、当前偶像和主导航；移动端改为顶部状态 + 底部导航
- 当前正式偶像只有樱木真乃：unknown 开局，事务所自动序章，公园两次低提示相遇后招募
- Hiori/Meguru 只存在于冻结测试 fixture，用于保留多偶像、多剧情链和优先级回归测试
- 2 个 NPC：七草叶月（09:00–18:00）和天井努（10:00–17:00）都在事务所；各有独立 topic 和好感
- 开局没有 recruited 偶像：属性区为空状态，训练/工作/礼物不可用；地图、移动、休息、环顾四周和 NPC 交谈可用
- 当前保留 7 个核心活动：声乐、舞蹈、表现、休息、自由时间、环顾四周、睡觉；自由时间只在偶像互动页出现，要求偶像在场
- 属性等级 F–S；训练使用 Rank + EXP；升级曲线集中配置
- 对话/剧情链：节点、选项、文本变体、信任奖励、known/recruited 状态、两天后开启且不设截止日
- 事件、工作、商店和物品系统仍然保留，但正式内容已清空；测试内容只存在于 fixture
- 审查台支持事件、工作、对话、剧情链的新建、编辑、批注、通过、打回、废弃和版本化
- 自动存档（localStorage），侧边栏另提供独立手动存档槽；存档 v12 + 内容纪元，内容纪元不一致时旧存档直接失效
- 调试面板：`?debug=1`，可看触发判定、强制事件、跳天
- 自动验收：`npm run acceptance` 跑单元测试、fixture build、14 条引擎 E2E 和 3 条内容 E2E；`npm run acceptance:prologue` 跑正式内容序章/真乃 E2E
- 无 AI、无美术；先验证“选择 → 耗时 → 结算 → 事件”的开放循环

## 运行

```bash
npm install
npm run dev      # 本地开发
npm run build    # 类型检查 + 生产构建
npm test         # 核心模拟测试 + 平衡烟测
npm run content:validate # 校验 approved 内容与对话/剧情结构
npm run acceptance # 浏览器验收（fixture 引擎 + 内容）
npm run acceptance:prologue # 正式内容序章与真乃解锁验收
npm run acceptance:review # 审查流程验收
npm run review     # 本地内容审查台（http://127.0.0.1:5174/review.html）
```

## 结构

```
src/core/            纯 TypeScript 模拟，不依赖 React
  content/           活动、地点、NPC、对话、剧情链；正式事件/工作/物品当前为空
  contentIndex.ts    静态内容索引（Map 查询 / after 分桶 / 地点活动 / NPC）
  config.ts          天数、分钟数、行动耗时、时间常量
  types.ts           GameState / Effect / Condition / ActorDef / LocationDef / EventDef / SaveEnvelope
  sim.ts             纯函数：时间推进、活动、移动、睡觉、NPC 对话、事件、相遇剧情
  scene.ts           把 GameState 派生为 SceneView / ActionView
  time.ts            日期 / 星期 / 几点 / 时长格式化
src/save/            SaveRepository + localStorage 实现（自动 + 手动槽）
src/ui/              React 视图，只渲染 SceneView 和状态
src/app/store.ts     Zustand 薄壳 + 自动存档 + 手动存档/读档
```

**节点不写死：** UI 不知道“声乐课”“深夜的练习室”这些内容，它只渲染
`SceneView` 和 `ActionView`。活动、事件、选项、对话、剧情链全部来自数据。

**事件系统保留，但正式内容为空。** 测试事件/工作只存在于 `content-fixture`；正式事件、工作、商店和物品会在后续内容阶段重新填充。

## 文档

文档已按用途集中整理：

- [文档索引](docs/README.md)
- [当前路线图](docs/current/roadmap.md)
- [未来需求](docs/current/future-requirements.md)
- [内容数值标准](docs/current/content-standards.md)
- [自动验收](docs/current/acceptance.md)
- [系统说明](docs/systems/)
- [历史归档](docs/archive/)
- [内容候选区](workshop/README.md)

## 技术栈

当前使用：

```text
TypeScript · Vite · React · Zustand · 手写 CSS · localStorage
```

Zod、Dexie、Tailwind CSS 仍是未来选项，尚未接入。

## 状态

当前正式内容：

```text
正式偶像：樱木真乃
开局：事务所序章
状态：unknown → known → recruited
地点：8 个
NPC：2 个
核心活动：7 个
正式事件/工作/商店/物品：0
```

保留的系统：

```text
时间/日历/行动
地图/移动/公交/出租车
训练/工作/休息/自由时间/环顾/睡觉
对话/剧情链
事件引擎
制作人手册（剧情链追踪）
倍率管线 + 饰品槽
行动检定（掷骰 + 成败分支）
周期触发 + 延迟触发
数值变量 vars
审查系统
自动存档 + 手动存档
内容纪元
内容校验
Vitest + Playwright
```

当前规则：

- 真乃开局 unknown，没有已招募偶像。
- 事务所序章自动播放，没有任务提示。
- 公园两次低提示相遇后招募。
- 自由时间只在偶像互动页出现，要求偶像在场。
- 需要偶像对象的行动不会出现在地点页。
- 行动可以作用于所有在场偶像，体力/时间只结算一次。
- 多对象行动可以挂双人剧情：专属组合或通用模板，按概率触发，同一对有冷却。
- 事件选项可以接一段对话，对话结束回到事件结果；多人对话按参与者分配效果。
- 制作人属性（摄影 / 体能）与偶像属性同一套 rank 结算，工作结果可以只吃一边、相加或相乘。
- 制作人体能决定体力上限（100–250）与行动消耗倍率（1.00–0.80）。
- 制作人属性详情收在侧栏「制作人」按钮里。
- 手册常驻侧栏，条目由剧情链投影；受阻时写明差什么（钱、物品、天数、时段、条件）。
- 所有派生数字走 `resolveModifiers`：同类相加、跨类相乘、只取整一次；饰品只存 id，倍率不入档。
- 行动可以带检定：同等级 50%，每差一级 ±15%，失败照扣时间/体力/钱。
- 事件可以按周/按 N 天到点触发，也可以用 `scheduleEvent` 排一个 N 天后的待办。
- 内容可以用 `vars` 存数值（进度条、阶段、销量、累计工时），未写过读作 0。
- 旧内容纪元存档会直接失效。
- 没有结局、周付款、事务所考核或 WING 竞赛系统。

当前验收：

```text
283 个 Vitest 测试
19 条引擎 E2E
3 条内容 fixture E2E
1 条正式序章 E2E
2 条审查 E2E
production build
fixture build
```

下一步计划见 [当前路线图](docs/current/roadmap.md)。
## 仓库

私有仓库。`workshop/` 中的 AI 草稿不要提交到公开仓库。
