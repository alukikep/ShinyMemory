# 制作人手册 实施计划

> **给执行者：** 按任务顺序做，每个任务先写失败测试。步骤用 `- [ ]` 跟踪。

**Goal:** 让玩家能看见"哪条线在等、等什么、差多少"，同时把剧情链接到可以随手加新任务的程度。

**Architecture:** 手册条目不落库，全部由 `storyChains` + `CONTENT_INDEX` 派生（`buildHandbook` 纯函数）。任务能力靠给 `StoryChainDef` / `StoryChainStep` 加三个可选字段、给 `Condition` 补三个变体、把 `getEligibleStory` 换成返回全部候选来实现。

**Tech Stack:** TypeScript / React 19 / Zustand / Vitest / Playwright

**Spec:** [plan-producer-handbook.md](plan-producer-handbook.md)

## Global Constraints

- 不新增 `GameState` 字段，`SAVE_VERSION` 保持 14，`CONTENT_EPOCH` 保持 3。
- 所有新增字段必须可选，现有内容不改也能编译通过。
- 文案：第一人称手记，短句、无主语、无句末标点；禁止“任务：…”“前往…”式语言。
- `describeCondition` 与 `checkCondition` 必须吃同一个 `Condition` 对象。
- 任何原因文案都不能出现处于 `unknown` 状态的偶像名。

## Review Focus

- 未知偶像泄露：`unknown` 状态的偶像名不能出现在条目或原因里。
- 两轴矛盾：手册说“现在可以去”而地点页没有行动（或反过来）。
- 多链同地点：第二条链不能静默消失。
- 原因漂移：钱已经够了却还显示“还差 ¥X”。
- 空状态：没有进行中条目时面板不能报错或显示空白框。

---

### Task 1: 补三个 `Condition`

**Files:**
- Modify: `src/core/types.ts`（`Condition` 联合）
- Modify: `src/core/sim.ts`（`checkCondition`）
- Test: `src/core/condition.test.ts`（新建）

**Interfaces:**
- Produces: `{ kind: 'moneyAtLeast'; value: number }`、`{ kind: 'idolStatus'; idolId?: string; status: IdolStatus }`、`{ kind: 'hasItem'; itemId: string; count?: number }`

- [ ] **Step 1: 写失败测试**

```ts
// moneyAtLeast：钱够为 true
expect(checkCondition({ kind: 'moneyAtLeast', value: 5000 }, rich)).toBe(true);
expect(checkCondition({ kind: 'moneyAtLeast', value: 5000 }, poor)).toBe(false);

// idolStatus：recruited 满足 known 的要求，unknown 不满足
expect(checkCondition({ kind: 'idolStatus', idolId: 'mano', status: 'known' }, s)).toBe(true);
expect(checkCondition({ kind: 'idolStatus', idolId: 'hiori', status: 'known' }, s)).toBe(false);
// 省略 idolId 时取 ctx.idolId
expect(checkCondition({ kind: 'idolStatus', status: 'recruited' }, s, { idolId: 'mano' })).toBe(true);

// hasItem：默认要求 1 个
expect(checkCondition({ kind: 'hasItem', itemId: 'gift' }, s)).toBe(false);
expect(checkCondition({ kind: 'hasItem', itemId: 'gift', count: 2 }, s)).toBe(false);
```

- [ ] **Step 2: 跑测试确认失败**（类型不存在 → 编译失败）

- [ ] **Step 3: 实现**

`types.ts` 的 `Condition` 联合追加三个成员。

`sim.ts` 的 `checkCondition` 追加：

```ts
case 'moneyAtLeast':
  return state.money >= condition.value;
case 'idolStatus': {
  const idolId = condition.idolId ?? ctx.idolId ?? state.selectedIdolId;
  const current = state.idols[idolId]?.status;
  if (!current) return false;
  const rank = { unknown: 0, known: 1, recruited: 2 } as const;
  return rank[current] >= rank[condition.status];
}
case 'hasItem':
  return (state.inventory[condition.itemId] ?? 0) >= (condition.count ?? 1);
```

- [ ] **Step 4: 跑测试确认通过**
- [ ] **Step 5: 提交** `feat: add moneyAtLeast / idolStatus / hasItem conditions`

---

### Task 2: `describeCondition`

**Files:**
- Create: `src/core/handbook.ts`
- Test: `src/core/handbook.test.ts`（新建）

**Interfaces:**
- Consumes: Task 1 的三个条件、`attributeLabel`、`CONTENT_INDEX`、`state.money` / `state.inventory`
- Produces: `describeCondition(condition: Condition, state: GameState, ctx?: CheckContext): string | undefined`

- [ ] **Step 1: 写失败测试**

```ts
// 差额，不是总额
state.money = 3800;
expect(describeCondition({ kind: 'moneyAtLeast', value: 5000 }, state)).toBe('还差 ¥1,200');

// 物品用显示名
expect(describeCondition({ kind: 'hasItem', itemId: 'birthday_gift' }, state)).toBe('还缺 生日礼物 ×1');

// 属性用中文名
expect(describeCondition({ kind: 'attributeAtLeast', ref: 'vocal', rank: 'D' }, state)).toBe('歌唱还得练到 D');

// 偶像状态分两种说法
expect(describeCondition({ kind: 'idolStatus', idolId: 'hiori', status: 'known' }, state)).toBe('还得先正式认识灯织');
expect(describeCondition({ kind: 'idolStatus', idolId: 'hiori', status: 'recruited' }, state)).toBe('得先让灯织加入');

// 未知名偶像：不能出现名字
expect(describeCondition({ kind: 'idolStatus', idolId: 'meguru', status: 'known' }, state)).toBeUndefined();

// 不猜语义
expect(describeCondition({ kind: 'flag', key: 'x' }, state)).toBeUndefined();
expect(describeCondition({ kind: 'sharedStatAtLeast', stat: 'stress', value: 80 }, state)).toBeUndefined();
```

- [ ] **Step 2: 跑测试确认失败**

- [ ] **Step 3: 实现**

```ts
export function describeCondition(
  condition: Condition,
  state: GameState,
  ctx: CheckContext = {},
): string | undefined
```

分支表严格按 spec 2.5。`unknown` 偶像返回 `undefined`。钱用 `toLocaleString('zh-CN')`。

- [ ] **Step 4: 跑测试确认通过**
- [ ] **Step 5: 提交** `feat: describe condition gaps in the producer handbook`

---

### Task 3: `buildHandbook` 投影

**Files:**
- Modify: `src/core/handbook.ts`
- Test: `src/core/handbook.test.ts`

**Interfaces:**
- Consumes: `CONTENT_INDEX.storyChains`、`state.storyChains`、`checkCondition`、`describeCondition`、`getDay` / `getMinuteOfDay` / `formatClock`
- Produces:

```ts
export type HandbookStatus = 'waiting' | 'blocked' | 'off-hours' | 'available' | 'done';
export type HandbookEntryView = {
  id: string; title: string; idolId: string; idolName: string;
  status: HandbookStatus; locationName: string; timeWindowText: string;
  reason?: string; earliestDay?: number; daysLeft?: number;
  steps: { label: string; done: boolean; current: boolean }[];
};
export type HandbookView = { active: HandbookEntryView[]; archive: HandbookEntryView[] };
export function buildHandbook(state: GameState): HandbookView;
```

- [ ] **Step 1: 写失败测试**（fixture 内容，`hiori-encounter` 两步链）

```ts
// 未相遇：零条目
expect(buildHandbook(fresh).active).toHaveLength(0);

// 走完第一步：一条进行中，waiting，daysLeft = 2
const after = finishFirstStep();
expect(buildHandbook(after).active[0]).toMatchObject({
  status: 'waiting', daysLeft: 2, locationName: '公园',
});

// 走到第 3 天窗内：available
expect(buildHandbook(day3Noon).active[0]?.status).toBe('available');

// 窗外的同一天：off-hours
expect(buildHandbook(day3Night).active[0]?.status).toBe('off-hours');

// 第二步完成：进归档，active 空
expect(buildHandbook(done).active).toHaveLength(0);
expect(buildHandbook(done).archive).toHaveLength(1);

// when 不满足：blocked + 具体原因
expect(buildHandbook(blocked).active[0]).toMatchObject({
  status: 'blocked', reason: '还差 ¥1,200',
});

// completed 的链不占进行中
```

- [ ] **Step 2: 跑测试确认失败**

- [ ] **Step 3: 实现**

按 spec 2.2 的六步顺序短路。可见性：`state.storyChains[chain.id]` 存在 ∨ `chain.revealWhen` 全满足（`revealWhen` 在 Task 5 才有类型，本任务先只判前者，用可选链避开）。

排序：`available` → `waiting`（`daysLeft` 升序）→ `off-hours` → `blocked`，同档按 `priority` 降序。

- [ ] **Step 4: 跑测试确认通过**
- [ ] **Step 5: 提交** `feat: project story chains into handbook entries`

---

### Task 4: 手册面板

**Files:**
- Create: `src/ui/components/HandbookPanel.tsx`
- Modify: `src/App.tsx`（状态 + 侧栏项）、`src/index.css`
- Test: `tests/acceptance/handbook.spec.ts`（新建 Playwright）

**Interfaces:**
- Consumes: `buildHandbook(state)`
- Produces: `<HandbookPanel view={HandbookView} onClose={() => void} />`

- [ ] **Step 1: 写失败测试**

```ts
// 侧栏有「手册」，带进行中条数
await expect(page.getByRole('button', { name: /手册/ })).toBeVisible();
// 打开后能看到进行中条目与归档区
await page.getByRole('button', { name: /手册/ }).click();
await expect(page.getByRole('dialog', { name: '手册' })).toBeVisible();
```

- [ ] **Step 2: 跑测试确认失败**

- [ ] **Step 3: 实现**

面板套现有 `roster-backdrop` + `roster-panel` + `useDialogFocus` 模式（见 `SavePanel.tsx`）。侧栏项放在「制作人」之后，右侧数字为 `view.active.length`，为 0 时不显示。

- [ ] **Step 4: 跑测试确认通过**
- [ ] **Step 5: 提交** `feat: add the producer handbook panel`

---

### Task 5: 剧情链字段 + 多链并存

**Files:**
- Modify: `src/core/types.ts`、`src/core/sim.ts:834-882`、`src/core/scene.ts:306-321`
- Test: `src/core/storyChain.test.ts`

**Interfaces:**
- Produces: `StoryChainDef.title?` / `revealWhen?`、`StoryChainStep.when?` / `effects?`、`getEligibleStories(state): StoryChainEntry[]`

- [ ] **Step 1: 写失败测试**

```ts
// 两条同地点链同时出现
expect(getEligibleStories(atPark())).toHaveLength(2);
// 按 priority 降序
expect(scene.actions.map(a => a.id)).toContain('story:hiori-encounter');
expect(scene.actions.map(a => a.id)).toContain('story:meguru-encounter');
// when 不满足时链不可触发
expect(getEligibleStories(poor)).toHaveLength(0);
// effects 只在完成时结算一次
expect(afterFinish.money).toBe(before.money + 1000);
```

- [ ] **Step 2: 跑测试确认失败**

- [ ] **Step 3: 实现**

- `getEligibleStories` 返回全部（按 `priority` 降序），`getEligibleStory` 保留为取首项（兼容现有调用）。
- `startStory` 改成在数组里查 id。
- `buildPlan` 把数组全部推成行动。
- `finishDialogue` 在状态推进后 `applyEffects(next, step.effects, { idolId: chain.idolId })`。
- 改写 `storyChain.test.ts` 里「uses story priority」那条：从“只有一条”改成“两条都在，顺序按 priority”。

- [ ] **Step 4: 跑测试确认通过**
- [ ] **Step 5: 提交** `feat: conditional multi-chain story steps`

---

### Task 6: 内容落地

**Files:**
- Modify: `src/core/content/storyChains.ts`（`mano-encounter` 补 `title`）
- Modify: `src/core/content-fixture/storyChains.ts`（补一条带 `when` / `effects` / `revealWhen` 的链）

- [ ] **Step 1: 加内容**，`title: '公园的歌声'`；fixture 链用 `when: [{ kind: 'moneyAtLeast', value: 5000 }]` + `effects: [{ kind: 'money', delta: 1000 }]`
- [ ] **Step 2: 跑全量验证**

```text
npm test
npm run content:audit
npm run build
npm run build:fixture
npm run acceptance
npm run acceptance:prologue
```

- [ ] **Step 3: 提交** `content: name the mano encounter thread`

---

### Task 7: 收尾

- [ ] 更新 `plan-producer-handbook.md`：`buildHandbook` 返回 `HandbookView`；状态由「待确认」改「已实施」
- [ ] 更新 `roadmap.md`：把 P1 手册标为已完成
- [ ] 提交 `docs: mark the producer handbook shipped`
