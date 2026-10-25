# 内容审查系统评估

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

## 需要确认

1. 作者是否和游戏在同一台机器上？
2. 第一版是否只审查事件和工作？
3. 审查页是否需要直接编辑内容，还是只批注？
4. 打回后由你手动叫 AI 修改，还是页面提供“复制批注”？
5. approved 内容是否需要重启/重新构建才生效？

## 推荐

先做：

```text
本地审查控制台
+ JSON 草稿
+ 通过/打回/废弃
+ approved 加载
+ 校验
```

不做：

```text
在线 CMS
数据库
自动修改
自动发布
玩家可见审查页
```

这符合当前单机、文件驱动、AI 协作的原型结构，成本也可控。
