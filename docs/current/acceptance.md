# 自动验收

> 当前有效 · 2026-10-27

## 当前状态

已实现最小闭环：

```bash
npm run acceptance
```

- Playwright Test；
- `?debug=1` 状态/操作桥；
- 11 条引擎浏览器流程；
- 3 条内容浏览器流程（冻结 fixture）；
- 1 条正式序章流程（production build）；
- 2 条审查流程 E2E；
- 失败 trace / 截图；
- HTML 报告；
- 桌面与移动端布局断言。

测试文件：

```text
tests/acceptance/job.spec.ts
tests/acceptance/schedule.spec.ts
tests/acceptance/responsive.spec.ts
tests/acceptance/shop.spec.ts
tests/acceptance/smoke.spec.ts
tests/acceptance/save.spec.ts
tests/content/hiori.spec.ts
tests/content/meguru.spec.ts
tests/prologue/mano.spec.ts
tests/review/review.spec.ts
```

当前验收：

```text
引擎 11 passed
内容 3 passed
正式序章 1 passed
审查 2 passed
```

`npm run acceptance:prologue` 使用 production build，验证事务所序章、无已招募偶像空状态和真乃两次相遇。

引擎与内容验收都使用 fixture build：

```bash
npm run acceptance
# = npm test + build:fixture + 引擎 acceptance + 内容 acceptance
```

本地使用 Edge：

```ts
channel: 'msedge'
```

视频录制关闭，因为当前环境缺少 Playwright ffmpeg。

## 结论

推荐：

```text
Playwright Test
+ 仅调试环境的状态/操作桥
+ 关键流程断言
+ 少量视觉截图
```

不使用纯自定义脚本，也不依赖人工每次点完整流程。

## 当前状态

已有：

- Vitest 单元/集成测试；
- 187 个测试；
- 构建检查；
- SSR UI 测试；
- 多尺寸截图人工检查；
- 核心时间/触发/平衡模拟。

缺少：

- 真实浏览器点击流程；
- 接工作 → 日程 → 参与 → 奖励的端到端断言；
- 不参与路径的浏览器断言；
- 刷新/存档恢复；
- 4 档布局自动检查；
- 自动截图对比；
- CI 可执行的验收入口。

## 工具选择

### 方案 A：Playwright Test

优点：

- 自带 test runner；
- 自动等待；
- trace/video/screenshot；
- HTML 报告；
- `webServer` 可启动 preview；
- 多项目/多视口；
- 可接 axe。

缺点：

- 新增依赖；
- 需要浏览器；
- UI 选择器需要维护。

推荐：**使用**。

### 方案 B：playwright-core + 自写脚本

优点：

- 依赖小；
- 灵活。

缺点：

- 没有测试报告；
- 没有 trace；
- 没有失败重试；
- 需要自己写断言/生命周期；
- 不适合长期回归。

推荐：**不作为主方案**。

### 方案 C：Vitest Browser Mode

优点：

- 和现有 Vitest 统一。

缺点：

- 配置复杂；
- 生态不如 Playwright Test 成熟；
- 对完整页面流程和多视口支持较弱。

推荐：**暂不使用**。

## 浏览器

本地 Windows：

```text
channel: 'msedge'
```

使用已安装 Edge，避免额外下载。

CI：

```bash
npx playwright install --with-deps chromium
```

统一使用 Chromium。

## 状态/操作桥

真实浏览器测试如果完全靠点击：

- 跳到未来日期很慢；
- 无法直接读取 `jobs` / `scheduleOverrides`；
- 只能通过 DOM 猜状态；
- 容易受随机事件打断。

因此加一个只在调试环境可用的桥：

```ts
window.__SHINY_MEMORY__ = {
  getState(): GameState;
  dispatch(command: ActionCommand): void;
  jumpTo(day: number, minuteOfDay: number): void;
  reset(seed?: number): void;
};
```

暴露条件：

```text
?debug=1
```

正常游戏不提供写操作入口。

### 用途

验收脚本可以：

```ts
const state = await page.evaluate(() =>
  window.__SHINY_MEMORY__.getState(),
);
expect(state.jobs).toHaveLength(1);
```

也可以：

```ts
await page.evaluate(() =>
  window.__SHINY_MEMORY__.jumpTo(7, 10 * 60),
);
```

这比通过点击睡 6 天稳定得多。

### 注意

- 桥不是安全边界；
- 仅单机游戏；
- 不在正式 UI 中展示；
- 不把内部状态渲染给正常玩家；
- 写操作只在 debug 查询下挂载。

## 测试结构

```text
tests/acceptance/
  smoke.spec.ts
  job.spec.ts
  schedule.spec.ts
  persistence.spec.ts
  responsive.spec.ts
  a11y.spec.ts
```

### smoke

- 首日加载；
- 日期/时间/金钱；
- 7 个地图节点；
- 侧边栏导航；
- 无 console error；
- 无页面异常。

### job

#### 参与路径

```text
接杂志拍摄
→ jobs 有实例
→ schedule override 是 replace-day
→ 跳到 4 月 12 日 10:00
→ 移动到录音棚
→ 出现“参与：杂志拍摄”
→ 点击
→ 金钱 +1200
→ 工作移除
→ 日志包含参与
→ 进入下一天
→ 日程恢复
```

#### 不参与

```text
接工作
→ 跳到工作结束后
→ jobs 为空
→ 金钱不变
→ 体力/压力不变
→ 没有未参与日志
```

### schedule

- 第一列是今天；
- 显示未来 7 天；
- 跨月日期正确；
- 临时工作标记；
- 关闭/重新打开。

### persistence

```text
接工作
→ reload
→ jobs 仍存在
→ 跳到结束后 reload
→ jobs 已清理
```

### responsive

```text
1440
1024
768
390
```

断言：

- 无横向溢出；
- 场景/行动/地图/日志存在；
- 底部导航不遮挡最后一个可点按钮；
- 地图当前节点 `fill` 不透明；
- 日程表可滚动。

### a11y

- 名册/日程表 dialog 有名称；
- Escape 关闭；
- 初始焦点进入；
- 按钮有可访问名称；
- axe 基本扫描。

## Playwright 配置

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/acceptance',
  fullyParallel: false,
  retries: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], channel: 'msedge', viewport: { width: 1440, height: 1000 } },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'], channel: 'msedge' },
    },
  ],
});
```

`acceptance` 前先构建 fixture：

```json
"acceptance": "npm test && npm run build:fixture && playwright test && playwright test -c playwright.content.config.ts",
"acceptance:prologue": "npm run build && playwright test -c playwright.prologue.config.ts",
"acceptance:review": "npm run build && playwright test -c playwright.review.config.ts"
```

## 随机事件处理

测试可能遇到：

- 生日；
- 雨天；
- 临时通告；
- 工作事件。

验收辅助函数：

```ts
async function continueThroughEvents(page: Page) {
  // 如果出现 event，选择第一项
  // 如果出现 eventResult，点击继续
}
```

但关键流程不应依赖随机事件。

可以使用固定 seed：

```text
?debug=1&seed=1
```

或者测试桥直接设置状态。

## 视觉验收

不建议一开始对所有页面做像素对比。

只对稳定页面做：

```text
首日桌面
首日移动端
日程表
名册
```

使用：

```ts
await expect(page).toHaveScreenshot('desktop-plan.png', {
  maxDiffPixelRatio: 0.01,
});
```

动态日志/随机事件不要放进视觉基线。

## CI

```bash
npm ci
npx playwright install --with-deps chromium
npm run acceptance
```

失败产物：

- HTML report；
- trace；
- 失败截图；
- video。

## 风险

### 1. E2E 脆弱

选择器依赖 UI 文案。

对策：

- 用 `getByRole`；
- 关键按钮加稳定的 aria-label；
- 不要大量依赖 CSS class。

### 2. 随机事件

对策：

- 固定 seed；
- 事件 helper；
- 状态桥跳过。

### 3. 视觉基线噪声

对策：

- 只对比稳定页面；
- 容忍 1% 像素差；
- 不在动画中间截图。

### 4. 调试桥泄漏

对策：

- 仅在 `?debug=1` 挂载；
- 不显示在 UI；
- 不接受远程输入。

### 5. 测试慢

6 个 spec 预计 1–2 分钟。

不要把所有单元测试都搬进浏览器。

## 实施拆分

### A1：状态/操作桥

- `getState`；
- `dispatch`；
- `jumpTo`；
- `reset`；
- debug 条件下挂载。

约 0.5 天。

### A2：Playwright 基建

- 依赖；
- 配置；
- `npm run acceptance`；
- smoke spec。

约 0.5 天。

### A3：关键流程

- job 参与；
- job 不参与；
- schedule；
- persistence。

约 0.5–1 天。

### A4：布局与 a11y

- 4 档；
- axe；
- 关键截图。

约 0.5 天。

总计 **1.5–2 天**。

## 验收输出

```text
playwright-report/
test-results/
  artifacts/
  screenshots/
```

报告示例：

```text
smoke              pass
job participate    pass
job absent         pass
schedule 7 days    pass
persistence        pass
responsive 390     pass
a11y               pass
```

## 推荐优先级

先做：

```text
A1 状态桥
A2 Playwright
A3 job 参与/不参与
A3 persistence
```

后做：

```text
A4 多视口
A4 视觉基线
A4 axe
```

## 非目标

- 不把全部 187 个测试迁移到 Playwright；
- 不追求 100% 视觉像素一致；
- 不测试所有事件文本；
- 不把 E2E 当平衡测试；
- 不用 E2E 代替主观体验。

## 最终方案

```text
Vitest：逻辑/内容/平衡
Playwright：关键用户路径/布局/存档
状态桥：快速读取和构造状态
人工：只看截图和主观判断
```

这是性价比和效果最平衡的方案。
