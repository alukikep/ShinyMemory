# 按任务取用文档

> **这一页只回答一件事：这次任务该读哪几篇。**
> 仓库里有 146 篇文档 / 2.1 万行，其中大部分和当下这个任务无关。
> 按下面的路线读，通常 200–600 行就够；不按路线读，是在拿上下文换"感觉自己读过了"。

---

## 三条读取纪律

1. **只读"必读"那一栏。** "可能需要"是想不起来时才翻，"不要读"是真的别读。
2. **`docs/content/_materials/facts/*.sources.md` 不要整篇读**（单篇 40–50KB）。
   要原句用 `script_find` / `script_window`，要出处用 grep 行 id。
3. **`docs/archive/` 只在你明确要考古时读**（"当时为什么这么定"）。
   里面的规则可能已经作废——"分支必须合流"就是从 archive 里捡出来又被推翻的。

另外一条通用判断：**文档和代码冲突时以代码为准**，然后顺手把文档改对（见 [AGENTS.md](../AGENTS.md) 第五节）。

---

## 任务索引

| 我要做… | 必读 | 大约 |
|---|---|---|
| 改引擎逻辑（sim / scene / 条件 / 效果 / 存档） | [dev-guide](current/dev-guide.md) §1 §4 + 对应 [systems](systems/) 一篇 | 150–250 行 |
| 加地点 / 改地图 | [roadmap](current/roadmap.md) 的「P2：新地点」 + `productionMap.test` | 60 行 + 代码 |
| 给某个偶像写卡面章 | [card-adaptation](content/card-adaptation.md) + [playbook](content/playbook.md) §4.6 §4.8 + 该偶像 `docs/content/<idol>/character.md` | 450–550 行 |
| 加长线剧情链 | [long-arc](content/long-arc.md) + playbook §4.6 | 250 行 |
| 改数值 / 经济 | [content-standards](current/content-standards.md) + [numbers](content/numbers.md) + 代码里的常量 | 300 行 |
| 改界面（React） | [dev-guide](current/dev-guide.md) §2 §3 + `viewContract.test.ts` | 120 行 |
| 门禁 / 体检报错，不知道为什么红 | [dev-guide](current/dev-guide.md) §1 §2（事故表 + 门禁表） | 100 行 |
| 接入新角色 | [new-idol](content/new-idol.md) + [角色卡模板](content/character-card-template.md) + playbook §2 | 350 行 |
| 收尾 / 交接 | [AGENTS.md](../AGENTS.md) 第二节 + [dev-guide](current/dev-guide.md) §5.5 | 60 行 |

---

## 逐条说明

### 1. 改引擎逻辑

```text
必读：docs/current/dev-guide.md §1（事故表：每一行都是一个会重犯的坑）
      docs/current/dev-guide.md §4（改代码硬约定：用 edit、改完跑 npm test）
      docs/systems/<对应系统>.md —— 只读你动的那一个
可能需要：[acceptance](current/acceptance.md)（要加/跑哪条 E2E）
不要读：28 个角色卡、content/ 下的写作手册、_materials/
验收：npm test + npm run build；动了 sim/scene/地图/存档再跑全量 E2E
```

**系统说明怎么选**（`docs/systems/`，只读你动的那一个）：

| 动了什么 | 读哪篇 |
|---|---|
| 倍率 / 饰品 / 计算结果 | [modifiers-and-equipment](systems/modifiers-and-equipment.md) |
| 周期触发 / 检定 / 事件监听 | [checks-and-triggers](systems/checks-and-triggers.md) |
| `vars` / 延迟触发 / 移动倍率 | [content-state](systems/content-state.md) |
| 制作人手册 / 剧情链投影 | [producer-handbook](systems/producer-handbook.md) |
| 工作邀约 / 接取 / 报酬 | [job-lifecycle](systems/job-lifecycle.md) |
| 物品 / 商店 / 礼物 | [item-economy](systems/item-economy.md) |
| 偶像日程 / 星期模板 | [idol-schedule](systems/idol-schedule.md) |
| 审查台 / 批注 / 版本 | [content-review](systems/content-review.md) |
| 高风险工作模板 | [work-risk-template](systems/work-risk-template.md) |
| 地点传送门 | [location-portals](systems/location-portals.md) |
| Q 版头像素材 | [q-avatar-sources](systems/q-avatar-sources.md) |

### 2. 加地点 / 改地图

```text
必读：docs/current/roadmap.md「P2：新地点」一节（列了必须补的 6 处）
可能需要：src/core/content/locations.ts、CityMap 的 viewBox
不要读：写作手册
验收：npm test（productionMap.test 会查坐标、步行连通、重叠）
```

### 3. 给某个偶像写卡面章（最常做的事）

```text
必读：docs/content/card-adaptation.md（整篇，396 行，这是卡面专用手册）
      docs/content/playbook.md §4.6（一段对话 = 一个地点、一段连续时间）
      docs/content/playbook.md §4.8（P 卡 → 章节）
      docs/content/<idol>/character.md（只读这一个偶像的）
      docs/content/playbook.md §1.7（语言：整句日文必须翻，口癖可留）
不读：其他 27 个角色卡、facts 全文
找原句：script_find query="<13 位行 id 或日文关键词>"（不要整份读剧本 JSON）
        工具用法见 [tooling](current/tooling.md) §3
提交前：npm run content:drafts → 审查台 → npm run content:board
```

### 4. 加长线剧情链

```text
必读：docs/content/long-arc.md（整篇，143 行）
      docs/content/playbook.md §4.6
可能需要：docs/systems/producer-handbook.md（手册怎么投影链条）
注意：一张卡 = 一条链 = N 步，别拆成 N 条并列链
验收：npm run content:audit + content:board
```

### 5. 改数值 / 经济

```text
必读：docs/current/content-standards.md（档位表）
      docs/content/numbers.md（兑换基准、零工/训练/工作数值）
关键：文档里的数字必须标代码出处；冲突时以代码为准（dev-guide §1 事故 40）
不要读：剧情与角色卡
```

### 6. 改界面

```text
必读：docs/current/dev-guide.md §2（viewContract.test：删字段会让界面静默少一块）
      docs/current/dev-guide.md §3（测试 vs 截图：什么时候才值得截一张）
可能需要：src/ui/ 对应组件
验收：npm test（含 viewContract）+ 需要时单条 E2E
```

### 7. 门禁 / 体检报错

```text
必读：docs/current/dev-guide.md §1（事故表：症状 → 根因 → 现在的防线）
      docs/current/dev-guide.md §2（门禁表：哪条命令拦什么）
原则：先复现、再定位；不要靠猜改规则（AGENTS 硬性禁止 3）
```

### 8. 接入新角色

```text
必读：docs/content/new-idol.md（248 行，12 步全流程）
      docs/content/character-card-template.md（59 行，照填）
      docs/content/playbook.md §2（新角色接入清单）
注意：`_materials/facts/<id>.md` 是人设摘要，`<id>.sources.md` 是出处，两篇都别整读
验收：npm run content:coverage（每个偶像的内容单元是否齐全）
```

### 9. 收尾 / 交接

```text
必读：AGENTS.md 第二节（经验回流三件事）
      docs/current/dev-guide.md §5.5
产出：事故表加一行（症状 → 根因 → 防线）+ 能机器拦就加校验
```

---

## 未纳入路线（别把它们当"要读的"，写在这里只是不让它们被悄悄遗忘）

| 文档 | 为什么不进路线 |
|---|---|
| [current/money-sinks](current/money-sinks.md) | 已实现的经济设计记录，改经济时当背景，不当前置 |
| [current/impl-money-sinks](current/impl-money-sinks.md) | 已完成的实施计划，同样的理由 |
| [current/ideas](current/ideas.md) | 未确认的点子，不是规范 |
| [current/future-requirements](current/future-requirements.md) | 暂不实现的需求，做规划时才看 |
| [content/README](content/README.md) | 内容生产的总览与进度；具体怎么做看它指向的手册 |
| [content/card-story-plan](content/card-story-plan.md) | 待确认的试点计划 |
| [content/card-story-implementation](content/card-story-implementation.md) | 待审的详细实现计划 |

---

## 其他入口

- [仓库 README](../README.md)：安装与运行命令（`npm run dev` / `build` / `acceptance`）
- [文档总索引](README.md)：完整的文档清单，**查漏用，不是开工读物**

---

## 维护这页

- 新增一篇**活跃**文档时：在对应路线的"必读/可能需要"里加一行，否则下一个人找不到它。
- 移进 `archive/` 时：从这页删掉。
- 这页本身不写规范，只写"去哪儿找规范"——规范只在一个地方有，避免第三份副本。

**机器会拦你**：`npm run docs:check`（已接进 `content:validate` / `build`）会在两种情况下失败：

```text
断链：这页指向的文件/目录不存在
未登记：docs/current、docs/systems、docs/content（顶层）里有文档没出现在这页
```

它不判断内容对不对，只保证"没有文档被悄悄忘掉、没有链接指向空气"。
