# 卡面改编执行手册

> 从"拿到一张卡"到"上线"的完整顺序。
> 每一步都标了**哪条命令会拦住你**——规则不靠记性，靠构建。

---

## 0. 素材：游戏原始剧本，不是汉化 CSV

**唯一事实来源**是游戏自己的剧本 JSON：

```bash
npx tsx tools/scriptExport.ts 200300501
```

产物在 `.cache/shiny/`（已 gitignore，**不提交**）：

| 文件 | 内容 | 提交？ |
|---|---|---|
| `<script>.json` | 原始剧本（日文） | ❌ |
| `<script>.md` | 可读剧本：中文+日文对照，分支分开 | ❌ |
| `<script>.structure.json` | 只有 id 和结构 | ❌ |

**中文由我们自己写**：读日文，按角色卡的语气写。可以精简，但要保住情节和细节。

> 汉化仓库（SCTranslationData）**已删除**：它的 CSV 是"屏幕上出现过的行平铺"，
> 分支与合流全丢、部分行没翻译——没有参考价值。

---

## 1. 先看结构，再动笔

打开的 `.md` 里已经分好段：

```text
## 主干            ← 选项之前的铺垫
【选项 1】… → 分支 1
## 分支 1          ← 选了之后独占的内容
## 分支 2
## 分支 3
```

**三条分支通常各自直接演到章末，没有共同合流段。** 别自己"补"一个共同结尾——
那等于把原作的分歧删掉。

用结构表确认每章的形状：

```bash
cat .cache/shiny/200300501.structure.json
```

---

## 1.5 一条命令看清进度

```bash
npm run content:board
```

```text
偶像    节     标题                    剧本        地点            时间          最早      节点  分支  状态
hiori  1/5   君のことを教えてほしい    200200401   station        09:00–15:00  第 3 天   48    0    已上线
mano   2/5   真乃ならできる            200100402   shopping_street12:00–18:00  第 6 天   58    3    已上线
...
卡面章 15 章：已上线 15，待审 0，缺对话 0
配置检查：全部通过
```

它同时检查六件事，任一不满足就红：

| 检查 | 拦什么 |
|---|---|
| 对话存在 | 链引用的对话既没批也没草稿 |
| 草稿不残留 | 已批准了，drafts 里还留着一份 |
| 剧本编号 | 章节没在 `chapterSources` 登记 |
| 触发地点 | 没写 locationId |
| 收束 flag | 结束没有写 flag |
| 动作名唯一 | 同地点同动作名被两条链用了（**真实踩过**：`她提前来了` 是巡的） |
| 天数递增 | 同一偶像后面章的天数早于前面 |

## 1.6 找剧本编号：别猜，问 API

卡面有几段、每段剧本编号是多少，**不用从 CSV 推**：

```bash
# 1. 偶像 id（真乃 1、灯织 2、巡 3 …）
curl 'https://api.shinycolors.moe/info/idolList'

# 2. 她的卡列表，找到卡名和 cardUuid
curl 'https://api.shinycolors.moe/info/idolInfo?idolId=2'

# 3. 这张卡的每段：eventId（=剧本编号）+ 标题
curl 'https://api.shinycolors.moe/info/pCardInfo?cardId=<cardUuid>'
```

返回长这样：

```text
200200401  君のことを教えてほしい
200200402  支えていきたい
200200403  幸福に満ちる
200200404  かつて夢見た眩しい姿
200200411  歩む先には理想の自分
```

**为什么必须用这个**：汉化 CSV 里有两段的 id 列是空的，
靠它永远找不全——API 一次就列出来了。

请求间隔 1 秒，别打太快（volunteer 服务）。

## 2. 章节边界

| 单位 | 规则 |
|---|---|
| **一段 commu = 一章** | 不合并、不拆分 |
| **一章 = 1 步剧情链** | 一次坐下读完 |
| **一章 = 1 段对话** | 选项的影响贯穿整章剩余部分 |

把一章拆成几步，选择就只能管到那一步——**视觉小说里不成立**。

---

## 3. 写对话：结构固定

```text
桥段开头（1–2 句，怎么进入这一幕）
  ↓
原作正文（可精简）
  ↓
原作的选项（位置不动，数量一致）
  ↓
各分支（跟着原作的长度，可压缩）
  ↓
各分支自己的结尾（原作没有共同合流就不写）
```

**不要**在桥段里加选项、不要加第二个选择点。

**压缩尺度**：删语气词和重复，不删信息。判定——删掉这句，读者会不会不知道发生了什么？

**分支长度跟随原作**：原作有 2 句的分支就写 2 句（灯织第三章三个分支各 2 句）。
校验下限是 2，不是 3——定太高会误伤原作。

---

## 4. 登记

**① 章节链**（`src/core/content/chapters/<名字>.ts`）

```ts
{
  id: 'meguru-swimsuit',
  idolId: 'meguru',
  title: '泳装的颜色',
  revealWhen: [{ kind: 'flag', key: 'completed.meguru.sunshine', value: true }],
  steps: [{
    locationId: 'shopping_street',
    timeWindow: { fromMinute: 10 * 60, toMinute: 20 * 60 },
    dialogueId: 'dialogue.meguru.swimsuit',
    actionLabel: '杂志那边约了新人特集',
    when: [{ kind: 'dayAtLeast', day: 5 }],
    effects: [
      { kind: 'attributeExp', ref: 'trust', tier: 3 },
      { kind: 'sharedStat', stat: 'stress', delta: -5 },
      { kind: 'flag', key: 'completed.meguru.swimsuit', value: true },
    ],
  }],
}
```

奖励要集中、要小：**章末结算一次**，总量约 信任 +3~4、单项属性 +1、压力 −5。
选择点的差别 ≤1 点（那是"口味"，不是"正解"）。

**② 出处表**（`src/core/content/chapterSources.ts`）

```ts
{
  chapterId: 'meguru-swimsuit',
  script: '200300501',
  source: '剧本 200300501',                    // 历史参考，可留空
  card: { title: '夏に恋するピチカート！', index: 1, total: 5 },
  anchors: ['2003005010010', '2003005010300', '2003005010190'],  // 原句 id
}
```

锚点是**原句 id**：中文没有权威译本可比，id 能对着私有缓存核对。

**旧格式剧本没有行 id**（`200200402` / `200200404` 就是这样）。这时锚点写成日文原句：

```ts
anchors: ['苦手だって言ってたステップ', '休むことだってアイドルの仕事', '仕事が楽しいっていうのもあるけどな'],
```

校验器按形状自动判断：13 位数字查 id，否则在剧本全文里找原句（忽略空白）。

---

## 4.5 触发配置核对（必做）

一章的触发不是"写个地点就行"，下面每一项都要对：

| 项 | 规则 | 错了会怎样 |
|---|---|---|
| `locationId` | 地点必须存在 | 行动不出现 |
| `timeWindow` | from < to，且在她能到的时间 | 永远碰不到 |
| `when` 的 flag | **只能是上一章的完成 flag**（第一章不能有） | 自引用 = 这章永不出现 |
| `when` 的 dayAtLeast | 严格大于上一章 | 顺序会乱 |
| `effects` 的 flag | 名字必须等于下一章 `when` 里要的 | 链断 |
| `revealWhen` | 手册什么时候显示 | 手册空白 |

`content:anchors` 会自动核对这几条：

```text
[第一章] 要求自己设置的 flag「completed.x」——这一章永远不会出现
[第二章] 没有承接上一章（第一章）的完成 flag
[第三章] 最早天数 8 没有晚于上一章的 12
```

> 真实事故：第一章的 `when` 里写了它自己才设置的 flag，
> 这一章在游戏里永远不会出现，而所有测试都是绿的。

## 5. 送审与接入

```text
对话进审查台（一章一条，整章通过/整章打回）
  ↓
把章节链接进 STORY_CHAINS
  ↓
取消 E2E 的 skip，跑一遍真实流程
```

**顺序不能反**：先接链会让 `BASE_PACK` 引用不存在的对话，每个草稿预检都报 `dialogue-ref`。

---

## 5.5 改已经上线的章（supersedes）

内容上线后才发现要改（比如去掉 W.I.N.G.），不要直接改 approved 文件：

```json
{
  "id": "draft.dialogue.mano.dream.v2",
  "supersedes": "dialogue.mano.dream",
  "status": "review",
  "payload": { /* 同样的 payload.id */ }
}
```

送审 → 通过后旧版自动移进 `discarded/`。

**两次真实事故**，都出在这个流程上：

1. **报「ID 与现有内容重复」**：`basePackFor` 只按草稿 id 排除旧版，
   而 `supersedes` 写的是内容 id → 旧版没排掉。现在两种 id 都排除。
2. **批准后内容自己消失**：修订的 payload.id 和 supersedes 相同，
   清理"旧文件"时把**刚批的这份**也扫进了 discarded（零工选项全没了）。
   现在清理只针对"批准之前就存在"的文件。

**教训**：修订的 payload.id 本来就该和旧版相同——
任何"按 payload.id 清理"的逻辑都必须排除本次刚批准的那一份。

## 5.6 E2E：一章一个断言

```ts
for (const chapter of chapters) {
  await jumpTo(page, chapter.day, chapter.minute, chapter.place);
  const button = page.getByRole('button', { name: chapter.action });
  await expect(button).toBeVisible();      // 动作真的出现了
  await button.click();
  await finishDialogue(page);
  expect((await getState(page)).flags[chapter.flag]).toBe(true);  // flag 真的写了
}
```

**两个断言缺一个都不算数**：只看 action 出现，可能点进去是别的链；
只看 flag，可能玩家根本走不到。

跑的时候用 `--retries=0`，否则失败会重试三遍，十分钟才出结果。

## 6. 提交前跑这几条

```bash
npx tsx tools/scriptExport.ts <剧本编号>   # 素材（一次性）
npm run content:anchors                    # 锚点 / 节号 / 章节形状
npm run content:audit
npm test
npm run build
```

### 机器会拦住你的事

| 规则 | 拦什么 | 需要私有缓存 |
|---|---|---|
| 卡面章必须 **1 步** | 又把一章拆成几步 | 否 |
| 一章 **≤1 个选择点** | 自己加戏 | 否 |
| **分支数 = 原作** | 少写/多写分支 | 是 |
| **分支厚度 ≥3 节点**（原作有分支时） | 选项变成"只换一句话" | 是 |
| **无孤立节点** | 链中间断了（写了但走不到） | 否 |
| **锚点 id 在剧本里存在** | 抄错 id | 是 |
| **卡内节号与语料一致** | 顺序填错 | 是 |

没有私有缓存（别的机器 / CI）时，"需要私有缓存"的几条跳过并提示。

---

## 7. 踩过的坑（每条都真实发生过）

| # | 事故 | 现在的防线 |
|---|---|---|
| 1 | 没查语料就写，相遇写成公园长椅 | 角色卡要求逐字引文（后来换成 id 锚点） |
| 2 | 一张卡只看到 2 个文件（实际 5 段） | `scriptExport` + 文件夹全量列出 |
| 3 | 把第 4 段当成第 2 段 | commu id 序号 + 节号校验 |
| 4 | 一章拆 4 步，选项只影响一步 | 一章 = 1 步 = 1 段对话 |
| 5 | 分支压成 1 句，选项形同虚设 | 分支厚度校验 |
| 6 | 桥段里自己加选项（9 个 vs 原作 3 个） | 一节 ≤1 个选择点 |
| 7 | 以为"分支会合流"，自己补了共同结尾 | 读结构表：分支各自到章末 |
| 8 | 以为"纯白/咖啡 选完就合流"（实际 13–20 句） | 分支数来自剧本，不靠猜 |
| 9 | 链中间断了，26 个节点走不到 | 可达性校验 |
| 10 | 奖励给太多（信任 +13/章） | 章末结算一次，总量封顶 |

---

## 8. 一句话总结

**拉剧本 → 看结构（分支几支、哪支到哪结束）→ 一章一段对话 → 中文自己写、可精简 →
锚点用 id → 先过审再接入。**
