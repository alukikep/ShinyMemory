# 角色资料包（28 人）

> 由 `npm run content:materials` 生成/更新。
> 原始 JSON 在 `.cache/shiny/materials/`（gitignore，不提交）；本目录只放**可提交的索引**。

## 1. 这里有什么

| 文件 | 内容 |
|---|---|
| [index.md](index.md) | 28 人的 id / 组合 / 生日 / 年龄 / CV / 头像 / WING 剧本编号 / 首张卡与卡面剧本编号 |
| `.cache/shiny/materials/idol-<N>.json` | `idolInfo` 原始返回（卡列表、角色色、CV、身高…） |
| `.cache/shiny/materials/card-<uuid>.json` | `pCardInfo` 原始返回（`cardIdolEvents[].eventId` = 剧本编号） |

## 2. 资料分级：什么能直接写，什么必须回查

| 内容 | 来源 | 能不能直接写进游戏 |
|---|---|---|
| id、组合、角色色、生日、CV、卡名 | API | ✅ 事实，直接用 |
| 卡面有几段、每段剧本编号 | API `pCardInfo` | ✅ 直接用 |
| 人设细节（家庭、喜好、方言、关系） | eidolon-sc `characters/facts/<id>.md` | ⚠️ **只能当阅读参考**：写进角色卡时必须换成官方剧本的 13 位行 id |
| 台词、语气、分支、相遇经过 | 官方剧本（`tools/scriptExport.ts`） | ✅ 唯一事实来源 |

eidolon-sc 的 facts 质量高、且每份配 `.sources.md`（记到"目录 / 卡名 / 话名"级别）。
**用法**：先用它建立印象 → 找到对应剧本 → 引用原文行 → 再写我们的中文。
它的 sources 是"话名"，不是行 id，所以不能直接当 `content:guard` 的出处。

## 3. 卡怎么选

`index.md` 里的"首张卡"= **最早发售的 P 卡**（按 `releaseDate`）。
它只是资料索引，不代表必须改编这张：

- 想做别的卡：`curl 'https://api.shinycolors.moe/info/pCardInfo?cardId=<cardUuid>'`，
  `cardUuid` 从 `idolInfo` 的 `cardLists` 里挑，`cardIdolEvents[].eventId` 就是剧本编号。
- 选卡建议：优先 **3 段以上**（commu + after story）的卡，内容量够一章一链。
- 现有 5 人的实际改编卡与"首张卡"不完全一致（巡、摩美々），属于正常选择。

## 4. 已知缺口

| 缺口 | 影响 |
|---|---|
| `hana`（铃木羽那）、`haruki`（郁田はるき）没有 Q 版头像 | 名册退回首字；需要补素材或接受占位 |
| eidolon-sc facts 的出处是话名，不是行 id | 写角色卡时必须回剧本逐条核对 |
| 部分角色的首卡只有 1–2 段（本批 L'Antica 是 3 段） | 章节数少，可换卡或补长线 |

## 5. 已核对样例（可作为模板）

月冈恋钟（`kogane`）：

```text
WING 相遇   100400101   佐世保出身 / 方言 / 全部落选 / 被选中——facts 与剧本逐条对得上
首卡        200400301 うちんすごか腕前
            200400302 長崎よかとこ（分支 7/6/5）
            200400311 いつか帰る日
```

导出命令：`npx tsx tools/scriptExport.ts 100400101 200400301 200400302 200400311`，
产物在 `.cache/shiny/`（日文原文 + 行 id + 分支结构）。

## 6. 下一步

按 [new-idol.md](../new-idol.md) §2 的 12 步走。
写角色卡时从 facts 节选，但**每条事实都要换成剧本行 id**；指不回去的不写。

L'Antica 四人的具体方案（招募地点、日程、首卡、内容草案）见 [lantica-plan.md](lantica-plan.md)，待审。
