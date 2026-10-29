# 内容审查台

> 当前有效 · `0.23.0` 起
> 入口：`npm run review` → `http://localhost:5174/review.html`
> 性质：本地开发工具，不进正式构建，不暴露到公网

## 1. 它是什么

一个跑在本机的**内容编辑台 + 审查队列**：

```text
新建草稿 → 编辑 → 保存 → 送审
                ↓ 打回            ↓ 通过
            revisions ←────────  drafts ──────→ approved
                │                                   │
           改完重新送审                         构建时进入游戏
```

它不是玩家页面，也不写 localStorage：状态由**文件所在目录**决定，能用文件管理器看、能用 Git diff、AI 能直接读 `revisions/` 改稿。

**流转之后停在当前队列**：通过 / 打回 / 废弃之后不会跳到目标状态的标签页，而是留在你现在看的这一页，自动选中队列里的下一条，并在顶部提示一句「《标题》已通过」。审一整批的时候不用来回切 tab。

## 2. 链路

```text
content-review/
  drafts/      待审查
  revisions/   待修改（打回后）
  approved/    已通过，构建时进入游戏
  discarded/   废弃（保留可追溯）
  archived/    历史样例，不参与任何流程
```

`approved/` 是**唯一**进入游戏的出口。它不是被运行时读取的，而是**生成**成代码：

```text
content-review/approved/*.json
        │  npm run content:sync（构建门会自动跑，审批时也会自动跑）
        ▼
src/core/content/approved.generated.ts   ← 不要手改
        │
        ▼
PRODUCTION_PACK = BASE_PACK + approved（游戏加载的就是它）
```

| 概念 | 是什么 |
|---|---|
| `BASE_PACK` | 只用 TS 写死的内容，**不含** approved |
| `PRODUCTION_PACK` | `BASE_PACK` + approved，游戏实际加载的包 |
| `approved.generated.ts` | 由 `content:sync` 生成，审批通过后自动更新 |

构建门（`content:validate`）和审查台都用 `BASE_PACK` 做基准，再把 approved 合上去——否则 approved 会被算两次，报重复 id。

> 为什么不用 `import.meta.glob`：它在**构建产物运行时不存在**，任何 `typeof` 判空都会让整批 approved 静默变空；而无头脚本（`tsx`、构建门、vite 配置）里它又完全不存在。生成文件对两边都成立。这条踩过一次，`tests/prologue/approved.spec.ts` 是它的看门测试。

## 3. 支持的类型

| kind | 表单覆盖 | 只能走高级 JSON |
|---|---|---|
| `activity` | 名称 / ID / 描述 / 类型 / 时长 / 目标 / 体力与金钱消耗 / **专属偶像**（多选）/ 可用地点（多选）/ 结果文本（可增删） | effects、failureEffects、check、requires |
| `event` | 标题 / ID / 正文 / 概率 / 优先级 / once / 权重 / 冷却 / 入口（随机·到达·链）/ 每 N 天 / 到点时刻 / 组合人数 / 固定组合 cast / 选项（标题·提示·结果） | when、after、effects、nextEventId、dialogueId |
| `job` | 名称 / ID / 描述 / 地点 / 起止时间 / 报酬 | effects |
| `item` | 预览为主（类别 / 价格 / 限购 / 赠送效果与偏好） | 全部 |
| `shop` | 预览为主（地点 / 商品清单） | 全部 |
| `dialogue` | 纯 JSON | 全部 |
| `story` | 纯 JSON | 全部 |

**内容走审查台，结构和配置留 TS。** 行动、事件、工作、对话、剧情链、物品、商店都从这里进游戏；偶像、角色日程、地点、交通、地图、饰品、初始状态属于结构，直接写在 `src/core/content`，因为它们不是一条条可批注的稿子。

kind 清单只有一份：`REVIEW_KINDS`（`src/review/types.ts`）。类型、校验表、服务端白名单、读取脚本都从它派生——**新增一种 kind 只改这一个地方**。

预览区按类型渲染成卡片（行动显示时长/消耗/地点/结果文本，事件显示选项与 `when` 摘要），不用回游戏里确认。

**专属偶像**（`idolIds`）留空就是全员通用；勾了就只在这些偶像的互动页出现，别的偶像看不到（是隐藏，不是灰掉）。

## 4. 校验只有一套规则

这是这个系统最容易坏的地方，也是现在的核心约束：

```text
validateDraftShape()   结构：必填字段、数组还是对象、节点引用形状
        ↓
mergeApprovedContent() 把草稿并进「生产内容 + 其他 approved」
        ↓
auditPack(index)       语义：条件/效果种类、id 是否存在、预算、flag 读写
```

`auditPack` 就是构建门 `content:audit` 用的那个函数，**审查台和构建门共用一份规则**。

运行时白名单也只有一个来源 `src/core/contentSchema.ts`，并带编译期保险：```ts
type AssertNever<T extends never> = T;
export type _EffectKindsComplete = AssertNever<Exclude<Effect['kind'], EffectKind>>;
```

给 `types.ts` 加了新效果却忘了加进 `EFFECT_KINDS`，`tsc` 直接报 `Type '"fans"' does not satisfy the constraint 'never'`。

> 背景：`0.22.0` 之前审查台自己维护了 6 种效果 / 15 种条件的白名单，和真实类型（12 / 23）漂了一整代。任何用到 `vars`、粉丝、物品、偶像状态、双人组合的内容，点「通过」都会被 422「未知条件」挡回去。这套白名单已经删除。

校验时基准包会带上**其他已通过的草稿**，所以「剧情链引用五分钟前刚过的对话」不会误报；同时会排除自己要替换的旧版本（`supersedes`），否则修订版永远过不了重复 id 检查。

**互相引用的内容要按依赖顺序通过。** 校验基准只有「生产内容 + 已通过」，看不到还在队列里的草稿。所以商店上架物品时，必须**先通过物品，再通过商店**；反过来会报 `item-ref`。物品不反向引用商店（`ItemDef.shopId` 只是数据字段，货架由 `ShopDef.itemIds` 决定），就是为了让这个顺序成立。

## 5. 数据模型

```ts
type ReviewStatus = 'review' | 'revision' | 'approved' | 'discarded';
type ReviewKind = 'activity' | 'event' | 'job' | 'dialogue' | 'story';

type ReviewDraft = {
  id: string;              // 草稿 id，不是内容 id
  kind: ReviewKind;
  title: string;
  status: ReviewStatus;
  version?: number;
  rootId?: string;         // 版本线的起点
  supersedes?: string;     // 这条要替换哪一条
  payload: unknown;        // 真正的内容定义，形状同 types.ts 里的 Def
  annotations: { id; text; field?; createdAt; resolved? }[];
  createdAt; updatedAt; reviewedAt?; history;
};
```

写文件一律「临时文件 + rename」，避免半写。

## 6. 接口

```text
GET    /api/review/drafts                 列表
GET    /api/review/drafts/:id             单条
POST   /api/review/drafts                 新建（kind, title）
PUT    /api/review/drafts/:id             保存 payload / title / annotations
POST   /api/review/drafts/:id/status      流转（approved 前校验）
POST   /api/review/drafts/:id/revise      已通过 → 修订为新版本
POST   /api/review/drafts/:id/annotations 加批注
PATCH  /api/review/drafts/:id/annotations/:noteId  标记已处理
```

`approved` / `discarded` 是锁死的，只能通过 `revise` 复制出新版本。

## 7. 边界

不做，且是刻意的：

- 远程服务、登录、权限、多人并发（当前作者和游戏在同一台机器）
- 自动修改、自动修复、自动通过（打回后由人或 AI 手动改）
- 在线 CMS、数据库

已知限制：

- approved 需要**重新构建**才进游戏（dev 下 Vite 会热更新 JSON）。
- 事件表单不覆盖 `when` / `after`：条件树的可视化编辑器还没做，复杂条件请用高级 JSON。

## 8. 陷阱

- **加新条件/效果只改 `contentSchema.ts`**。它是唯一白名单，改完审查台、构建门、引擎同时生效。
- **approved 直接并进生产包**。一条坏 JSON 能让游戏白屏，所以 `content:validate` 是构建门，不是可选项。
- **校验基准包必须包含其他 approved**，否则链式内容过不了审。
- **修订版共用 payload id**：校验时要排除 `supersedes`，通过后旧的自动转 `discarded`。
- **别在浏览器里做文件读写**：所有落盘都走 `/api/review`，UI 只调接口。

## 9. 验收

```text
Vitest
  · 结构校验：事件/工作/行动/对话/剧情链各一组正反例
  · 现代字段（fans / var / entry=arrival）能通过——旧白名单曾在这里失败
  · 未知条件 / 未知效果被拒
  · id 与已有内容重复被拒
  · auditPack 对 fixture 包零错误零警告

Playwright
  · 新建 → 编辑 → 保存 → 批注 → 打回 → 重新送审 → 通过 → 修订 → 替换旧版本
  · 对话 + 剧情链（跨草稿引用）都能通过

构建门
  · npm run content:validate 对 approved 目录做结构 + 合并 + 体检
  · npm run content:audit 输出全局错误/警告数
```

## 10. 历史

`0.22.0` 及以前：审查台只能造事件/工作/对话/剧情链四类，approved 内容**没有任何加载器**（`src/core/content/approved.ts` 在「reset production content to Mano prologue」里被删掉），通过之后只会躺在目录里等 `content:validate` 检查一遍。

`0.23.0`：恢复 approved 载入、删除重复白名单、加行动类型、补齐事件表单字段。
