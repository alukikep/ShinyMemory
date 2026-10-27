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
- 开局没有 recruited 偶像：属性区为空状态，训练/工作/礼物不可用；地图、移动、休息、自由行动和 NPC 交谈可用
- 当前保留 7 个核心活动：声乐、舞蹈、表现、休息、自由时间、环顾四周、睡觉
- 属性等级 F–S；训练使用 Rank + EXP；升级曲线集中配置
- 对话/剧情链：节点、选项、文本变体、信任奖励、known/recruited 状态、两天后开启且不设截止日
- 事件、工作、商店和物品系统仍然保留，但正式内容已清空；测试内容只存在于 fixture
- 审查台支持事件、工作、对话、剧情链的新建、编辑、批注、通过、打回、废弃和版本化
- 自动存档（localStorage），存档 v12 + 内容纪元；内容纪元不一致时旧存档直接失效
- 调试面板：`?debug=1`，可看触发判定、强制事件、跳天
- 自动验收：`npm run acceptance` 跑单元测试、fixture build、9 条引擎 E2E 和 3 条内容 E2E；`npm run acceptance:prologue` 跑正式内容序章/真乃 E2E
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
  content/           活动、事件、地点、NPC、对话、剧情链（一个内容一个文件或一组）
  contentIndex.ts    静态内容索引（Map 查询 / after 分桶 / 地点活动 / NPC）
  config.ts          天数、分钟数、行动耗时、时间常量
  types.ts           GameState / Effect / Condition / ActorDef / LocationDef / EventDef / SaveEnvelope
  sim.ts             纯函数：时间推进、活动、移动、睡觉、NPC 对话、事件、相遇剧情
  scene.ts           把 GameState 派生为 SceneView / ActionView
  time.ts            日期 / 星期 / 几点 / 时长格式化
src/save/            SaveRepository + localStorage 实现
src/ui/              React 视图，只渲染 SceneView 和状态
src/app/store.ts     Zustand 薄壳 + 自动存档
```

**节点不写死：** UI 不知道“声乐课”“深夜的练习室”这些内容，它只渲染
`SceneView` 和 `ActionView`。活动、事件、选项、对话、剧情链全部来自数据。

**事件不写死：** 触发用 `after` / `chance` / `priority` / `cooldownActions`
组合，地点用 `atLocation`。地点专属事件放 `events/locations/<id>/`，
活动专属事件放 `events/activities/`，跨地点/跨活动的放各自领域文件夹。

## 文档

- [游戏完善路线图](docs/roadmap.md)
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

开放时间循环可运行：24 小时时钟、日历（2026-04-06 起，含星期）、行动耗时、相邻节点移动、家/睡觉（20:00 后）、时间窗事件、存档 v12。
可用性策略：时间/强制休息不满足时隐藏，缺钱/体力/条件时显示禁用并提示缺少项。
移动：地点图由家—车站—事务所/练习室—录音棚构成，车站—公园、练习室—商业街可步行；学校是 roster 可见但地图不可达的 off-map 地点。每次只能走相邻节点，各边独立耗时；地点不再关闭。
地图：仅地点菜单（plan）显示与选项面板同宽的 SVG 城市地图，点阵/街区背景、地点图标、路线与图例；角色互动、事件、行动结果阶段隐藏，避免无效移动点击。
Hero：侧边栏顶部显示当前地点 SVG 场景图（100px），图中只保留地点名；图下信息条按日期/时间/金钱三行排列，日期行已接入年/月/日/星期。主列大 Hero、行动数显示均已移除；当前偶像卡、名册和偶像页改用 Q 版头像。
布局：桌面固定 236px 左侧栏，内部滚动；主内容两列（场景/地图 + 日志）；移动端静态顶部状态 + 固定底部导航。
可访问性：弹窗 Escape/初始焦点/焦点循环；按钮 focus-visible；减少动画；无阶段旁白和行动数。
日程：`ActorSchedule` 支持 weekdays/priority/label/visibility/protected，`ActorDef.overrides` 为内容例外，`ActorState.scheduleOverrides` 为存档动态覆盖；日程表从今天起显示未来七天，只显示公开工作安排，私人/无地点显示“自由活动”，名册显示实际当前位置（含学校等 off-map 地点）。
工作邀约：事务所 08:00–20:00 可接杂志拍摄/电台收录；`canReplaceDay` 只允许占用自由日，接受后写入 `replace-day` 覆盖；工作到点自动完成（不参与无奖励/无惩罚/无日志），到场可参与领奖。
公交/出租车：地图标题旁按可用服务显示入口；公交仅车站、¥100/5 分钟，出租车任意地点、¥400/3 分钟；弹窗选目的地，扣钱并直接到达。
NPC：七草叶月（09:00–18:00）和天井努（10:00–17:00）都在事务所，有各自 topic 和独立好感；支持多角色列表。
偶像：正式内容只有樱木真乃（unknown 开局 → 事务所序章 → 公园两次相遇 → 招募；周一–五 08–14 练习 / 14–20 收录，周六 10–14/14–18，周日自由活动 + 公园）；风野灯织、八宫巡只保留在测试 fixture 中，用于多偶像回归测试；体力/压力共享，歌唱/舞蹈/表现/信任使用 Rank + EXP；单项满级约 500 EXP。
名册：侧边栏「偶像名册」打开统一属性面板，显示共享状态与所有偶像 Rank/EXP，并标记当前偶像。
事件：训练/工作后事件的条件、效果和文本都读取当前偶像上下文；属性条件使用 Rank，效果使用 1/3/5/10/20 经验档位。
工作：每个工作独立配置 `baseMoney` + `checks[]`（属性/权重/可选倍率覆盖）；默认倍率表 F0.8–S1.8。
工作风险：`workRisk` 配置 minRank/safeRank/failureEventId/successEventId；结果事件使用 `entry: workOutcome` 点对点触发，链式事件使用 `entry: chain`，都不进随机池。
开放循环：天数持续增加；没有考试/结局接线。旧内容纪元存档会在读档时视为不兼容，从新游戏开始。
旧 v1/v2 存档会保留数值，但时间线重置到第 1 天 08:00；v3–v9 存档会迁移到两名偶像 + Rank/EXP。
下一步：给工作日增加地点事件，或补更多工作种类；生命周期说明见 `docs/job-lifecycle.md`。
DoL 式开放世界设计保留为后续目标，不丢弃。

## 仓库

私有仓库。`workshop/` 中的 AI 草稿不要提交到公开仓库。
