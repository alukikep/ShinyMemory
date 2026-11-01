# 新角色接入：全流程、资料选择与验收

> 适用：往正式包里**加一个偶像**（不是加一张卡——卡面见 [card-adaptation.md](card-adaptation.md)）。
> 目标：批量接入时不用逐条讨论，照表执行；每一步都有**会变红的命令**，不是靠记性。
>
> **已拍板的三个口径**（2026-10-31）：
> 1. **MVP 先上线**：招募 2 步 + 首张卡 + 专属行动 ≥1 + 话题 ≥6 + 事件 3；长线/更多卡后续再加。
> 2. **按组合补完**：下一批是 L'Antica（恋钟、咲耶、结华、雾子）。
> 3. **先补工具再批量**：`content:drafts`、`content:new-idol`、coverage 进构建（已就位，见 §6）。
>
> 现状：已接入 20 人（真乃、灯织、巡、摩美々、霧子、恋鐘、咲耶、結華、果穂、智代子、樹里、凛世、夏葉、甘奈、甜花、千雪、あさひ、冬優子、愛依、透；L'Antica、放课组、ALSTROEMERIA、Straylight 四组齐，noctchill 1/4），可接入 28 人（见 §5 顺序）。

---

## 1. 参考资料：选什么、为什么不选别的

### 1.1 源等级

| 等级 | 来源 | 能用来做什么 | 绝不能用来做什么 |
|---|---|---|---|
| **A 一手** | 游戏剧本 JSON：`https://viewer.shinycolors.moe/json/produce_events/<剧本编号>.json` | 台词、语气、情节、分支结构、相遇事实 | — |
| **A 一手** | API：`https://api.shinycolors.moe/info/idolList`、`idolInfo?idolId=N`、`pCardInfo?cardId=<uuid>` | id、组合、角色色、生日、CV、卡名、**剧本编号** | 不能当台词用（没有剧本正文） |
| B 官方 | 卡名、歌名、游戏内 UI 文本 | 标题、氛围、章节名 | 不能作为设定依据 |
| C 二手 | 萌娘百科 / wiki / 攻略站 | **只用来找编号**、交叉核对 | 不能引原文、不能当设定依据 |
| ❌ 禁用 | 汉化 CSV（仓库已删除）、机翻、模型记忆、同人 | — | 任何台词或设定 |

**一句话判据**：这句中文能不能指回一个 **13 位行 id** 或一个 **剧本编号**？
指不回去的，要么标「待核」，要么不写。这条是事故 #29 / #28 的产物。

### 1.2 找资料的固定顺序

```bash
# 0. 先读本地资料库（已复制进仓库，不用联网、不用去别的仓库）
#    docs/content/_materials/facts/<id>.md        人设：档案 / 关系 / 喜好
#    docs/content/_materials/facts/<id>.sources.md 每条的出处（含剧情「目录 / 卡名 / 话名」）

# 1. 全体偶像：id、日文名、CV
curl 'https://api.shinycolors.moe/info/idolList'

# 2. 单个偶像：组合、角色色、生日、身高、nickName（= 我们的 id）、资卡列表
curl 'https://api.shinycolors.moe/info/idolInfo?idolId=5'

# 3. 某张卡的每一段：eventId（= 剧本编号）+ 标题
curl 'https://api.shinycolors.moe/info/pCardInfo?cardId=<cardUuid>'

# 4. 导出剧本（日文 + 行 id + 结构），产物在 .cache/shiny/
npx tsx tools/scriptExport.ts 200500501 200500511
```

- **id 取 `nickName`**（`mano` / `hiori` / `meguru` / `mamimi` / `kiriko` / `kogane` / `sakuya` / `yuika` / `kaho` …），
  和 `_materials/facts/` 的文件名一致。
- **角色色取 `color1`**（UI 主色），单位色见 `unit.color1`。
- **剧本编号规律**：`1xxxxxxxx` = W.I.N.G.（相遇 / 主线，语气基准）；`2xxxxxxxx` = 卡面 commu。
- 每个角色**至少导出 3 本**：相遇那本、第一张卡的每一段、和你接下来要写的场景最接近的一本。
- 请求间隔 ≥ 1 秒（对方是志愿维护的服务）。
- 原始日文只落本地 `.cache`，**不提交**；仓库里只有我们自己写的中文 + 不含正文的结构表。

### 1.3 素材（头像 / 立绘）

| 项 | 现状 |
|---|---|
| 头像 | `public/assets/idols/q/<id>.png`，**26 人已有**（见 [q-avatar-sources.md](../systems/q-avatar-sources.md)） |
| 缺 | 铃木羽那、郁田はるき（没有 Q 版文件，名册会退回首字） |
| 授权 | 来源是萌娘共享，原作者保留权利；**内部开发可用，公开分发前需另行确认** |
| 没头像时 | 名册/侧边栏显示名字首字——能跑，但「看着像没做」 |

### 1.4 资料包（28 人索引 + 角色资料库）

```bash
npm run content:materials   # 重新抓取/更新索引（有缓存，幂等）
```

产物：[`_materials/index.md`](_materials/index.md)（可提交）+ `.cache/shiny/materials/*.json`（不提交）。
说明见 [`_materials/README.md`](_materials/README.md)。

- 索引里有每位偶像的 **WING 相遇剧本编号**、**首张卡的每一段剧本编号**、头像/facts 是否就绪。
- **角色资料库在本地**：[`_materials/facts/`](_materials/facts/README.md)（28 人，含 `<id>.sources.md`）。
  2026-11-01 起整份复制进仓库——**不用再去外部整理仓库**，要补就在本地改。
- facts 记到"话名"级，**不是行 id**：写进角色卡前必须按 `sources.md` 回剧本核对。
- `_materials` 里的"首张卡"只是最早发售的 P 卡；实际改编可以换卡（`pCardInfo` 查任意卡）。

### 1.5 资料读法：facts → 剧本 → 角色卡

三份东西分工不同，别混：

| 层 | 位置 | 内容 | 能直接写进游戏吗 |
|---|---|---|---|
| 资料库 | `_materials/facts/<id>.md` | 档案 / 组合 / 关系 / 喜好（同人整理，带 `.sources.md`） | ❌ 只是线索 |
| 剧本 | `.cache/shiny/<剧本编号>.json`（导出后） | 日文原文 + 13 位行 id + 分支 | ✅ 唯一事实来源 |
| 角色卡 | `docs/content/<id>/character.md` | 瘦身后的写作判断，每条带行 id | ✅ 内容就照它写 |

流程：

```text
1. 读 facts/<id>.md           建立印象：她怎么说话、在意什么、和谁是什么关系
2. 查 facts/<id>.sources.md   找到对应剧情「目录 / 卡名 / 话名」
3. scriptExport 导出那几本    拿到 13 位行 id 与原文
4. 写 character.md            每条事实挂行 id；facts 说的和剧本冲突时，以剧本为准并回改 facts
5. 写内容草稿                 语气、口癖、称呼都从 character.md 抄，不凭印象
```

**红线**：`character.md` 里以 `- ` 开头的事实行必须带 13 位行 id（`content:guard` 会红）；
写不出出处的就标「待核」或干脆不写——事故 #28 / #29 就是这么来的。

---

## 2. 全流程（12 步）

每一步的「产物」必须存在，「门禁」必须绿；红了就停，不要往下做。

| # | 步骤 | 产物 | 门禁 | 谁审 |
|---|---|---|---|---|
| 0 | 立项 | 接入卡：id / 组合 / 优先级 / 首张卡 / 素材是否齐 | — | 人（决定顺序） |
| 1 | 资料 | 先读 `_materials/facts/<id>.md`（+ `.sources.md`）建立印象；再导出 3 本以上剧本到 `.cache/shiny/`，记下 cardUuid → eventId | 剧本能打开、行 id 在；写进内容的事实都能指回行 id | AI 自检 |
| 2 | 角色卡 | `docs/content/<id>/character.md`（9 节，事实逐条带 13 位行 id） | `npm run content:guard` | 人（看语气） |
| 3 | 骨架 | `npm run content:new-idol` 生成 idols/actors/角色卡空壳 + 登记两个 index、starting | `npm run build` | 代码评审 |

> **接入中登记**：角色刚进包、内容还没做满时，把 id 写进
> `src/core/content/pending.ts` 的 `PENDING_IDOLS`。覆盖度会把缺项标成
> 「接入中，不算失败」，`productionRoster.test` 也会跳过"必须有招募步骤"。
> **全部内容做完、`PENDING_IDOLS` 清空**，才算是正式上线。
| 4 | 招募链 | 2 步剧情链 + 2 段对话草稿 | `npm run content:drafts` | 审查台 |
| 5 | 日常内容 | 专属行动 1–3、话题 6–8、训练后事件 3、（可选）地点事件 2–4 | `npm run content:drafts` | 审查台 |
| 6 | 首张卡 | `chapterSources` 登记 + 1 条链 N 章 + 每章 1 段对话 | `content:anchors`、`content:board` | 审查台 |
| 7 | 审查 | 按依赖顺序通过（对话 → 链 / 行动 → 事件） | 审查台「通过」不被校验挡 | **人** |
| 8 | 同步构建 | `approved.generated.ts` 更新 + 构建产物 | `npm run build`（含 coverage） | 自动 |
| 9 | 覆盖度 | 该角色 7 项全 ✓（已在构建里，缺了就红） | `npm run build` | 自动 |
| 10 | E2E | 抄 `tests/prologue/mamimi.spec.ts` 改成新角色 | Playwright 绿 | 自动 |
| 11 | 记录 | `docs/content/README.md` 块表 + 必要时 `dev-guide` 事故 | — | 人（抽看） |

### 2.1 各步骤的关键细节

**Step 3 骨架——一条命令写齐四处**

```bash
npm run content:new-idol -- \
  --id kogane --name 月冈恋钟 --unit "L'Antica" \
  --color "#f2a0b5" --profile "L'Antica 的成员。……" \
  --birthday 03/03 --cv "礒部花凜"
```

它会生成/登记：

```text
idols/<id>.ts   id/name/unit/color/profile/avatar/growth
                → 名册和偶像页都读它；profile 里不许写没出处的设定（#28/#31）
actors/<id>.ts  schedule 留空 + TODO
                → 日程决定"她能不能做某件事"；空日程 = 名册/日程表/事件全不可用（#30）
                → 故意留空：productionRoster.test 会红，逼你先填
starting.ts     idolStatus: 'unknown'（偶遇型，默认）或 --status known（档案型）
idols/index.ts、actors/index.ts
                → 两个数组都自动加；漏了就等于没加
docs/content/<id>/character.md
                → 9 节空壳，等读剧本后填（content:guard 会红）
```

脚手架**不写**招募链和任何内容——那要读完剧本再写（`--dry-run` 可先看会动哪些文件）。
成长曲线、日程、简介都按角色卡改，别照抄默认值。

**地点现在分两层**（见 [location-portals.md](../systems/location-portals.md)）：
行动、事件、日程、章节**一律写成员地点 id**（`practice_room`、`park`…），
入口（`studio_district`、`seaside`）只负责地图导航和"进入"。
新增一带时，要同时建入口 + 成员 + 0 分钟边，别直接把孤立节点塞进地图。

**日程别写成一礼拜全一样**（`idolScheduleVariety.test.ts` 会红）：

| 要求 | 为什么 |
|---|---|
| 练习室每周 ≥ 3 天 | 训练课与三个课后事件都挂在她所在的地点（#30） |
| 周一到周五至少 4 种安排 | 全都一样时，日程表像排班表，每天可选的地点/时间窗也一样 |
| 两周里至少 5 个地点 | 只在家/练习室/录音棚三点一线，玩家没有"今天去看看她"的动机 |
| 第 1 周 ≠ 第 2 周 | 用 `weekParity: 'first' \| 'second'` 给一段时间做双周轮换（见 [idol-schedule.md](../systems/idol-schedule.md)） |
| 同时段不允许两条 | 重叠时"她到底在哪"说不清，日程表会打出两格（摩美々/咲耶都踩过） |

专属行动的挂载时段要在日程里**每周都出现**（不然隔一周就点不到）；
双周轮换只换"次要点"，别换掉练习和专属行动那一段。

**Step 5 内容条数与数值**

| 单元 | 建议条数 | 挂载 | 关键约束 |
|---|---:|---|---|
| 专属行动 | 1–3 | 偶像页 · 作息空档 | 必须落在她的日程地点，否则永远不可用（#30） |
| 日常话题 | 6–8 | 偶像页「聊两句」 | id 用 `<id>.chat.*`，覆盖率按这个前缀数 |
| 训练后事件 | 3 | `after` + `afterIdol` | 每个训练课 1 条；40% 概率 + `once` |
| 地点事件 | 0–4 | 地点页 | 组合事件 `cast` 目前只支持 2 人 |

数值不要凭感觉：[content-standards.md](../current/content-standards.md)（30 分钟 / 体力 10–20 / ¥100–150）。
训练课（声乐/舞蹈/表演）是**全员共享**的，不要给每个角色重复建。

每写完一个块，先跑 `npm run content:drafts` 自检，再交审查台——它和审查台用同一套规则，
绿了就不会在审批时被"校验"挡住；碰到引用错误会直接告诉你先过哪一条。

**Step 6 卡面**：一张卡 = 一条链 = N 步；一段 commu = 一章 = 1 段对话。
详细的边界、锚点、`chapterSources` 字段见 [card-adaptation.md](card-adaptation.md) §1.5–§2.5。

**Step 7 审查顺序**：审查台的校验基准是「生产内容 + 已通过」，看不到队列里的草稿，所以
**被引用的先过**：对话 → 引用它的链 / 事件；物品 → 商店。顺序反了会报 `*-ref`。

**Step 10 E2E 必须断言两件事**（#22）：动作按钮真的出现 **+** flag / 状态真的写入。
只断一半时，点进去可能是别的链。

---

## 3. 具体注意点（全部是踩过的）

| 症状 | 根本原因 | 现在的防线 | 事故 |
|---|---|---|---|
| 事件一次都不触发 | `after` 的行动她永远做不到（日程没那个地点） | `event-unreachable`（进构建） | #30 |
| 名册 / 日程表没有她 | 只写了 `IdolDef`，缺 `ActorDef` 或日程为空 | `productionRoster.test` | #31 |
| 旧档里招不进来 | 旧存档没有她的条目，`complete.status` 被守卫静默跳过 | `migrateSave` 补条目 + 按剧情补状态 | #32 |
| 剧情点名撞车 | 同地点同动作名被两条链用 | `content:board` | #17 |
| 招募把后续内容锁死 | 链占位（没有 `lockScope: 'none'`） | 招募链强制不占位 | #25 |
| 手册里一张卡变成五行 | 一张卡拆成多条链 | 一卡一链 | #26 |
| 章节动作不出现 | 地点对但时间窗口对不上（要同时满足日程与窗口） | `content:board` + 锚点 | — |
| 台词像同人 | 没读剧本就写 | 角色卡逐条行 id + `content:guard` | #29/#28 |
| 审查拒收「未知条件」 | 用了不在白名单的条件/效果 | `contentSchema` 单一来源 + tsc | — |
| 新角色名册没头像 | 素材缺（羽那/はるき）或路径写错 | 名册退化显示首字（可接受） | — |

**两个"看起来像没做"的坑**，验收时务必真人点一遍：

1. 她还没被招募时，名册只列"已认识"的、日程表只列"已招募"的——这是发现机制，不是缺功能。
2. 角色卡和 `IdolDef.profile` 是两处文案，改名/改设定时要一起改（#31 就是只改了演员描述）。

---

## 4. 冲突怎么判

| 冲突 | 判给谁 | 理由 |
|---|---|---|
| 剧本台词 vs 任何二手 | 剧本 | 唯一事实来源 |
| API 字段 vs wiki | API | 编号/组合/生日以 API 为准 |
| 我们的中文 vs 机翻 | 我们的中文 | 机翻保不住语气（角色卡 §3 有对照） |
| 角色卡 vs 已上线内容 | 角色卡（并改内容） | 卡是从剧本抄的；内容可能是早期印象（#29） |
| 模型记忆 vs 文件 | 文件 | 记不住就是记不住 |

---

## 5. 批量接入顺序与节奏

### 5.1 建议顺序（组合内聚）

```text
已完成  illumination STARS：真乃、灯织、巡
        L'Antica（部分）：摩美々
下一批  L'Antica 补完：恋钟(4)、咲耶(6)、结华(7)、雾子(8)
        放课後クライマックスガールズ：果穗(9)、智代子(10)、树里(11)、凛世(12)、夏叶(13)
        アルストロメリア：甘奈(14)、甜花(15)、千雪(16)
        ストレイライト：朝日(17)、冬优子(18)、爱依(19)
        ノクチル：透(20)、円香(21)、小糸(22)、雏菜(23)
        シーズ：にちか(24)、美琴(25)
        コメティック：ルカ(26)、羽那(27)、はるき(28)
```

理由：同组合的日程/地点/共享事件可以复用；玩家也更容易按组合认识她们。

### 5.2 每角色的工作量（草稿条数）

| 块 | 条数 |
|---|---:|
| 招募对话 | 2 |
| 首张卡（按 2–5 章） | 2–5 |
| 专属行动 | 1–3 |
| 日常话题 | 6–8 |
| 训练后事件 | 3 |
| **合计** | **约 15–21 条** |

### 5.3 节奏建议

- **一次只做一个角色**，分 3 批送审：①角色卡 + 招募链 ②日常内容 ③首张卡。
- 每批 **5–8 条**，人只需要「通过 / 打回」。
- 每个角色做完跑一次全量回归（`npm test` + `build` + 序章 E2E）。
- 不要两个角色同时改 `storyChains.ts` / `chapterSources.ts`（同一文件冲突）。
- 每 3 个角色做一次：旧档回填回归 + `content:balance`。
  - 回填回归现在是**全自动覆盖**的：`src/save/idolBackfill.test.ts` 对正式包每个偶像跑
    "删条目→迁移→补回/补状态"，`tests/prologue/saveBackfill.spec.ts` 一次删掉后加的
    五个角色再逐个招回来（名册 + 日程表都断言）。**加了新角色不用改这两个测试**。

---

## 6. 已就位的三件工具

| 命令 | 作用 | 接在哪 |
|---|---|---|
| `npm run content:new-idol -- …` | 生成 idols/actors/角色卡空壳，登记两个 index 与 starting（空日程会刻意让测试红） | 手动，Step 3 |
| `npm run content:drafts` | 用**和审查台同一套**规则离线校验 `drafts/` + `revisions/`；绿了审批就不会被校验挡 | 手动，每批交付前必跑 |
| coverage 进构建 | `npm run build` 现在会跑 `contentCoverage`——任一角色缺内容直接红 | 自动，Step 8/9 |

三条的边界：

- `content:drafts` 的基准是「生产内容 + 已通过」，**看不到队列里的其他草稿**——
  引用关系要按依赖顺序过（对话先于链/事件）。
- 脚手架只铺骨架，**不写**招募链、卡面、任何草稿内容；角色卡和日程填完之前，
  `content:guard` / `productionRoster.test` 会一直红，这是设计。
- coverage 进构建意味着"角色做到一半"时构建会红；中途要在游戏里点一遍，
  用 `npm run dev`（dev server 不跑内容校验），上线前再跑 `npm run build`。

---

## 7. 一个角色的验收清单（复制到交付说明里）

```text
[ ] 角色卡有 9 节，事实逐条 13 位行 id，guard 绿
[ ] content:new-idol 已登记：idol / actor / starting / 两个 index
[ ] 日程填了，且包含练习室（训练课）与事件要触发的地点
[ ] 招募链 2–3 步，lockScope: 'none'，对话已批
[ ] 招募链每一步只有一场戏：没有在一段对话里跨天或换地点（playbook §4.6 三问）
[ ] 专属行动 ≥1，落在日程地点
[ ] 话题 ≥6，id 前缀 <id>.chat.
[ ] 训练后事件 3，event-unreachable 不报
[ ] 首张卡：chapterSources 登记 + 一卡一链 + 每章 1 段对话（一章 = 一场戏）
[ ] content:drafts 绿（交付前自检）
[ ] build 绿（含 coverage 7 项全 ✓）
[ ] 名册 / 日程表能看到她（真人点过）
[ ] 旧档：删掉她的存档 → 刷新 → 招募 → 名册可见
[ ] E2E：动作出现 + 状态写入 两半都断言
```

> 招募链就是 2 步时不需要额外的分段检查；**一旦原文里出现"第二天 / 几天后"，
> 那一段就必须单独成为一步**（果穗的招募链就是这么从 2 步变 3 步的）。
