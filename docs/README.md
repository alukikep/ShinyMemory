# ShinyMemory 文档索引

这里是项目的文档入口。根目录 `README.md` 只保留运行方式和项目概览；设计、进度、系统说明和归档统一放在 `docs/`。

## 当前文档

| 文档 | 用途 |
|---|---|
| [当前路线图](current/roadmap.md) | 当前进度、下一步计划、优先级和开放问题 |
| [未来需求](current/future-requirements.md) | 已确认但暂不实现的功能需求 |
| [内容数值标准](current/content-standards.md) | 时长、体力、金钱、经验、粉丝的档位表 |
| [自动验收](current/acceptance.md) | 命令、测试文件、状态桥与编写约定 |
| [开发约定](current/dev-guide.md) | 本轮踩过的坑、机器约束、测试/截图成本分工、未清的技术债 |

## 内容生产

| 文档 | 用途 |
|---|---|
| [内容生产](content/README.md) | 块的划分、生产流程、块清单与进度 |
| [内容生产手册](content/playbook.md) | 交付协议、新角色接入清单、覆盖矩阵、写作配方、卡面改编规则、质量门 |
| [卡面改编执行手册](content/card-adaptation.md) | 从看素材到过审的完整顺序，每步标了哪条命令会拦住你 |
| [卡面剧情实现计划](content/card-story-plan.md) | 试点一章的选材、结构、锚点、成本与验收（待确认） |
| [卡面剧情实现计划（详细）](content/card-story-implementation.md) | 引擎改动、剧情日/接活策略、分三次提交与验收（待审） |
| [角色卡 · 樱木真乃](content/mano/character.md) | 语气、阶段态度、OOC 对照、写作自查 |
| [角色卡 · 风野灯织](content/hiori/character.md) | 语气、语域、OOC 对照、写作自查（含待核对项） |
| [角色卡 · 八宫巡](content/meguru/character.md) | 语气、核心矛盾（什么都答应）、原文引文、回查记录 |
| [角色卡模板](content/character-card-template.md) | 新角色开工前照着填；第 0 节是「先读语料」的硬要求 |
| — | 门禁：`npm run content:guard`（角色卡 + 语料出处，已接进构建） |

## 系统说明

这些文档描述仍然保留的系统和模板，不代表正式内容已经存在。

| 文档 | 用途 |
|---|---|
| [制作人手册](systems/producer-handbook.md) | 剧情链投影、未满足条件的人话、调试口径 |
| [统一计算接口与饰品槽](systems/modifiers-and-equipment.md) | 倍率管线、饰品槽、分解面板 |
| [周期触发、检定与事件监听](systems/checks-and-triggers.md) | 定时事件、掷骰成败分支、成就接口 |
| [内容状态](systems/content-state.md) | 数值变量、延迟触发、移动倍率 |
| [内容审查系统](systems/content-review.md) | 草稿、批注、审批、approved 载入 |
| [偶像日程系统](systems/idol-schedule.md) | 星期模板、动态覆盖、七天窗口 |
| [物品与商店系统](systems/item-economy.md) | 物品、购买、背包、礼物 |
| [工作生命周期](systems/job-lifecycle.md) | 邀约、接取、执行、报酬 |
| [高风险工作模板](systems/work-risk-template.md) | 成功/失败事件与风险配置 |
| [Q 版头像来源](systems/q-avatar-sources.md) | 头像素材与来源记录 |

## 历史归档

以下内容已被当前架构或正式内容重置取代，仅作为历史记录保留，**不要按其中的状态开发**。

- [归档说明](archive/README.md)
- [统一属性与上下文整理计划](archive/plan-unified-attributes.md) — 已完成的属性重构
- [制作人手册实施计划](archive/impl-producer-handbook.md) — 已完成的逐任务拆解
- [验收方案选型](archive/acceptance-plan.md) — Playwright 选型与早期拆分
- [四项扩展实施计划](archive/impl-modifiers-equipment-checks.md) — 倍率/饰品/检定/触发的逐阶段拆解
- [旧路线图 v0.5](archive/roadmap-v0.5.md)
- [Phase C 计划](archive/phase-c-plan.md)
- [Phase C 后路线图](archive/post-phase-c-roadmap.md)
- [视觉迁移计划](archive/visual-migration-plan.md)
- [工作日事件计划](archive/job-day-events-plan.md)
- [早期设计文档](archive/early-design/)
- [Hiori 相遇计划与设计稿](archive/superpowers/)

## 内容候选区

`workshop/` 是 AI 生成、人工审核的内容候选区，不进入游戏构建。说明见 [workshop/README.md](../workshop/README.md)。

## 存放规则

```text
docs/current/   当前有效的进度、路线、验收
docs/systems/   仍在使用中的系统说明
docs/archive/   过时方案、已完成计划、旧设计
docs/README.md  文档入口和分类规则
```

新增文档时：

1. 先判断它是“当前计划”“系统说明”还是“历史记录”。
2. 不把已完成计划继续放在根目录或 `docs/` 顶层。
3. 旧文档先移入 `docs/archive/`，不要直接删除历史决策。
4. 根目录 `README.md` 只链接当前入口。
