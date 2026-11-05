# ShinyMemory

《偶像大师 闪耀色彩》同人生活模拟游戏（开发中）。玩家以制作人视角，通过选择、行动耗时、结算与事件推进偶像养成和日常生活。游戏以文本和数据驱动，采用开放时间循环，天数持续增加，不设固定通关日。

## 从哪里开始

- **AI 工作入口：[AGENTS.md](AGENTS.md)**。每次任务先读工作约定，再按 [docs/tasks.md](docs/tasks.md) 选择必读文档。
- 项目进度与优先级：[当前路线图](docs/current/roadmap.md)。历史统计需与当前代码和命令输出核对。
- 设计与系统手册：[文档索引](docs/README.md)。详细规则集中在对应手册。

## 运行

```bash
npm install
npm run dev       # 游戏开发服务
npm run review    # 内容审查台：http://localhost:5174/review.html
npm run build     # 类型检查 → 内容校验 → 生产构建
npm run preview   # 预览最近一次构建
```

技术栈：TypeScript、Vite、React、Zustand、手写 CSS、localStorage。当前运行不接入 AI 服务。

## 当前玩法与系统

- **日历与行动**：第 1 天为 2026 年 4 月 6 日（星期一），按分钟结算行动与移动；包含训练、工作、休息、自由时间、环顾和睡觉。
- **偶像与剧情**：正式接入 28 位偶像；开局自动播放事务所序章，角色按档案型 `known` 或偶遇型 `unknown` 起步，经招募进入名册、日程、训练、工作与礼物系统。普通剧情同偶像最多一条、全局两条，招募引导豁免；满额隐藏其他普通新链的动作和地图提示，已有链可继续。手册显示剧情名额，单列招募和待开启线索。
- **地图与交通**：采用「地区入口 → 成员地点」两层结构。地图显示入口和独立地点，进入成员后显示该地点行动；事务所入口同时承载办公室内容。步行按边耗时，公共交通从任意地点出发，5 分钟、¥100，到入口或独立地点；学校不可达。详见 [地点入口](docs/systems/location-portals.md)。
- **训练与设施**：声乐、舞蹈、表现三间训练房独立升级，课程按等级替换，保留基础行动 id，已有训练事件继续生效。事务所可升级工作区与沙发。
- **工作与经济**：工作池每日抽取最多 5 份冷却完成、未被占用且剧情已解锁的邀约，每日可免费主动刷新一次；默认可排 1 份工作，工作区升级后增加，开场前可取消并恢复日程。详见 [工作生命周期](docs/systems/job-lifecycle.md)。商店支持购买冷却与永久限购，物品可作礼物或使用。
- **属性与体力**：偶像和制作人属性采用 Rank + EXP；制作人体能基础上限为 F100–S160，体力消耗倍率为 1.00–0.90（[代码](src/core/producer.ts)）。「信赖的证明」使用后永久增加 2 点上限（[道具定义](src/core/content/trustToken.ts)）。
- **事件与状态**：支持行动检定、周期与延迟触发、到达事件、粉丝数、数值变量及统一倍率计算。
- **界面与存档**：桌面侧栏与移动端导航、名册、日程、手册、背包；localStorage 自动存档和独立手动存档槽，支持导入导出。版本与内容纪元以 [version.ts](src/save/version.ts) 为准；内容纪元不一致的旧档失效。
- **审查与调试**：审查台提供草稿、批注、通过、打回、废弃与版本管理；审批由人完成。游戏加 `?debug=1` 可查看触发和剧情链判定、跳天。

当前没有 WING 竞赛、周付款、事务所考核或多结局系统。未来需求见 [future-requirements.md](docs/current/future-requirements.md)。

内容量会随审批和结构调整变化，使用下列命令查看当前结果，不把历史测试数量当作本次验证结论：

```bash
npm run content:board      # 卡面、章节与剧情链接入状态
npm run content:coverage   # 各偶像内容覆盖情况
npm run content:where -- seaside  # 地区、成员地点与内容分布
npm run content:inventory -- --idol mano  # 偶像内容数量、审批与源包接入；加 --details 看明细
npm run content:coverage:compare -- --idol mano --details  # 覆盖率新旧口径、内容名单与归属依据
npm run content:balance    # 当前训练、工作与体力数值报告
```

## 验证

电话约会机制：在家打开「电话：约会预约」。正式约会剧情尚未批准时显示无内容空态；可玩机制样例仅在 fixture 构建，规则和内容交接见 [约会说明](docs/current/date-feature-plan.md)。

| 命令 | 用途 |
|---|---|
| `npm run docs:check` | 文档阅读路由的链接与活跃文档登记检查 |
| `npm test` | Vitest 单元、集成与内容结构测试 |
| `npm run content:validate` | 同步 approved，检查结构、资料、锚点、体检、覆盖率、看板、日文、文档路由和剧情校验 |
| `npm run build` | 类型检查、完整内容门禁和正式包构建 |
| `npm run acceptance:prologue` | 先构建正式包，再跑正式内容 E2E |
| `npm run acceptance` | 单元测试、fixture 构建、引擎 E2E 和内容 E2E |
| `npm run acceptance:review` | 先构建正式包，再跑审查流程 E2E |

仅改文档时按 [AGENTS.md](AGENTS.md) 检查文档。代码和内容的提交前检查也见该文件；分层验收详见 [开发约定](docs/current/dev-guide.md) 与 [自动验收](docs/current/acceptance.md)。命令定义以 [package.json](package.json) 为准。

E2E 使用 `vite preview` 服务构建产物。单独执行 `npm run e2e:one -- tests/prologue/<file>.spec.ts` 或 `npm run e2e:smoke` 前，先运行 `npm run build`；引擎与 fixture 内容测试先运行 `npm run build:fixture`。构建失败须先解决，避免测试旧产物。

## 代码与内容结构

```text
src/core/             纯 TypeScript 模拟、条件、效果、场景派生与校验
  content/            基础结构：偶像、地点、日程、地图、设施等
  content/chapters/   依赖 approved 对话的卡面章节结构
  content/approved.generated.ts  审批内容生成物，不手改
  productionPack.ts  正式内容合并与章节拼装
  content-fixture/   引擎回归用内容
src/save/             存档版本、迁移、存储与导入导出
src/ui/               React 界面，渲染 SceneView / ActionView
src/app/store.ts      Zustand 状态与存档入口
src/review/           内容审查与审批逻辑
content-review/       草稿、已批准内容和修订记录
tests/                Playwright 分层验收
tools/                内容生产、语料检索和校验工具
docs/                 当前手册、阅读路由与归档
workshop/             内容候选区，不进入游戏构建
```

正式游戏加载 `PRODUCTION_PACK`：`BASE_PACK` 经 `mergeApprovedContent` 合并审批内容，再由 `attachPendingChapters` 拼装章节结构。依赖 approved 对话的结构应在生产包拼装，避免放入基础包造成草稿预检缺引用。实现以 [productionPack.ts](src/core/productionPack.ts) 为准。

写作前先按任务路线读角色卡和原始剧本，用 `script_find` / `script_window` 定位原句，不整篇读取大型语料。工具见 [tooling.md](docs/current/tooling.md)，内容流程见 [内容生产](docs/content/README.md)。历史方案在 [docs/archive/](docs/archive/)，仅供明确考古时查阅。

## 仓库

私有仓库。`workshop/` 中的 AI 草稿不要提交到公开仓库。
