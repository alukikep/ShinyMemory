# ShinyMemory 文档索引

这里是项目的文档入口。根目录 `README.md` 只保留运行方式和项目概览；设计、进度、系统说明和归档统一放在 `docs/`。

## 当前文档

| 文档 | 用途 |
|---|---|
| [当前路线图](current/roadmap.md) | 当前进度、下一步计划、优先级和开放问题 |
| [统一属性与上下文整理计划](current/plan-unified-attributes.md) | 已确认方案的阶段拆解、存档迁移与验收 |
| [未来需求](current/future-requirements.md) | 已确认但暂不实现的功能需求 |
| [自动验收](current/acceptance.md) | Vitest、Playwright、fixture/production 验收方式 |

## 系统说明

这些文档描述仍然保留的系统和模板，不代表正式内容已经存在。

| 文档 | 用途 |
|---|---|
| [内容审查系统](systems/content-review.md) | 草稿、批注、审批、approved 载入 |
| [偶像日程系统](systems/idol-schedule.md) | 星期模板、动态覆盖、七天窗口 |
| [物品与商店系统](systems/item-economy.md) | 物品、购买、背包、礼物 |
| [工作生命周期](systems/job-lifecycle.md) | 邀约、接取、执行、报酬 |
| [高风险工作模板](systems/work-risk-template.md) | 成功/失败事件与风险配置 |
| [Q 版头像来源](systems/q-avatar-sources.md) | 头像素材与来源记录 |

## 历史归档

以下内容已被当前架构或正式内容重置取代，仅作为历史记录保留，**不要按其中的状态开发**。

- [归档说明](archive/README.md)
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
