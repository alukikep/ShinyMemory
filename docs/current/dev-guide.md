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
| 7 | 内容先写后查语料 | 灯织的相遇写成公园长椅，原作是练习室 | `content:guard` 要求卡里有三条逐字引文 |

---

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
| `content:coverage` | 每个偶像的内容单元是否齐全 | 手动（建议每轮跑） |
| `viewContract.test` | 界面读的字段从对象上消失 | `npm test` |
| `content:anchors` | 卡面改编的锚点句（语料里有 + 游戏里也有） | `content:validate` |
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

---

## 6. 还没做的（技术债）

| 项 | 影响 | 建议 |
|---|---|---|
| 数值回归没有自动化 | `balance.test` 跑夹具，正式包数值没人守 | 写一个"第 7 天粉丝数"模拟脚本 |
| 每个角色没有独立 E2E | 靠 `tests/prologue/*` 手写 | 按角色生成冒烟 spec |
| 剧情链的对话写在 TS | 不走审查台（与"内容走审查台"有出入） | 改成 approved 引用 + 审批顺序守卫 |
| `content:coverage` 不在构建门里 | 忘了跑就发现不了缺口 | 视情况接进 `content:validate` |
