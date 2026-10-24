# ShinyMemory

《偶像大师 闪耀色彩》同人生活模拟游戏（开发中）。

一个以“制作人”为视角、文本为主、数据驱动的养成 / 生活模拟游戏。
先做 3 天时间原型，验证“行动耗时 + 日循环”后再扩到更长周期。

## 当前原型

- 3 天 × 24 小时时间系统，行动按小时推进
- 4 个地点：事务所、练习室、录音棚、家；移动 15 分钟
- 8 个活动：声乐、舞蹈、表现只在练习室；节目收录在录音棚；休息在事务所；睡觉在家；自由时间到处都行；每个地点都可以“环顾四周”
- 睡觉会推进到次日 08:00，并按睡眠时长恢复体力
- 24 个事件、2 次考核、3 个结局
- 每个地点有一个 `look_around` 专属事件；部分事件只在特定时间段出现
- 事件触发 v2：`after` / `chance` / `priority` / `cooldownActions` + `dayAtLeast` / `timeWindow`
- 自动存档（localStorage），刷新页面可继续；存档 v3 会重置旧版时间线
- 调试面板：`?debug=1`，可看触发判定、强制事件、跳天
- 无 AI、无美术；先验证“选择 → 耗时 → 结算 → 事件 → 考核”的循环

## 运行

```bash
npm install
npm run dev      # 本地开发
npm run build    # 类型检查 + 生产构建
npm test         # 核心模拟测试 + 平衡烟测
```

## 结构

```
src/core/            纯 TypeScript 模拟，不依赖 React
  content/           活动、事件、结局、地点、日文本（一个内容一个文件）
  contentIndex.ts    静态内容索引（Map 查询 / after 分桶 / 地点活动）
  config.ts          天数、分钟数、行动耗时、考核时间
  types.ts           GameState / Effect / Condition / LocationDef / EventDef / SaveEnvelope
  sim.ts             纯函数：时间推进、活动、移动、睡觉、事件、考核、结局
  scene.ts           把 GameState 派生为 SceneView / ActionView
  time.ts            第几天 / 几点 / 时长格式化
src/save/            SaveRepository + localStorage 实现
src/ui/              React 视图，只渲染 SceneView 和状态
src/app/store.ts     Zustand 薄壳 + 自动存档
```

**节点不写死：** UI 不知道“声乐课”“深夜的练习室”这些内容，它只渲染
`SceneView` 和 `ActionView`。活动、事件、选项、结局全部来自数据。

**事件不写死：** 触发用 `after` / `chance` / `priority` / `cooldownActions`
组合，地点用 `atLocation`。地点专属事件放 `events/locations/<id>/`，
活动专属事件放 `events/activities/`，跨地点/跨活动的放各自领域文件夹。

## 文档

- [游戏思考](游戏思考.md)
- [养成版设计 v0.1](养成版设计-v0.1.md)
- [最小可行实现说明 v0.1](实现说明-v0.1.md)
- [v0.2 计划](v0.2-计划.md)
- [v0.2 架构学习评估](v0.2-架构学习评估.md)
- [开放世界设计笔记 v0.1](设计笔记-v0.1.md)
- [技术选型 v1.0](技术选型.md)
- [内容审核流程](workshop/README.md)

## 技术栈

已确认：TypeScript · Vite · React · Zustand · Zod · IndexedDB (Dexie) · Tailwind CSS。

当前原型使用 TypeScript + Vite + React + Zustand + 手写 CSS + localStorage；
Zod、Dexie、Tailwind CSS 按技术选型在后续接入。

## 状态

3 天时间原型可运行：24 小时时钟、行动耗时、移动 15 分钟、家/睡觉、按天考核、时间窗事件、存档 v3。
旧 v1/v2 存档会保留数值，但时间线重置到第 1 天 08:00。
下一步：根据试玩调整每天行动密度、睡眠限制、时段事件和 3 天→更长周期的内容扩展。
DoL 式开放世界设计保留为后续目标，不丢弃。

## 仓库

私有仓库。`workshop/` 中的 AI 草稿不要提交到公开仓库。
