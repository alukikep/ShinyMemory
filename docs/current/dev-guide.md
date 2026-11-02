# 开发约定

> 这份文档是给**下一轮动手的人（或模型）**看的：这一轮踩过的坑、已经立起来的机器约束、
> 以及"什么时候该写测试、什么时候该看一眼界面"的成本分工。
>
> 内容生产规范在 [content/playbook.md](../content/playbook.md)，这里只管**工程侧**。

---

## 1. 这一轮踩过的坑（全部真实发生）

| # | 坑 | 症状 | 现在怎么防 |
|---|---|---|---|
| 1 | 同一份逻辑写两遍 | `approved` 话题进不了游戏：`productionPack` 手写合并漏了 `topics` | 只保留 `mergeApprovedContent` 一个实现 + `productionPack.test` 逐类比对 |
| 2 | 用展示文案做判定 | flag 未满足被当成已满足（`describeCondition` 返回 undefined） | 判定走 `checkCondition`，文案只用于显示 |
| 3 | **重构对象字面量时丢字段** | `JobBoardEntry` 的 `busyReason` 被删，界面少一个「已派出」标签，`tsc` 不报（可选字段） | `viewContract.test.ts` 断言 `Object.keys` |
| 4 | 分支变体条件写宽松 | `varAtLeast: 1/2/3` 三条变体永远命中第一条 | 精确匹配要 `varAtLeast` + `varAtMost` |
| 5 | 测试断言没有作用域 | `getByText('尚未招募')` 命中 3 个偶像，strict mode 直接报错 | 断言限定容器：`locator('.roster-card', { hasText })` |
| 6 | 用 PowerShell 字符串替换改源码 | CRLF 导致 `replace` 静默不生效；here-string 吞掉模板字符串 | **改源码用 edit/write 工具**，不用 shell 替换 |
| 7 | 内容先写后查语料 | 灯织的相遇写成公园长椅，原作是练习室 | 角色卡 + 锚点校验 |
| 8 | **拿二手数据当权威** | 汉化 CSV 的分支是平铺的，据此判断"分支会合流"，全错 | 改用游戏原始剧本 JSON（`tools/scriptExport.ts`） |
| 9 | **规则凭直觉写** | "分支必须有汇合点"是假的；"分支≥3节点"误伤了原作就合流的章 | 规则先对着数据核一遍再落地 |
| 10 | **启发式当事实** | 用"选项是否重复出现"判断分支，503/504 上误判 | 能取到结构就别用启发式 |
| 11 | **链断了没人发现** | ② 章 1-n07 指向已删节点，26 个节点走不到，测试全绿 | 可达性校验（`chapterAnchors`） |
| 13 | **章节链放进 BASE_PACK** | 链引用的对话是 approved 内容，base 里没有 → 每个草稿预检都报 `dialogue-ref` | 结构在生产包里拼（§1.5） |
| 14 | **构建失败被 `\| tail -1` 吞掉** | 拿着旧产物跑了半天 E2E，一直找不到按钮 | 提交前单独看 `npm run build` 的输出 |
| 17 | **动作名撞车** | `她提前来了` 同时是巡的招募动作，测试点错人，排查半天 | `content:board` 检查"同地点同动作名" |
| 18 | **supersedes 没真替换** | approved 里留下两份同 payload.id，构建报"ID 与现有内容重复" | 插件按 payload.id 扫 approved 目录删旧版 |
| 19 | **剧本是旧格式** | `200200402/404` 没有行 id，锚点全红 | 锚点支持日文原句；按形状判断 |
| 20 | **分支下限定太高** | 原作有 2 句的分支被判"只换一句话" | 下限改成 2 |
| 21 | **地点名写错** | 写了 `house`（不存在，是 `home`），校验器没查 | 登记过的章节也检查地点存在 |
| 22 | **E2E 只断言一半** | 只验动作出现，点进去可能是别的链 | 动作可见 + flag 写入，两个都要 |
| 23 | **修订后报"ID 与现有内容重复"** | `basePackFor` 只按草稿 id 排除旧版，而 `supersedes` 写的是内容 id，旧版没被排掉 | 草稿 id 和 payload.id 两种都排除 |
| 25 | **占位链锁死后续内容** | 招募链有"可选尾声"，一旦把偶像判成"进行中"，卡面和长线全部打不开（E2E 当场红） | 链可设 `lockScope: 'none'`；招募链不占位 |
| 26 | **一张卡拆成多条链** | 手册里 5 行并列，玩家看不出是一张卡 | **一张卡 = 一条链 = N 步**，手册天然一行 |
| 29 | **整段相遇剧情是编的** | 摩美々的招募链写成"街头闲站、动机含糊"，原作是"夜里搭话递名片、动机是跟着这人好像挺有趣"——角色卡当时全带出处，对话却全靠印象 | 每一步必须有 `source` 剧本编号；`content:board` 拦"没有出处的步骤" |
| 28 | **角色卡写了没依据的设定** | 摩美々的卡写了"不登校/夜里出没"，三段剧本里一处都没有——门禁只查"有没有 3 个剧本编号"，不查"每条事实有没有出处" | 事实行必须带 13 位行 id，guard 逐条核对 |
| 27 | **批量替换没生效但 tsc 通过** | scene.ts 的改造脚本没匹配上，编译照样过，跑起来才发现门槛没拆 | 改源码用编辑工具；改完**用行为测试**验证，别只看编译 |
| 24 | **批准后内容自己消失** | 修订的 payload.id 和 supersedes 相同，清理"旧文件"时把**刚批的这份**也扫进了 discarded——零工选项全部消失 | 清理只针对"批准之前就存在"的文件（`approvedBefore` 快照） |
| 16 | **校验参数改名字，调用方没跟着改** | `validateChapterAnchors` 从"读 CSV"改成"读剧本 id"，工具还传着旧参数 → 锚点校验静默失效，写错的锚点也"通过"了 | 新增章节后先故意写错一个锚点，确认它真的会红 |
| 15 | **警告被当成错误** | 审查台"整章通过"报 batch validation failed：三条长线的变体引用了同组里另一条草稿写入的 var，被记成警告却阻塞通过 | `validateReviewDraft` 返回 `errors` 和 `warnings` 两栏，只有 errors 阻塞 |
| 12 | **展示层与数据耦合** | 审查台按更新时间排序，章节顺序看不出 | 分组与排序来自结构（卡内节号） |
| 30 | **事件挂在做不到的行动上** | 摩美々的舞蹈课/表演课事件：她的日程里没有练习室，`dance`/`expression` 对她永远不可用，事件一次都触发不了；覆盖率却按"写了 3 条"算满 | 日程补上练习时段；`contentAudit` 新增 `event-unreachable`（按日程×地点×时段推可达性），进 `content:validate`；`mamimi.spec` 真跑一次舞蹈课事件 |
| 31 | **新角色接进来，没人验名册/日程表** | 有人问"偶像名册和日程表是不是没做"——面板其实在，但没有任何测试保证"新角色接进来一定看得见"；她名册上的简介还留着没出处的"不登校" | `productionRoster.test` 对正式包每个偶像断言：有 ActorDef、日程非空、名册字段齐、有招募步骤；`mamimi.spec` 真开两个面板断言能看到她；简介改成 101 剧本里有出处的事实 |
| 32 | **旧存档里没有新偶像的条目** | 摩美々在存档纪元 3 之后加进来、纪元没变 → 旧档照常加载但没有 `idols.mamimi`；招募链的 `complete.status` 被"条目不存在的守卫"静默跳过，剧情演完她也不进名册/日程表 | `migrateSave` 末尾补偶像/角色条目，并按已完成剧情步骤补回状态；`complete.status` 改为缺条目时现场建；`idolBackfill.test`（迁移+状态修复）+ `saveBackfill.spec`（删档→刷新→招募）。**2026-11 扩成全量回归**：单元测试对正式包每个偶像跑一遍、E2E 一次删掉并招回摩美々/霧子/恋鐘/咲耶/結華五人 |
| 33 | **地点有坐标、没接步行网络** | 泳池有坐标、有卡面剧情要用，但 `WALK_EDGES` 里没有它的边、坐标 (610,300) 还在 `CityMap` 的 viewBox 外——地图上既看不见也走不到，只能靠巴士/出租车；加医院时才发现 | `productionMap.test`：每个可去地点都要有坐标、接进步行网络、从家走得到、坐标不许重叠；viewBox 扩到 560×250 |
| 45 | **非法值要等到 build 才红** | 保存草稿时不查值，`tier: 7` 一路存到构建，`tsc` 在 `approved.generated.ts` 里报错，看起来像生成器的锅 | 保存即校验（`validateDraftForSave`）：缺字段放行、非法值 422 并指名字段；已用 HTTP 探针验证 `tier: 7 → 422`、`tier: 3 → 200` |
| 34 | **审查台放过非法属性档位** | 咲耶的表演课事件写了 `tier: 4 / 2`（`ExpTier` 只有 1/3/5/10/20）。审查台不做类型检查，16 条一路"通过"；直到 `build` 的 tsc 才红，而且报错位置在 `approved.generated.ts`，看起来像生成代码的锅 | `tools/approvedFiles.ts` 读 approved 时先查档位，报错**指名 JSON 与字段路径**（`content-review/approved/x.json 的 payload.choices[0]…tier = 4`）；已用"故意改坏→sync 报错→改回"验证过 |
| 35 | **通过之后没重建就跑 E2E** | 結華 15 条批完后直接 `npm run e2e:one`，Playwright 的 webServer 是 `npm run preview`（服务 `dist/`），跑的是**审批前的旧构建**——剧情链被"对话未批"过滤掉了，测试卡在"按钮不存在"，还白等 3 分钟超时 | 用 `npm run acceptance:prologue`（= `npm run build && playwright`），或至少先 `npm run build`；失败时先看调试面板的"剧情链"表里有没有这条链，能立刻分辨是内容问题还是构建过期 |
| 37 | **按年龄推身份，把专门学校写成社会人** | 给 STRAYLIGHT 做方案时，看到冬優子 19 岁就写成"社会人"，而 facts 第一行写着"专门学校一年级"。若照此排日程，她平日上午会被排成空闲（专门学校学生其实要上课） | 身份变成**声明字段**：idol 定义加 `age`/`school`/`schoolNote`；`identity.test` 核 facts ↔ 声明（只在写着年龄的那一句里找学段，避免"小时候"误判）；`contentAudit` 新增 `idol-school-stage` 核声明 ↔ 日程（学生必须有 protected 学校时段，无学籍则不许有）。已用"把結華改成 high"验证会红 |
| 39 | **说话人没有 ActorDef，名字静默变空** | ルカ 的门口戏里加了"前事务所的经纪人"，她不是偶像也不排班；`speakerId` 解析顺序是 idol → actor → `SPEAKER_NAMES` → **空**，台词照常显示、署名空白，`tsc` 与校验都不报 | 不排班的说话人登记进 `SPEAKER_NAMES`（`src/core/labels.ts`，已有 `producer` 先例）；新写对话时若 `speakerId` 不是偶像 id，先去那里加一条 |
| 38 | **"待审"名单把已上线的章节也列进去** | `content:anchors` 用 `storyChains.has(chapterId)` 判"有没有接进剧情链"，而多步卡的 `chapterId` 是**步骤 id**（`nichika-house`），链 id 是 `nichika-kuro`——于是 95 个已上线章节全部被打成"对话待审，过审后再加"，每次构建刷 95 行假警报，真正的待审反而被埋掉 | 改成按**对话实际在不在包里**判（`stepFor(chapter)` → `index.dialogues.has(dialogueId)`）；`stepIndex` 扩到 arc 链（活动剧情的 chapterId 就是步骤 id）。修完输出 0 行 |
| 36 | **一段对话里跨了两天两地点** | 果穗的招募剧情（原作 `100900101` 是"公园当天 → 第二天事务所"）被写成一段 34 节点的对话，而链的第 1 步挂在公园、第 2 步才到事务所：玩家在公园点开对话，演到一半人已经在事务所、还过了一天；更糟的是她在这段里就说完了"想当偶像"，下一步却又演第一次参观 | 规则「一段对话 = 一个地点、一段连续时间」写进 playbook §4.6（含拆分配方和 3 问清单）；`new-idol.md` 验收清单加"每一步只有一场戏"；审查台的链预览显示每步的时间窗。**机器查不出"你有没有把两天的戏写成一段"**，这条靠人审前自查 |
| 40 | **文档数值与代码漂移** | 零工文档写 ¥280/¥220/¥150，实际是 ¥56/¥52/¥25；礼物写成"主要钱坑"，但终身限购总额只有 ¥4,400；README 还写着 1 偶像/8 地点 | 数值文档先标代码出处；本轮按 `PRODUCTION_PACK` 校准 numbers / content-standards / README，冲突时以代码为准 |
| 41 | **内容体检和游戏加载的不是同一个包** | `content:audit` 没拼 `PENDING_CHAPTERS`，误报 `job.first_live` 的解锁 flag 没人设置；`productionPack` 其实是拼了的 | 抽 `attachPendingChapters` 单一实现，`productionPack` / `content:audit` / `content:validate` 共用；复跑 0 错误 0 警告 |
| 42 | **设施升级差点换掉训练 action id** | 正式包有 82 条事件锚定 `vocal`/`dance`/`expression`；如果中级/高级训练用新 id，这些事件全部静默失效 | `ActivityDef.levels` + `resolveActivity` 保留基础 id；`activityLevels.test` 对每级断言 `resolved.id === 'vocal'` |
| 44 | **批量通过不处理 supersedes** | 4 份修订批完后 approved 里新旧两份并存，`payload.id` 重复；打包取哪份取决于文件顺序，游戏里会"忽新忽旧" | `moveReviewDraft` 在 store 层统一处理 supersedes（单条/批量都走），`syncApproved` 拒绝重复 `payload.id` 并报出文件名；两者都用"故意造一份重复"验证过会红 |
| 43 | **E2E 失败把测试草稿留在 approved** | `tests/review` 真的会批草稿，中途失败时 afterEach 没跑到，产物留在 `content-review/approved`；下一次 `build` 把它编进游戏包，`tsc` 还在**生成文件**里报语法错，看起来像生成器的锅 | **构建时**（`strict`）`syncApproved` 拒绝 `title` 以 `E2E` 开头的产物并报文件名；审查台 dev server 走非 strict，否则它自己的用例一批准就被自己拦（真实踩过，表现为"点通过没反应"） |

---

## 1.5 内容包分两层（别搞混）

```text
BASE_PACK        只有 TS 写死的内容（不含 approved）
PRODUCTION_PACK  mergeApprovedContent(BASE_PACK, APPROVED_CONTENT)
                  再拼上卡面章节的结构（PENDING_CHAPTERS）
```

**卡面章节的结构不能放进 BASE_PACK**：它们的对话是审查台通过的内容，
base 里没有 → 每个草稿的预检都会报 `dialogue-ref`（真实踩过）。

同理，任何"结构引用了 approved 内容"的东西，都该在生产包里拼，而不是 base。

| 文件 | 放什么 |
|---|---|
| `src/core/content/*` | TS 写死的基准内容（不含 approved） |
| `src/core/productionPack.ts` | 合并 + 拼上依赖 approved 的结构 |
| `src/core/content/approved.generated.ts` | 自动生成，**不要手写** |

## 2. 机器约束（跳不过去）

```bash
npm test                  # 单元测试（跑夹具包）
npm run content:validate  # 内容门禁：sync → 校验 → 资料门禁 → 体检 → 剧情校验
npm run content:coverage  # 覆盖率：每个偶像按单元数一遍
npm run build             # 上面全部 + 类型 + 打包
```

| 门 | 拦什么 | 在哪 |
|---|---|---|
| `tsc --noEmit` | 类型 | `build` |
| `content:guard` | 角色卡存在、语料路径真实、≥3 条逐字引文、回查记录 | `content:validate` |
| `content:audit` | 结构/数值/引用完整性 | `content:validate` |
| `content:coverage` | 每个偶像的内容单元是否齐全（`PENDING_IDOLS` 里的标"接入中"） | `content:validate` |
| `viewContract.test` | 界面读的字段从对象上消失 | `npm test` |
| `content:anchors` | 卡面改编的锚点句（语料里有 + 游戏里也有） | `content:validate` |
| `japanese-text` | 整句日文没翻（已上线内容，平假名成串、念出来会卡住） | `content:validate` → `checkJapanese --strict`（阻塞构建）；待审草稿只是提醒 |
| `draft-save` | 草稿里的**非法值**（`tier: 7`、`kind: 'dance'` 这类），放行"还没写完"，拦住"写错了" | `saveReviewDraft` → `validateDraftForSave`，接口回 422 并指名字段 |
| `docs-router` | 活跃文档没登记进 [tasks.md](../tasks.md)、或这页的链接指向不存在的文件 | `content:validate` → `checkDocs`（新增/移动文档后必须登记） |
| E2E（prologue / content / review） | 流程真的能走通 | `npm run acceptance*` |

**新增视图类型时**：把它加进 `viewContract.test.ts` 的字段清单。
**新增内容 kind 时**：只改 `REVIEW_KINDS`，其余从它派生。

---

## 3. 测试 vs 截图：成本分工

| 场合 | 用什么 | 成本量级 |
|---|---|---|
| 逻辑、数值、状态流转 | 单元测试 | ~1.5k 写 + 0.05k/次 |
| 真实点击流程 | Playwright 脚本 | ~1.5k 写 + 0.3k/次 |
| 新 UI 第一次出现、文案、排版 | 截图 + `read_image` 看一次 | ~1.2k/次 |
| 诊断"为什么不对" | 浏览器手动点 | 30–50k/次（贵，只在出问题时） |
| 逐屏走查全流程 | **不做** | 太贵，用 E2E 覆盖 |

一句话：**"看一眼"是抽样，不是走流程。** 能断言的写断言，审美和文案才截图。

### 3.1 E2E 分三级，不是每次都跑全量

| 级别 | 命令 | 什么时候用 |
|---|---|---|
| 单条 | `npm run e2e:one -- tests/prologue/<file>.spec.ts` | 改完一个功能，只跑相关那条 |
| 冒烟 | `npm run e2e:smoke` | 日常小改（approved / job / mamimi 三条，覆盖构建载入、派活、完整一日流） |
| 全量 | `npm run e2e` | **提交前、改引擎/地图/存档时** |

`npm run e2e` 是正式内容配置的 41 条，2 worker 下约 1–2 分钟；四种配置合计 66 条（41 + 20 + 3 + 2）。单条通常 3–6 秒。判断标准：

- 改了 `sim.ts` / `scene.ts` / `CityMap` / 地点 / 存档 → 全量；
- 只改文案或某一条内容 → 单条；
- 只改文档 → 不跑 E2E。

**不要用"全量绿"替代单元测试**：E2E 只覆盖点击路径，状态机还是靠 `npm test`。

---

## 4. 改代码时的硬约定

1. **改源码用 `edit` / `write`，不要用 PowerShell/cat 做字符串替换**——CRLF、转义、编码都会咬人。
2. **改共享对象字面量后，立刻跑 `npm test`**（视图契约就在里面）。
3. **新增/修改剧情链、事件、工作后跑 `content:audit`**。
4. **动了多偶像相关逻辑，跑 `multiIdolJob.test`**（同一天多人接活）。
5. **写作内容前先读语料**，写进角色卡，再动内容（见 playbook §1.5）。
6. **提交前跑一遍**：`npm test` + `npm run build` + 相关 E2E。
7. **不要自批内容**：通过/打回是人的动作。

---

## 5. 这一轮验证过的设计（别重复推翻）

| 设计 | 结论 | 证据 |
|---|---|---|
| 工作面板两级（列表 → 详情） | 单偶像零摩擦，多偶像不膨胀 | `job-board-list/detail` 截图 |
| 面板默认只排重点偶像 | 28 个偶像也不会变成按钮墙 | `buildJobBoard` 只取 focus 的 offer |
| 同一天多人各接一份工作 | 成立，且制作人要跑两场 | `multiIdolJob.test` 三条 |
| 剧情解锁工作的 `hiddenUntilUnlocked` | 属性/粉丝门槛显示，剧情门槛隐藏 | `jobUnlock.test` |
| 两种起步方式（档案型 known / 偶遇型 unknown） | 手册第一天就有指引 | `productionPack.test` + 开局截图 |
| 话题合并成一个「聊两句」+ 每天 3 次 | 界面不再臃肿 | 截图 + `topics.test` |
| 活动剧情也能登记进 `chapterSources` | 不填 `card` 就跳过"卡面章 1 步/分支数"的形状校验，锚点照查 | `content:anchors` 98 章 |
| 跨角色的招募闸门 | `idolStatus` 显式写 `idolId` 就能指向别人，手记显示「得先让X加入」 | `conditionText.ts:32`、`cometik-plan.md` |

---

## 5.5 经验回流（每次任务收尾必做）

见仓库根目录 [AGENTS.md](../../AGENTS.md)。三步：

1. **记事故**：写进本文件 §1 的事故表（症状 → 根因 → 防线）
2. **能机器拦就机器拦**：加校验 + 测试，接进 `content:anchors` / `npm test` / `build`
3. **更新手册**：流程变了就改对应的执行手册

> 只写"以后注意"的不算防线。防线必须是一条命令、一条规则或一个测试。

## 6. 还没做的（技术债）

- **旧角色卡（真乃/灯织/巡）的事实行没有行 id**：guard 里 `GRANDFATHERED` 豁免了它们。
  重读剧本时逐条补 id，补完把名字从豁免表里删掉。
- 旧的三条长线与三条旧招募链没有 `step.source`（board 里 `LEGACY_CHAINS` 豁免）。
  重读剧本时补上，补完从豁免表删掉。
- 角色卡的"人审 + 哈希锁定"还没做（现在是"有出处"的机器检查，不是"人看过"的留痕）。
- **训练课名称不统一**：训练按钮叫「表现课」，但已批的事件正文写着「表演课」
  （甘奈、甜花的 after_expression，以及咲耶的旧事件）。下次统一时走 `revisions`。
- ~~已上线的整句日文~~：**2026-11-02 清零**（8 行 / 4 个文件 → 4 份修订通过，
  出处 102800101 / 100800102 / 102500101 / 102400101）。`content:japanese --strict`
  已接进 `content:validate`，再出现未翻译的整句日文会直接让构建红。
  确实要保留的（和歌引用之类）登记到 `content-review/japanese-allowlist.json`，必须写 reason。

| 项 | 影响 | 建议 |
|---|---|---|
| 数值回归没有自动化 | `balance.test` 跑夹具，正式包数值没人守 | 写一个"第 7 天粉丝数"模拟脚本 |
| 每个角色没有独立 E2E | 靠 `tests/prologue/*` 手写 | 按角色生成冒烟 spec |
| 剧情链的对话写在 TS | 不走审查台（与"内容走审查台"有出入） | 改成 approved 引用 + 审批顺序守卫 |
| 日语检查只报不拦（已上线部分） | `content:japanese` 不在构建门里，8 行存量不会自己变少 | 清完存量后加 `--strict` 接进 `content:validate` |
