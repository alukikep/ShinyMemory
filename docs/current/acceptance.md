# 自动验收

> 当前有效 · 2026-10-28

## 命令

| 命令 | 内容 | 构建 |
|---|---|---|
| `npm test` | Vitest 全量（单元 + 集成 + 内容结构校验） | 无 |
| `npm run content:validate` | 内容结构校验 + 内容体检 + 剧情引用校验 | 无 |
| `npm run content:audit` | 只跑内容体检 | 无 |
| `npm run acceptance` | `npm test` + fixture 构建 + 引擎 E2E + 内容 E2E | fixture |
| `npm run acceptance:prologue` | 正式序章 E2E | production |
| `npm run acceptance:review` | 内容审查页 E2E | production |
| `npm run build` / `build:fixture` | 类型检查 + 内容校验 + 打包 | — |

当前通过量：

```text
Vitest            283 passed
内容结构/体检      4 passed
引擎 E2E          19 passed
内容 E2E           3 passed
正式序章 E2E        1 passed
审查 E2E            2 passed
内容体检            0 错误 0 警告
```

## 测试文件

```text
tests/acceptance/
  smoke.spec.ts        首日加载、无 console error
  job.spec.ts          接工作 → 参与/不参与 → 报酬与日程恢复
  schedule.spec.ts     七天窗口、跨天移动
  shop.spec.ts         购买 → 背包 → 赠送
  save.spec.ts         多槽存档、导出/导入、移动端可达
  producer.spec.ts     制作人面板
  equipment.spec.ts    发放饰品 → 装备 → 卸下
  handbook.spec.ts     手册空状态、相遇后的进行中条目
  debug.spec.ts        剧情链调试表（地点不对 / 可以触发）
  responsive.spec.ts   四档视口布局
tests/content/
  hiori.spec.ts        未知 → 认识 → 招募全流程 + 窄屏对话布局
  meguru.spec.ts       第二条链的解锁流程
tests/prologue/
  mano.spec.ts         事务所序章 → 两次公园相遇 → 招募
tests/review/
  review.spec.ts       草稿 → 批注 → 审批
```

## 两套构建

E2E 跑在**构建产物**上（`vite preview`），不是 dev server，所以改完代码必须重新构建：

- 引擎与内容验收用 **fixture 内容包**（真乃 / 灯织 / 巡 + 测试用事件），`build:fixture`。
- 正式序章与审查验收用 **production 内容包**（只有真乃），`build`。

`npm run acceptance` 已经包含构建；单独跑某个 spec 时要注意先构建对应模式。

## 状态桥

只在 `?debug=1` 挂载：

```ts
window.__SHINY_MEMORY__ = {
  getState(): GameState;
  dispatch(command: ActionCommand): void;
  jumpTo(day: number, minuteOfDay: number, locationId?: string): void;
  reset(seed?: number): void;
};
```

用途：跳天、直接读 `storyChains` / `scheduleOverrides`、按 command 驱动流程，避免靠点击睡好几天。

约定：

- 桥不是安全边界，只用于单机调试；
- 不把内部状态渲染给正常玩家；
- 写操作只在 debug 查询下存在。

## 编写约定

- 优先 `getByRole`，关键按钮给稳定的 `aria-label`；少依赖 CSS class。
- 断言玩家可见状态时**限定容器**（`.roster-panel`、`.schedule-panel`），否则调试面板里的开发信息会污染断言。
- 关键流程不要依赖随机事件；需要确定性就固定 seed 或直接构造状态。
- 多个 `getByText` 命中时用 `{ exact: true }`。
- 视频录制关闭（当前环境缺 Playwright ffmpeg），失败产物是 trace + 截图 + HTML 报告。

## 视觉效果

不做全站像素对比。稳定页面可以用 `toHaveScreenshot` 加 1% 容差，动态日志和随机事件不进视觉基线。

## 历史

验收方案的技术选型与早期拆分记录在 [archive/acceptance-plan.md](../archive/acceptance-plan.md)。
