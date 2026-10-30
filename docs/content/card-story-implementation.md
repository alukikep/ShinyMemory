# 实现计划：卡面剧情（试点 · 巡）

> 状态：**已实现**（三次提交：`51b78f2` 引擎 → `16d878f` 日程与拦截 → 内容与锚点）。
> 规则依据：[playbook.md](playbook.md) §4.8。
>
> 实现时发现并修掉的两个问题：
> 1. **剧情日最初只挡排班，没挡触发**——第 6 天照样能点第二步。现在 `evaluateStoryChain` 也用剧情日做等待判定。
> 2. **cadence 默认 1 会强行加一天**，改掉了原有的"同日推进"行为（`complexQuest` 测试抓到）。现在 cadence 只在显式 >1 时作为间隔。

---

## 0. 这一轮做什么 / 不做什么

**做**

- 一个引擎能力：剧情日（`cadenceDays`）+ 接活策略（`workPolicy`）
- 一章内容：巡【夏に恋するピチカート！】→「泳装的颜色」，4 步
- 一套验收：单测 + E2E + 锚点校验

**不做**

- 其他偶像的卡面（放量前先验证）
- S 卡（无选项，排除）
- 剧情回看 / 收藏库
- 章与章之间的解锁链（第二章等这章验证完再说）

---

## 1. 选材

```text
卡面：八宮めぐる【夏に恋するピチカート！】
文件：data/story/八宮めぐる/【夏に恋するピチカート！】八宮めぐる/カラフルサマー.csv
原文：62 行，含一次三选一并合流
```

为什么是它：P 卡自带选项、场景独立（不依赖别的卡）、体量适中、巡"和朋友逛街很开心"的特质原文就有。

---

## 2. 引擎改动（先做，约 1 天）

### 2.1 类型（`types.ts`）

```ts
type StoryChainDef = {
  // 已有字段不变
  /** 剧情日多久出现一次。默认 1（每天）。 */
  cadenceDays?: number;
  /** 章进行期间的接活策略。默认 'open'。 */
  workPolicy?: 'open' | 'blocked';
};

type StoryChainState = {
  chainId: string;
  stepIndex: number;
  nextEligibleDay?: number;
  /** 新增：上一步完成的日期，剧情日由它推算（可选，不迁移旧档）。 */
  lastStepDay?: number;
  completed?: boolean;
};
```

### 2.2 剧情日（`sim.ts`，纯函数）

```ts
/** 这条链的下一个剧情日；未开始或已完成时返回 undefined。 */
export function storyDayFor(state: GameState, chain: StoryChainDef): number | undefined
```

算法（**不写状态，纯推算**）：

```text
未开始（没有 storyChains[id]）或已完成        → undefined
first = lastStepDay + max(nextStepDelayDays, cadenceDays)
today 已过 first                              → first += cadenceDays × ceil((today - first) / cadenceDays)
返回 first
```

**关键性质**：剧情日只随时间前进，**不因未来的预订移动**。这样"提前订工作"没法把剧情日挤走。

### 2.3 日程表派生 slot（`schedule.ts` + `scene.ts`）

```ts
buildScheduleView(...) 里插入：
{ source: 'story', mode: 'replace-day', label: '剧情：泳装的颜色', fromMinute, toMinute }
```

只在该偶像的剧情日显示。**不写进 `scheduleOverrides`**，所以不需要存档迁移，剧情结束自动消失。

### 2.4 接活拦截（`scene.ts` + `sim.ts`）

| 情况 | 行为 |
|---|---|
| `workPolicy: 'blocked'` 且该章进行中 | 该偶像**完全不给档期**，提示「剧情进行中，暂不接新工作」 |
| `workPolicy: 'open'` | 只挡剧情日那一天 |
| 已订好的工作与剧情日相撞 | 工作优先，剧情日顺延一个周期 |

`acceptJob` 里再挡一次（防绕过），返回 `false` 而不是静默。

### 2.5 手册提示（`handbook.ts`）

进行中的链增加一行：`下一个剧情日：第 6 天 · 商业街 · 10:00–20:00`。
错过时显示：`已搁置 2 天`（不催、不惩罚，只是提醒）。

---

## 3. 内容（引擎之后，约 1.5 小时）

### 3.1 章节定义（结构，TS）

```ts
{
  id: 'meguru-swimsuit',
  idolId: 'meguru',
  title: '泳装的颜色',
  cadenceDays: 2,          // 已定：试点用 2，好测"错过顺延"
  workPolicy: 'open',
  // 触发条件：已招募 + 第 5 天后。**这张卡不要求信任。**
  revealWhen: [{ kind: 'idolStatus', idolId: 'meguru', status: 'recruited' }],
  steps: [
    { id: 'step-1', locationId: 'shopping_street', timeWindow: { 10:00, 20:00 }, actionLabel: '杂志那边约了新人特集' },
    { id: 'step-2', locationId: 'shopping_street', timeWindow: { 10:00, 20:00 }, actionLabel: '去看看泳装' },
    { id: 'step-3', locationId: 'shopping_street', timeWindow: { 10:00, 20:00 }, actionLabel: '她挑不出来了' },
    // 结束时不搬场地：玩家在哪结束就在哪，所以这一步仍写在商业街
    { id: 'step-4', locationId: 'shopping_street', timeWindow: { 10:00, 20:00 }, actionLabel: '从店里出来' },
  ],
}
```

步间 `nextStepDelayDays: 1`，最后一步 `complete: { nextStepDelayDays: 3 }`（为下一章留位）。

### 3.2 四段对话（审查台草稿，kind: dialogue）

| 步 | 内容 | 来源 | 节点数 |
|---|---|---|---|
| 1 | 邀约：杂志要拍新人特集，自带衣服 + 拍泳装 | **桥段（我们写）** | 4 |
| 2 | 逛店：翻衣架、聊起和朋友逛街 | 卡面前半（压缩） | 6 |
| 3 | 三选一 + 三分支 + 合流 | 卡面后半（原样保留 choices） | 8 |
| 4 | 落点：回程她说「下次还想一起去」 | **桥段（我们写）** | 4 |

**三个选项与效果**（都是"口味"不是"正解"，差别 ≤2 点）：

| 选项 | 效果 |
|---|---|
| 看起来精神的会不会更适合你 | 表现 +1 |
| 试试搭配吧 | 信任 +2 |
| 交给运气来吧 | 压力 −3 |

### 3.3 锚点（逐字保留）

```text
「能全部都穿到就好了——！」
「能上杂志的只有一件吧……嗯——……好难选——！」
「……这么大的尺寸应该比较适合制作人了——」
```

登记到 `src/core/content/chapterSources.ts`。

---

## 4. 验收

### 4.1 单元测试（新增 5 条）

```text
storyDayFor
  ✓ cadence 1：每天都是剧情日
  ✓ cadence 2：错过 → 顺延 2 天，不是明天
  ✓ 未来的预订不影响剧情日
接活策略
  ✓ 'blocked'：章进行期间完全不能接活
  ✓ 'open'：只挡剧情日那一天
```

### 4.2 E2E（`tests/prologue/cardChapter.spec.ts`）

```text
招募巡 → 第 5 天 14:00 商业街 → 点「杂志那边约了新人特集」
→ 第 6 天：第二步不可用（cadence 2）
→ 第 7 天：第二步可用 → 三个选项 → 选第一个 → 读完
→ 第 8 天：第三步 → 第 9 天：第四步（事务所）
→ 断言：flag 记录本章、信任增长、锚点句出现在对话里
```

### 4.3 门禁

```bash
npm run content:anchors   # 3 句锚点：语料里有、游戏里也有
npm run content:audit     # 0 错误
npm test                  # 全绿
npm run build             # 通过
```

---

## 4.4 什么进审查台，什么靠脚本

| 对象 | 审阅方式 |
|---|---|
| 4 段对话（台词、选项、结果） | **审查台**（kind: dialogue） |
| 章节链（步数、地点、时间窗、节奏、接活策略） | **脚本**：`content:anchors` 的结构校验 |
| 锚点（3 句原文） | **脚本**：两头比对 |

结构校验会查：链存不存在、每步的对话/地点是否真的接上、步数 ≥2、
以及"链 id 像卡面章但没登记锚点"这种情况。**结构不需要人审。**

### 已知问题（先记录，不解决）

**卡面地点与地图的对应关系。**

卡面里出现的地方，有的在地图上有（商业街、公园、写真棚），有的没有。
这个试点章节全在商业街，不受影响。

但放量后会遇到两类麻烦：

1. **地点缺失**：卡面发生在"海边""外地取景""某家店"，地图上没有对应地点。
   可选方向：按卡面扩充地点列表（地图本来就还不完整）。
2. **整章都在外地**：这类没法靠"加一个地点"解决（出了城市范围）。

**现在不解决**，只记录在 [playbook §10 已知缺口](playbook.md)。
到时候可能要引入"临时场景"（只在该章出现、不进地图）这种机制。

## 5. 交付顺序（分三次提交，方便你分段审）

| # | 提交 | 内容 | 你能看到什么 |
|---|---|---|---|
| 1 | `feat: story days` | 引擎：类型 + `storyDayFor` + 单测 | 全是代码和测试，无内容 |
| 2 | `feat: story day in schedule` | 日程派生 slot + 接活拦截 + 手册提示 | 可以在游戏里看到"剧情日" |
| 3 | `content: meguru card chapter` | 4 条草稿 + 章节链 + 锚点 | 审查台出现 4 条待审 |

**第 1、2 步不需要你审内容**，只有第 3 步进审查台。

---

## 6. 风险

| 风险 | 影响 | 应对 |
|---|---|---|
| 压缩过头，读起来不像原作 | 这一章白做 | 锚点 3 句 + 你自己读一遍 |
| 宽时间窗（10:00–20:00）导致"随时能演"缺少仪式感 | 体验偏平 | 试点先接受，看反馈再收窄 |
| `cadenceDays: 2` 让玩家以为卡住了 | 玩家体验 | 手册显示"下一个剧情日"，明确告诉他 |
| 派生 slot 和工作的 override 显示冲突 | 日程表画错 | 单测覆盖同一天两种情况 |

---

## 7. 成功标准（做完要能回答）

1. 这一章读起来像"一章剧情"，还是"一段被压过的卡面"？
2. 剧情日的存在感够不够？（玩家会不会根本注意不到那天该去哪）
3. `cadenceDays: 2` 是"有节奏"还是"在拖延"？
4. 三选一的差别能不能感知到？

**只要第 1 条答不上"像剧情"，就不放量。**
