# ShinyMemory

《偶像大师 闪耀色彩》同人生活模拟游戏（开发中）。

一个以“制作人”为视角、文本为主、数据驱动的养成 / 生活模拟游戏。
先做 12 周养成版原型，验证内核后再扩展到开放世界。

## 当前原型

- 12 周 × 24 次行动，一局 10–15 分钟
- 3 个地点：事务所、练习室、录音棚；免费移动
- 6 个活动：声乐、舞蹈、表现只在练习室；节目收录在录音棚；休息在事务所；自由时间到处都行
- 20 个事件、2 次考核、3 个结局
- 事件触发 v2：`after` / `chance` / `priority` / `cooldownActions`
- 自动存档（localStorage），刷新页面可继续；存档 v2 自动迁移 v1
- 调试面板：`?debug=1`，可看触发判定、强制事件、跳周
- 无 AI、无美术；先验证“选择 → 结算 → 事件 → 考核”的循环

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
  content/           活动、事件、结局、地点、周文本（一个内容一个文件）
  contentIndex.ts    静态内容索引（Map 查询 / after 分桶 / 地点活动）
  config.ts          周数、行动数、考核周
  types.ts           GameState / Effect / Condition / LocationDef / EventDef / SaveEnvelope
  sim.ts             纯函数：活动、移动、事件、考核、结局
  scene.ts           把 GameState 派生为 SceneView / ActionView
src/save/            SaveRepository + localStorage 实现
src/ui/              React 视图，只渲染 SceneView 和状态
src/app/store.ts     Zustand 薄壳 + 自动存档
```

**节点不写死：** UI 不知道“声乐课”“深夜的练习室”这些内容，它只渲染
`SceneView` 和 `ActionView`。活动、事件、选项、结局全部来自数据。

**事件不写死：** 触发用 `after` / `chance` / `priority` / `cooldownActions`
组合，内容放在 `src/core/content/events/` 下，按训练、工作、休息、剧情分文件夹。

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

v0.2 单页原型可运行：存档、事件触发 v2、20 个事件、内容索引与校验、调试面板。
地点系统已接入：3 个地点、免费移动、地点限制活动、事件 `atLocation`、存档 v2 迁移。
下一步：地点专属内容，或 v0.3 内容管线（YAML + Zod、审核页、AI 草稿）。
DoL 式开放世界设计保留为后续目标，不丢弃。

## 仓库

私有仓库。`workshop/` 中的 AI 草稿不要提交到公开仓库。
