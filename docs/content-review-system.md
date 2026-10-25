# 内容审查系统评估

## 当前阶段

第一阶段骨架已实现：

- `content-review/drafts|revisions|approved|discarded`；
- `ReviewDraft` 类型；
- `LocalReviewRepository`；
- Vite 本地 `/api/review`；
- `npm run review`；
- 审查台队列；
- 事件/工作只读预览；
- 字段批注展示；
- 示例草稿。

尚未实现：

- 新建草稿；
- 页面内编辑；
- 保存；
- 通过/打回/废弃写入；
- approved 内容加载；
- schema 校验；
- 重新送审。

## 已确认的产品决策

1. 作者目前和游戏在同一台机器；未来分发时再拆出服务端。
2. 第一版只审查事件和工作。
3. 审查页同时需要批注和页面内编辑。
4. 打回后进入待修改池；作者会明确要求 AI 读取并修改，不做自动修改。
5. 允许 approved 内容需要重新构建才进入游戏。

这些决策意味着第一版不是“只读审查页”，而是：

```text
本地内容编辑台
+ 审查队列
+ 批注
+ 状态流转
+ approved 构建加载
```

## 结论

需要先明确一点：

> 审查页面不能只是游戏里的一个普通页面。

当前游戏是静态 Vite 构建：

```text
src/core/content/*.ts
→ 构建时打包
→ 浏览器读取
→ localStorage 只保存游戏状态
```

浏览器页面没有权限把“通过”的内容写回源码或构建产物。

所以审查系统必须是：

```text
本地开发工具
+ 文件系统
+ 只在开发环境运行
```

不是玩家游戏内页面，也不是 localStorage 状态。

## 推荐形态

```text
npm run review
→ 启动本地审查控制台
→ 浏览器打开 /review
→ 读取 content-review/drafts
→ 作者预览、批注、通过、打回、废弃
→ 文件移动到 approved / revisions / discarded
→ 游戏构建只读取 approved
```

审查页面只负责：

- 预览；
- 判断；
- 批注；
- 状态流转。

不负责：

- 自动修改内容；
- 自动生成内容；
- 自动修复；
- 自动通过。

修改仍由人或 AI 手动完成。

## 目录结构

建议：

```text
content-review/
  drafts/       待审查
  revisions/    待修改
  approved/     已通过，进入游戏
  discarded/    废弃
```

每个内容是一个 JSON 文件：

```text
content-review/drafts/event_2026_001.json
content-review/revisions/event_2026_001.json
content-review/approved/event_2026_001.json
```

状态不写进 localStorage，而是由所在目录决定。

优点：

- 可直接用文件管理器看；
- 可用 Git diff；
- 出错时容易恢复；
- 不依赖数据库；
- AI 可以直接读取 revisions。

## 数据模型

```ts
type ReviewStatus = 'review' | 'revision' | 'approved' | 'discarded';

type ReviewKind = 'event' | 'job' | 'schedule' | 'location';

type ReviewAnnotation = {
  id: string;
  text: string;
  field?: string;
  createdAt: string;
};

type ReviewDraft = {
  id: string;
  kind: ReviewKind;
  title: string;
  status: ReviewStatus;
  payload: unknown;
  annotations: ReviewAnnotation[];
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  history: {
    status: ReviewStatus;
    at: string;
    note?: string;
  }[];
};
```

第一版只支持：

```text
event
job
```

日程和地点后续再加。

## 流程

```text
新建草稿
→ drafts/review
→ 作者打开审查页面
→ 通过
   → approved
   → 下一次构建进入游戏
→ 打回
   → revisions + 批注
   → AI/人修改
   → 作者说“重新送审”
   → 文件移回 drafts
→ 废弃
   → discarded
```

关键：

- 通过后不是立刻修改运行中的游戏；
- 需要重新构建或开发服务器 HMR；
- 被打回的内容不会进入游戏；
- 废弃内容保留文件，可追溯。

## 审查页面

建议布局：

```text
┌──────────────┬────────────────────────────┬──────────────┐
│ 队列          │ 内容预览                    │ 审查操作      │
│              │                            │              │
│ 待审查 3      │ 事件标题 / 文本             │ [通过]        │
│ 待修改 2      │ 条件 / 效果 / 选项           │ [打回]        │
│ 已通过 10     │ 引用校验                    │ [废弃]        │
│ 已废弃 1      │ 批注列表                    │              │
└──────────────┴────────────────────────────┴──────────────┘
```

### 队列

- 待审查；
- 待修改；
- 已通过；
- 已废弃。

### 预览

事件：

- 标题；
- 正文；
- 触发条件；
- 选项；
- 效果；
- 结果文本；
- 引用的地点/偶像/活动是否存在。

工作：

- 名称；
- 地点；
- 时间段；
- 报酬；
- 效果；
- 事后事件。

### 批注

支持：

- 整体批注；
- 指定字段批注；
- 批注时间。

第一版可以只做整体批注。

### 操作

- 通过；
- 打回；
- 废弃；
- 重新送审（可选）。

重新送审不自动修改内容，只把文件从 revisions 移到 drafts。

## 审查页是开发工具

建议：

```text
/review
只在 npm run review 时可用
```

不要把它放进正常游戏导航。

不要把它打进正式构建。

不要让它暴露在公网。

为了简化：

- 绑定 `127.0.0.1`；
- 不需要登录；
- 不需要数据库；
- 不做多人并发。

如果以后作者不在同一台机器，再考虑后端和权限。

## 与游戏内容的关系

游戏只读取：

```text
content-review/approved/
```

不读取：

```text
drafts/
revisions/
discarded/
```

推荐加载方式：

```ts
import.meta.glob('../../content-review/approved/events/*.json', {
  eager: true,
});
```

加载时：

1. 解析 JSON；
2. 校验 schema；
3. 检查引用；
4. 合并进 `EVENTS` / `JOBS`；
5. 构建失败则不允许发布。

## 校验

通过前必须检查：

- JSON 结构；
- 事件 ID 唯一；
- 地点存在；
- 偶像存在；
- 活动存在；
- 效果类型合法；
- 条件类型合法；
- 时间窗口合法；
- 工作时段有效；
- 工作地点存在；
- 结果文本非空；
- 选项至少一个。

校验失败：

```text
不能通过
显示字段错误
留在待修改
```

## 为什么不把状态放 localStorage

因为：

- 只对当前浏览器有效；
- 清缓存就丢；
- 不能参与构建；
- 不能被 Git 追踪；
- 不能作为正式内容状态。

localStorage 只适合游戏存档，不适合内容审查。

## 为什么不做自动修改

按你的要求：

```text
不自动修改内容
不自动修复
不自动通过
```

修改流程：

```text
作者打回 + 批注
→ 你告诉 AI“查看待修改池”
→ AI 读取 revisions
→ 修改文件
→ 作者重新送审
```

审查页面只提供状态和批注，不负责生成。

## 与 AI 的协作边界

AI 可以：

- 读取 `revisions/`；
- 读取批注；
- 修改内容文件；
- 重新校验；
- 把文件移回 `drafts/`（在你要求后）。

AI 不应该：

- 自己点击通过；
- 自己把内容移入 approved；
- 自动清除批注；
- 自动废弃。

## 工作量

```text
R1 目录/状态/schema       0.5 天
R2 本地 review 服务       0.5–1 天
R3 审查页面               1–2 天
R4 approved 加载与校验    0.5–1 天
R5 测试与文档             0.5 天
```

总计 **3–5 天**。

第一版可以只做 event/job，不碰日程和地点。

## 风险

- 审查页和游戏渲染不一致；
- JSON 与 TypeScript 类型漂移；
- approved 内容需要重新构建才生效；
- 本地服务路径/Windows 权限；
- 作者不在同一台机器时需要后端；
- 批注字段变得复杂；
- 审查页面被误暴露到公网。

## 建议的第一版

```text
1. content-review 四个目录
2. ReviewDraft 数据结构
3. npm run review
4. 只读审查页
5. 通过/打回/废弃
6. approved JSON 加载
7. 基础校验
8. 不做页面内编辑
9. 不做自动修改
```

## 页面内编辑

第一版需要支持新建和编辑：

```text
事件
工作
```

### 编辑方式

建议：

```text
常用字段：表单
复杂字段：高级 JSON
```

事件表单：

- 标题；
- 正文；
- 触发条件；
- 选项；
- 每个选项的结果和效果；
- 可选的后续事件。

工作表单：

- 名称；
- 描述；
- 地点；
- 开始/结束时间；
- 报酬；
- 效果；
- 工作事件。

条件/效果编辑器第一版可以只覆盖常用类型：

```text
atLocation
timeWindow
rankAtLeast
sharedStatAtLeast
flag
```

复杂条件：

```text
all / any / not
```

用高级 JSON 编辑，避免一开始做完整可视化条件树。

### 编辑和批注的关系

- 编辑修改 payload；
- 批注指向字段路径；
- 字段被修改后，批注可以标记为已处理；
- 打回时保留全部批注。

### 保存

- 显式“保存草稿”；
- 保存前做 schema 校验；
- 校验失败允许保存，但禁止通过；
- 文件写入采用临时文件 + rename，避免半写。

## 版本与 approved

approved 内容不应该被直接编辑。

修改已通过内容时：

```text
从 approved 复制出新草稿
→ status = review
→ version + 1
→ supersedes 旧版本
→ 新版本通过后替换旧 approved
```

第一版可以简化为：

- approved 文件只读；
- 需要修改时由作者新建一个草稿；
- 旧 approved 保留，直到新版本通过。

## 存储边界

审查 UI 不直接读写文件，而是通过接口：

```ts
interface ReviewRepository {
  list(status?: ReviewStatus): Promise<ReviewDraft[]>;
  get(id: string): Promise<ReviewDraft | undefined>;
  save(draft: ReviewDraft): Promise<void>;
  move(id: string, status: ReviewStatus, note?: string): Promise<void>;
  addAnnotation(id: string, annotation: ReviewAnnotation): Promise<void>;
}
```

当前实现：

```text
LocalFileReviewRepository
→ content-review/
```

未来分发：

```text
RemoteReviewRepository
→ API / 数据库 / 对象存储
```

UI 不需要重写。

## 未来分发边界

现在不做的：

- 登录；
- 权限；
- 多用户并发；
- 远程文件系统；
- 在线 CMS。

未来需要时再加：

```text
认证
角色（作者/审查者/管理员）
服务端存储
审计日志
```

当前只需绑定：

```text
127.0.0.1
```

不暴露到公网。

## 修订后的 MVP

```text
1. content-review 四目录
2. ReviewDraft + 状态历史
3. ReviewRepository 接口
4. 本地文件实现
5. npm run review
6. 队列 + 预览
7. 事件/工作表单
8. 高级 JSON 编辑
9. 字段批注
10. 通过/打回/废弃/重新送审
11. approved JSON 加载
12. schema + 引用校验
13. 基础 E2E
```

不做：

```text
自动修改
自动通过
在线 CMS
数据库
玩家可见审查页
```

## 修订后的工作量

```text
R1 数据模型/目录/校验      1 天
R2 ReviewRepository + API  1 天
R3 审查页面/队列/预览      1–1.5 天
R4 事件/工作编辑器         1.5–2 天
R5 批注与状态流转          0.5–1 天
R6 approved 加载/构建门    0.5–1 天
R7 测试与文档              1 天
```

总计约 **6–8 天**。

如果第一版只做“表单常用字段 + 高级 JSON”，可以控制在 **5–6 天**。

## 推荐

第一版：

```text
本地内容编辑台
+ 事件/工作
+ 表单 + 高级 JSON
+ 批注
+ 通过/打回/废弃
+ approved 加载
+ 校验
+ 重新构建生效
```

不做：

```text
在线 CMS
数据库
自动修改
自动发布
玩家可见审查页
```

这符合当前单机、文件驱动、AI 手动协作的结构，也为未来远程审查留出接口边界。
