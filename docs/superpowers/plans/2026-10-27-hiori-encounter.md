# 灯织相遇 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现“灯织第一次在公园相遇 → 两天后第二次相遇 → 招募”的完整垂直切片，并验证对话、剧情链、偶像状态、存档迁移和现有系统回归。

**Architecture:** 在 `GameState` 增加偶像生命周期、对话节点和剧情链状态。对话使用独立 overlay，不把长对话拆成多个事件。真乃初始 recruited，灯织初始 unknown；公园相遇是剧情专用 placement，不写入 `ActorDef.schedule`。旧存档迁移时所有已有偶像设为 recruited。

**Tech Stack:** TypeScript, React 19, Zustand, Vite, Vitest, Playwright, localStorage save v12.

**Spec:** `docs/superpowers/specs/2026-10-27-hiori-encounter-design.md`

## Global Constraints

- 不增加结局、周付款、债务或事务所考核。
- 对话不消耗游戏时间。
- 真乃初始已招募；灯织初始未知。
- 灯织的常规日程来源是 `ActorDef.schedule`；公园相遇不写入常规日程。
- known 阶段不可训练、工作、送礼物，也不显示日程。
- 招募不自动切换 `activeIdolId`。
- 旧存档迁移时所有已有偶像设为 recruited。
- 剧情/对话内容先静态 TS，不进入审查页。
- 每个任务结束必须跑对应测试，并提交一个独立 commit。

## Review Focus

- 旧 v11 存档加载后灯织不能消失；迁移后所有旧偶像应为 recruited。
- unknown/known 灯织不能通过名册、日程、场景 actor、训练入口或背包赠送泄露。
- 快速双击、无效节点、对话中途读档不能重复加信任或重复完成剧情链。
- 第二次相遇必须满足“完成日 + 2 天”，但跳过更多天仍可触发，不能错过。
- 招募后 `activeIdolId` 仍是真乃；灯织可在 `ActorDef.schedule` 的正常地点被找到和训练。

---

## Task 1: 偶像生命周期与 v12 存档迁移

**Files:**
- Modify: `src/core/types.ts`
- Modify: `src/core/contentIndex.ts`
- Modify: `src/core/sim.ts`
- Modify: `src/save/version.ts`
- Modify: `src/save/save.ts`
- Test: `src/core/idolStatus.test.ts` (create)
- Test: `src/save/localStorageRepository.test.ts`

**Interfaces:**
- Produces:
  - `type IdolStatus = 'unknown' | 'known' | 'recruited'`
  - `IdolState.status: IdolStatus`
  - `IdolState.knownAt?: number`
  - `IdolState.recruitedAt?: number`
  - `isIdolRecruited(state: GameState, idolId: string): boolean`
  - `StoryChainState` typed state container
  - `GameState.storyChains: Record<string, StoryChainState>`
  - `GameState.pendingDialogueId?`, `dialogueNodeId?`, `dialogueTargetIdolId?`
  - `createInitialIdolStates()` returns 真乃 recruited、灯织 unknown
  - `SAVE_VERSION = 12`

- [ ] **Step 1: Write failing tests**

Create `src/core/idolStatus.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createInitialIdolStates } from './contentIndex';
import { newGame } from './sim';

describe('idol status', () => {
  it('starts Mano recruited and Hiori unknown', () => {
    const state = newGame(1);
    expect(state.idols.mano?.status).toBe('recruited');
    expect(state.idols.hiori?.status).toBe('unknown');
  });

  it('creates the same initial statuses', () => {
    const idols = createInitialIdolStates();
    expect(idols.mano?.status).toBe('recruited');
    expect(idols.hiori?.status).toBe('unknown');
  });
});
```

Add to `src/save/localStorageRepository.test.ts`:

```ts
it('migrates a v11 save by marking all existing idols recruited', () => {
  const storage = new MemoryStorage();
  const state = newGame(1) as unknown as Record<string, unknown>;
  delete state.storyChains;
  delete state.pendingDialogueId;
  delete state.dialogueNodeId;
  delete state.dialogueTargetIdolId;
  const idols = state.idols as Record<string, Record<string, unknown>>;
  delete idols.mano.status;
  delete idols.hiori.status;
  storage.setItem(
    SAVE_KEY,
    JSON.stringify({
      schemaVersion: 11,
      gameVersion: '0.12.0',
      createdAt: '2026-10-27T00:00:00.000Z',
      state,
    }),
  );

  const loaded = new LocalStorageRepository(storage).load();
  expect(loaded?.schemaVersion).toBe(12);
  expect(loaded?.state.idols.mano?.status).toBe('recruited');
  expect(loaded?.state.idols.hiori?.status).toBe('recruited');
  expect(loaded?.state.storyChains).toEqual({});
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/core/idolStatus.test.ts src/save/localStorageRepository.test.ts -t "status|v11"`

Expected: FAIL because `status` and `SAVE_VERSION = 12` do not exist.

- [ ] **Step 3: Implement**

In `src/core/types.ts`:

```ts
export type IdolStatus = 'unknown' | 'known' | 'recruited';

export type IdolState = {
  id: string;
  stats: IdolStats;
  status: IdolStatus;
  knownAt?: number;
  recruitedAt?: number;
};

export type StoryChainState = {
  chainId: string;
  stepIndex: number;
  nextEligibleDay?: number;
  completed?: boolean;
};
```

Add to `GameState`:

```ts
storyChains: Record<string, StoryChainState>;
pendingDialogueId?: string;
dialogueNodeId?: string;
dialogueTargetIdolId?: string;
```

In `src/core/sim.ts` `newGame` add:

```ts
storyChains: {},
```

In `src/core/contentIndex.ts` `createInitialIdolStates()` set:

```ts
const startingIdol = IDOLS.find((idol) => idol.isStart) ?? IDOLS[0];
status: idol.id === startingIdol?.id ? 'recruited' : 'unknown',
```

In `src/core/sim.ts` export:

```ts
export function isIdolRecruited(
  state: GameState,
  idolId: string,
): boolean {
  return state.idols[idolId]?.status === 'recruited';
}
```

In `src/save/version.ts`:

```ts
export const SAVE_VERSION = 12;
```

In `src/save/save.ts` add:

```ts
if (next.schemaVersion === 11) {
  const state = next.state as GameState;
  for (const idol of Object.values(state.idols ?? {})) {
    idol.status = 'recruited';
    idol.recruitedAt = idol.recruitedAt ?? Date.now();
  }
  state.storyChains = {};
  state.pendingDialogueId = undefined;
  state.dialogueNodeId = undefined;
  state.dialogueTargetIdolId = undefined;
  next.schemaVersion = 12;
  next.gameVersion = GAME_VERSION;
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/core/idolStatus.test.ts src/save/localStorageRepository.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/core/types.ts src/core/contentIndex.ts src/core/sim.ts src/save/version.ts src/save/save.ts src/core/idolStatus.test.ts src/save/localStorageRepository.test.ts
git commit -m "feat: add idol recruitment status and save migration"
```

---

## Task 2: 过滤未招募偶像

**Files:**
- Modify: `src/core/sim.ts`
- Modify: `src/core/scene.ts`
- Modify: `src/ui/components/IdolRoster.tsx`
- Modify: `src/ui/components/IdolSchedule.tsx`
- Modify: `src/ui/components/BackpackModal.tsx`
- Test: `src/core/idolStatus.test.ts`
- Test: `src/ui/render.test.tsx`

**Interfaces:**
- Consumes: `IdolState.status`, `isIdolRecruited`.
- Produces:
  - `presentActors` excludes non-recruited idol actors.
  - `enterIdol`, `train`, `work` reject non-recruited idols.
  - Roster shows known + recruited; known has no stats/schedule.
  - Schedule and gift targets only recruited.

- [ ] **Step 1: Write failing tests**

Add to `src/core/idolStatus.test.ts`:

```ts
it('does not expose Hiori as a present actor before recruitment', () => {
  const state = newGame(1);
  state.clock.absoluteMinutes = 12 * 60;
  state.locationId = 'park';
  expect(presentActors(state).some((actor) => actor.id === 'hiori')).toBe(false);
});

it('rejects entering an unknown idol', () => {
  const state = newGame(1);
  state.clock.absoluteMinutes = 12 * 60;
  state.locationId = 'park';
  expect(enterIdol(state, 'hiori')).toBe(state);
});
```

Add to `src/ui/render.test.tsx`:

```tsx
it('hides unknown idols from the roster', () => {
  const html = renderToStaticMarkup(
    <IdolRoster state={newGame(1)} onClose={() => {}} />,
  );
  expect(html).toContain('樱木真乃');
  expect(html).not.toContain('风野灯织');
});

it('shows a known idol without training or schedule', () => {
  const state = newGame(1);
  state.idols.hiori!.status = 'known';
  const roster = renderToStaticMarkup(
    <IdolRoster state={state} onClose={() => {}} />,
  );
  expect(roster).toContain('风野灯织');
  expect(roster).toContain('尚未招募');
  expect(roster).not.toContain('训练');
});

it('hides known/unknown idols from the schedule', () => {
  const state = newGame(1);
  state.idols.hiori!.status = 'known';
  const schedule = renderToStaticMarkup(
    <IdolSchedule state={state} onClose={() => {}} />,
  );
  expect(schedule).toContain('樱木真乃');
  expect(schedule).not.toContain('风野灯织');
});
```

- [ ] **Step 2: Run tests**

Run: `npx vitest run src/core/idolStatus.test.ts src/ui/render.test.tsx`

Expected: FAIL because Hiori still appears.

- [ ] **Step 3: Implement**

In `src/core/sim.ts` `presentActors` filter:

```ts
if (actor.role === 'idol' && !isIdolRecruited(state, actor.id)) {
  return false;
}
```

In `enterIdol`, `train`, `work` add:

```ts
if (!isIdolRecruited(state, idolId)) return state;
```

In `IdolRoster.tsx`:

```tsx
const idols = Object.values(state.idols).filter(
  (idol) => idol.status !== 'unknown',
);
```

Known branch: show avatar/name/profile and `尚未招募`; do not render `RankRow`, location, or schedule.

In `IdolSchedule.tsx`:

```tsx
Object.values(state.idols).filter((idol) => idol.status === 'recruited')
```

In `BackpackModal.tsx`:

```tsx
const idols = Object.values(state.idols).filter(
  (idol) => idol.status === 'recruited',
);
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/core/idolStatus.test.ts src/ui/render.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/core/sim.ts src/core/scene.ts src/ui/components/IdolRoster.tsx src/ui/components/IdolSchedule.tsx src/ui/components/BackpackModal.tsx src/core/idolStatus.test.ts src/ui/render.test.tsx
git commit -m "feat: hide unrecognized idols from roster and schedule"
```

---

## Task 3: 对话模型、Hiori 内容与内容索引

**Files:**
- Modify: `src/core/types.ts`
- Modify: `src/core/content/index.ts`
- Modify: `src/core/contentIndex.ts`
- Create: `src/core/content/dialogues/hiori.ts`
- Create: `src/core/content/storyChains.ts`
- Test: `src/core/content.test.ts`
- Test: `src/core/dialogue.test.ts`

**Interfaces:**
- Produces:
  - `DialogueNode`, `DialogueChoice`, `DialogueDef`
  - `StoryChainStep`, `StoryChainDef`（`StoryChainState` 已在 Task 1 定义）
  - `CONTENT_INDEX.dialogues: Map<string, DialogueDef>`
  - `CONTENT_INDEX.storyChains: Map<string, StoryChainDef>`
- Content IDs:
  - `dialogue.hiori.first`
  - `dialogue.hiori.second`
  - `hiori-encounter`

- [ ] **Step 1: Write failing tests**

In `src/core/content.test.ts`:

```ts
it('has valid Hiori dialogue and story chain references', () => {
  const first = CONTENT_INDEX.dialogues.get('dialogue.hiori.first');
  const second = CONTENT_INDEX.dialogues.get('dialogue.hiori.second');
  expect(first).toBeDefined();
  expect(second).toBeDefined();
  expect(first!.nodes[first!.startNodeId]).toBeDefined();

  for (const dialogue of [first!, second!]) {
    for (const node of Object.values(dialogue.nodes)) {
      if (node.nextNodeId) {
        expect(dialogue.nodes[node.nextNodeId], node.id).toBeDefined();
      }
      for (const choice of node.choices ?? []) {
        expect(dialogue.nodes[choice.nextNodeId], node.id).toBeDefined();
      }
    }
    expect(Object.keys(dialogue.nodes).length).toBeGreaterThanOrEqual(8);
  }

  const chain = CONTENT_INDEX.storyChains.get('hiori-encounter');
  expect(chain?.steps).toHaveLength(2);
  expect(chain?.steps[0]?.dialogueId).toBe('dialogue.hiori.first');
  expect(chain?.steps[1]?.dialogueId).toBe('dialogue.hiori.second');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/core/content.test.ts -t "Hiori"`

Expected: FAIL because dialogues/storyChains are missing.

- [ ] **Step 3: Implement model**

Add to `src/core/types.ts`:

```ts
export type DialogueChoice = {
  label: string;
  nextNodeId: string;
  effects?: Effect[];
  requires?: Condition[];
};

export type DialogueNode = {
  id: string;
  speakerId?: string;
  text: string;
  nextNodeId?: string;
  choices?: DialogueChoice[];
  effects?: Effect[];
};

export type DialogueDef = {
  id: string;
  idolId: string;
  startNodeId: string;
  nodes: Record<string, DialogueNode>;
};

export type StoryChainStep = {
  id: string;
  locationId: string;
  timeWindow?: TimeWindow;
  minDaysAfterPrevious?: number;
  dialogueId: string;
  actionLabel: string;
  complete?: {
    status?: IdolStatus;
    nextStepDelayDays?: number;
  };
};

export type StoryChainDef = {
  id: string;
  idolId: string;
  steps: StoryChainStep[];
};
```

`StoryChainState` 和 `GameState.storyChains` 已在 Task 1 加过，本任务不再重复定义。

Create `hiori.ts` with 18–22 nodes. Minimum shape:

```ts
export const hioriFirst: DialogueDef = {
  id: 'dialogue.hiori.first',
  idolId: 'hiori',
  startNodeId: 'n01',
  nodes: {
    n01: { id: 'n01', text: '公园的长椅上，灯织戴着耳机。', nextNodeId: 'n02' },
    n02: { id: 'n02', speakerId: 'hiori', text: '你站在这里很久了。', nextNodeId: 'n03' },
    n03: {
      id: 'n03',
      speakerId: 'hiori',
      text: '……有事吗？',
      choices: [
        {
          label: '帮你捡起被风吹散的纸',
          nextNodeId: 'n04a',
          effects: [{ kind: 'idolExp', attribute: 'trust', tier: 1 }],
        },
        {
          label: '只是路过',
          nextNodeId: 'n04b',
        },
        {
          label: '你在写歌吗？',
          nextNodeId: 'n04c',
        },
      ],
    },
    // n04a/n04b/n04c converge to n05...
    n08: { id: 'n08', text: '她收起笔记本，看了你一眼。' },
  },
};
```

Second dialogue similarly; the exact 18–22 nodes are authored from the spec's §5.

Create `storyChains.ts`:

```ts
export const hioriEncounter: StoryChainDef = {
  id: 'hiori-encounter',
  idolId: 'hiori',
  steps: [
    {
      id: 'hiori-park-1',
      locationId: 'park',
      timeWindow: { fromMinute: 600, toMinute: 1080 },
      dialogueId: 'dialogue.hiori.first',
      actionLabel: '在长椅旁停下',
      complete: { status: 'known', nextStepDelayDays: 2 },
    },
    {
      id: 'hiori-park-2',
      locationId: 'park',
      timeWindow: { fromMinute: 600, toMinute: 1080 },
      dialogueId: 'dialogue.hiori.second',
      actionLabel: '去公园看看',
      complete: { status: 'recruited' },
    },
  ],
};
```

Register in `content/index.ts` and `contentIndex.ts` maps.

- [ ] **Step 4: Run test**

Run: `npx vitest run src/core/content.test.ts -t "Hiori"`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/core/types.ts src/core/content/index.ts src/core/contentIndex.ts src/core/content/dialogues/hiori.ts src/core/content/storyChains.ts src/core/content.test.ts
git commit -m "feat: add Hiori dialogue and story chain content"
```

---

## Task 4: 剧情链与对话命令

**Files:**
- Modify: `src/core/types.ts`
- Modify: `src/core/sim.ts`
- Modify: `src/core/scene.ts`
- Test: `src/core/storyChain.test.ts` (create)

**Interfaces:**
- Produces:
  - `getEligibleStory(state): { chain: StoryChainDef; step: StoryChainStep; stepIndex: number } | undefined`
  - `startStory(state, chainId): GameState`
  - `advanceDialogue(state): GameState`
  - `chooseDialogue(state, index): GameState`
  - `ActionCommand`: `startStory`, `dialogueAdvance`, `dialogueChoice`
- Consumes: `CONTENT_INDEX.dialogues`, `CONTENT_INDEX.storyChains`, `applyEffects`, `isIdolRecruited`.

- [ ] **Step 1: Write failing tests**

`src/core/storyChain.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { CONTENT_INDEX } from './contentIndex';
import {
  advanceDialogue,
  chooseDialogue,
  getEligibleStory,
  newGame,
  startStory,
} from './sim';

function atPark(day = 1, minute = 12 * 60) {
  const state = newGame(1);
  state.clock.absoluteMinutes = (day - 1) * 1440 + minute;
  state.locationId = 'park';
  return state;
}

function play(state: ReturnType<typeof newGame>) {
  for (let i = 0; i < 50 && state.pendingDialogueId; i += 1) {
    const dialogue = CONTENT_INDEX.dialogues.get(state.pendingDialogueId)!;
    const node = dialogue.nodes[state.dialogueNodeId!];
    state = node.choices?.length
      ? chooseDialogue(state, 0)
      : advanceDialogue(state);
  }
  return state;
}

describe('Hiori story chain', () => {
  it('offers the first step at the park', () => {
    expect(getEligibleStory(atPark())?.step.id).toBe('hiori-park-1');
  });

  it('does not offer it outside the time window', () => {
    expect(getEligibleStory(atPark(1, 9 * 60))).toBeUndefined();
  });

  it('starts the first dialogue at n01', () => {
    const next = startStory(atPark(), 'hiori-encounter');
    expect(next.pendingDialogueId).toBe('dialogue.hiori.first');
    expect(next.dialogueNodeId).toBe('n01');
    expect(next.dialogueTargetIdolId).toBe('hiori');
  });

  it('marks Hiori known and schedules the second step two days later', () => {
    const state = play(startStory(atPark(1), 'hiori-encounter'));
    expect(state.idols.hiori?.status).toBe('known');
    expect(state.storyChains['hiori-encounter']?.nextEligibleDay).toBe(3);

    const day2 = structuredClone(state);
    day2.clock.absoluteMinutes = 1440 + 12 * 60;
    day2.locationId = 'park';
    expect(getEligibleStory(day2)).toBeUndefined();

    const day3 = structuredClone(state);
    day3.clock.absoluteMinutes = 2 * 1440 + 12 * 60;
    day3.locationId = 'park';
    expect(getEligibleStory(day3)?.step.id).toBe('hiori-park-2');
  });
});
```

- [ ] **Step 2: Run test**

Run: `npx vitest run src/core/storyChain.test.ts`

Expected: FAIL because functions/commands missing.

- [ ] **Step 3: Implement**

In `src/core/sim.ts`:

```ts
export function getEligibleStory(state: GameState) {
  if (state.pendingDialogueId || state.flags.forced_rest) return undefined;
  const day = getDay(state.clock.absoluteMinutes);
  const minute = getMinuteOfDay(state.clock.absoluteMinutes);

  for (const chain of CONTENT_INDEX.storyChains.values()) {
    const chainState = state.storyChains[chain.id] ?? {
      chainId: chain.id,
      stepIndex: 0,
    };
    if (chainState.completed) continue;
    if (chainState.nextEligibleDay && day < chainState.nextEligibleDay) {
      continue;
    }
    const step = chain.steps[chainState.stepIndex];
    if (!step || step.locationId !== state.locationId) continue;
    if (
      step.timeWindow &&
      (minute < step.timeWindow.fromMinute || minute > step.timeWindow.toMinute)
    ) {
      continue;
    }
    return { chain, step, stepIndex: chainState.stepIndex };
  }
  return undefined;
}
```

Implement:

- `startStory`: require `phase === 'plan'`, matching eligible step, no pending; set `pendingDialogueId`, `dialogueNodeId = startNodeId`, `dialogueTargetIdolId`; apply initial node effects once.
- `advanceDialogue`: require pending; reject if node has choices; apply current node effects when entering (start/choice already apply next node effects); move to `nextNodeId`; if no next, finish step.
- `chooseDialogue`: require pending; validate choice/requires; apply choice effects with `{ idolId: dialogueTargetIdolId }`; move to `choice.nextNodeId`; apply next node effects; if terminal, finish.
- `finishDialogue`: apply `step.complete.status` to target idol (`knownAt`/`recruitedAt`), advance `stepIndex` or mark completed, set `nextEligibleDay = currentDay + nextStepDelayDays`, clear dialogue fields, log, return to plan.
- In `handleCommand`, if `state.pendingDialogueId`, only allow `dialogueAdvance`/`dialogueChoice`; otherwise no-op.
- In `buildPlan`, if `getEligibleStory(state)`, push an `ActionView` with `command: { type: 'startStory', chainId: chain.id }` and `label: step.actionLabel`.

- [ ] **Step 4: Run test**

Run: `npx vitest run src/core/storyChain.test.ts src/core/content.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/core/types.ts src/core/sim.ts src/core/scene.ts src/core/storyChain.test.ts
git commit -m "feat: add story chain and dialogue commands"
```

---

## Task 5: 对话 Overlay UI

**Files:**
- Create: `src/ui/components/DialogueOverlay.tsx`
- Modify: `src/App.tsx`
- Modify: `src/index.css`
- Test: `src/ui/render.test.tsx`

**Interfaces:**
- Consumes: `GameState.pendingDialogueId`, `dialogueNodeId`, `CONTENT_INDEX.dialogues`, `CONTENT_INDEX.idols`.
- Produces: overlay with speaker, text, advance, choices, keyboard support.

- [ ] **Step 1: Write failing render test**

In `src/ui/render.test.tsx`:

```tsx
it('renders dialogue text and choices', () => {
  const state = newGame(1);
  state.pendingDialogueId = 'dialogue.hiori.first';
  state.dialogueNodeId = 'n03';
  const html = renderToStaticMarkup(
    <DialogueOverlay
      state={state}
      onAdvance={() => {}}
      onChoice={() => {}}
    />,
  );
  expect(html).toContain('风野灯织');
  expect(html).toContain('帮你捡起被风吹散的纸');
});
```

- [ ] **Step 2: Run test**

Run: `npx vitest run src/ui/render.test.tsx -t "dialogue"`

Expected: FAIL because component missing.

- [ ] **Step 3: Implement**

`DialogueOverlay`:

- resolve dialogue by `pendingDialogueId`;
- resolve node;
- if `choices`, render buttons; else whole panel click / `继续` button calls `onAdvance`;
- speaker name from `CONTENT_INDEX.idols` or `actor`;
- keyboard: Enter/Space advance if no choices; Escape no-op;
- focus trap via `useDialogFocus`;
- `onChoice(index)`.

`App.tsx` render before roster/schedule:

```tsx
{state.pendingDialogueId ? (
  <DialogueOverlay
    state={state}
    onAdvance={() => act({ type: 'dialogueAdvance' })}
    onChoice={(index) => act({ type: 'dialogueChoice', index })}
  />
) : null}
```

Add CSS for overlay, portrait, text, choices, mobile.

- [ ] **Step 4: Run test**

Run: `npx vitest run src/ui/render.test.tsx -t "dialogue"`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ui/components/DialogueOverlay.tsx src/App.tsx src/index.css src/ui/render.test.tsx
git commit -m "feat: add dialogue overlay"
```

---

## Task 6: 浏览器垂直流程

**Files:**
- Create: `tests/acceptance/hiori.spec.ts`
- Modify: `docs/roadmap.md` (status/checklist after pass)

**Interfaces:**
- Consumes: debug bridge, `startStory` action, overlay.
- Produces: E2E proof of first/second/recruit/reload/filters.

- [ ] **Step 1: Write failing E2E**

```ts
test('Hiori encounter: unknown -> known -> recruited', async ({ page }) => {
  await openGame(page);
  await reset(page, 1);
  await jumpTo(page, 1, 600, 'park');
  await expect(page.getByRole('button', { name: '在长椅旁停下' })).toBeVisible();

  await page.getByRole('button', { name: '在长椅旁停下' }).click();
  // advance/choose to first terminal
  // assert known via getState, roster visible, schedule hidden

  await jumpTo(page, 3, 600, 'park');
  await expect(page.getByRole('button', { name: '去公园看看' })).toBeVisible();
  // complete second, assert recruited, schedule visible, training possible
});
```

Add mid-dialogue reload on a node; assert `dialogueNodeId` preserved.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/acceptance/hiori.spec.ts`

Expected: FAIL until selectors/content complete.

- [ ] **Step 3: Implement selectors/content/test helpers**

Use accessible names:

```text
在长椅旁停下
继续
去公园看看
```

Add stable `data-testid` only if accessible names are ambiguous.

- [ ] **Step 4: Run test**

Run: `npx playwright test tests/acceptance/hiori.spec.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tests/acceptance/hiori.spec.ts docs/roadmap.md
git commit -m "test: validate Hiori encounter end to end"
```

---

## Task 7: 全量回归与收尾

**Files:**
- Modify: `docs/roadmap.md` (status/decision log)
- Modify: `README.md` if needed

- [ ] **Step 1: Run full suite**

```bash
npm test
npm run build
npm run acceptance
npm run acceptance:review
```

Expected: all pass; new Hiori E2E included.

- [ ] **Step 2: Manual checks**

```text
新游戏：灯织不在名册/日程
公园第 1 天：第一次相遇
第 2 天：无第二次
第 3 天：第二次相遇可触发
招募后：名册/日程/训练可用
对话中途刷新：恢复同一节点
旧 v11 存档：灯织 recruited
移动端 390px：无横向溢出
```

- [ ] **Step 3: Update roadmap**

Mark Phase 1 `in progress`/`done` based on result; add verification evidence and any deviations.

- [ ] **Step 4: Commit**

```bash
git add docs/roadmap.md README.md
git commit -m "docs: mark Hiori encounter slice verified"
```
