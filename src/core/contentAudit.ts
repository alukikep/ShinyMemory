import { CONTENT_INDEX } from './contentIndex';
import type {
  Condition,
  Effect,
  EventDef,
  StoryChainDef,
} from './types';

export type ContentIssue = {
  level: 'error' | 'warning';
  code: string;
  message: string;
};

const PAIR_CAST_BUDGET = 10;
const PAIR_GENERIC_BUDGET = 3;

function walkConditions(
  conditions: Condition[] | undefined,
  visit: (condition: Condition) => void,
): void {
  for (const condition of conditions ?? []) {
    visit(condition);
    if (condition.kind === 'all' || condition.kind === 'any') {
      walkConditions(condition.of, visit);
    } else if (condition.kind === 'not') {
      walkConditions([condition.of], visit);
    }
  }
}

function collectFlagWrites(effects: Effect[] | undefined, out: Set<string>): void {
  for (const effect of effects ?? []) {
    if (effect.kind === 'flag') out.add(effect.key);
  }
}

function collectFlagReads(
  conditions: Condition[] | undefined,
  out: Set<string>,
): void {
  walkConditions(conditions, (condition) => {
    if (condition.kind === 'flag') out.add(condition.key);
  });
}

function anchorOf(event: EventDef): string | undefined {
  if (!event.after || !('ids' in event.after)) return undefined;
  return [...event.after.ids].sort().join(',');
}

/**
 * 静态内容体检：只做能可靠判定的检查，不做“这条剧情是否好玩”。
 * 返回空数组表示没有发现问题。
 */
export function auditContent(): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const push = (
    level: ContentIssue['level'],
    code: string,
    message: string,
  ) => issues.push({ level, code, message });

  const idolIds = CONTENT_INDEX.idols;
  const actorIds = CONTENT_INDEX.actors;
  const activityIds = CONTENT_INDEX.activities;
  const eventIds = CONTENT_INDEX.events;
  const dialogueIds = CONTENT_INDEX.dialogues;
  const locationIds = CONTENT_INDEX.locations;

  // ---- 引用完整性 ----
  for (const event of eventIds.values()) {
    const checkEventRef = (id: string | undefined, label: string) => {
      if (id && !eventIds.has(id)) {
        push('error', 'event-ref', `${event.id} 的 ${label} 指向不存在的事件 ${id}`);
      }
    };
    checkEventRef(event.nextEventId, 'nextEventId');

    if (event.after && 'ids' in event.after) {
      for (const id of event.after.ids) {
        if (!activityIds.has(id)) {
          push('error', 'activity-ref', `${event.id} 的 after 指向不存在的行动 ${id}`);
        }
      }
    }
    for (const id of event.afterNpc?.ids ?? []) {
      if (!actorIds.has(id)) {
        push('error', 'actor-ref', `${event.id} 的 afterNpc 指向不存在的角色 ${id}`);
      }
    }
    for (const id of event.afterIdol?.ids ?? []) {
      if (!idolIds.has(id)) {
        push('error', 'idol-ref', `${event.id} 的 afterIdol 指向不存在的偶像 ${id}`);
      }
    }

    for (const choice of event.choices) {
      checkEventRef(choice.nextEventId, 'choice.nextEventId');
      if (choice.dialogueId && !dialogueIds.has(choice.dialogueId)) {
        push(
          'error',
          'dialogue-ref',
          `${event.id} 的选项指向不存在的对话 ${choice.dialogueId}`,
        );
      }
    }
  }

  for (const activity of activityIds.values()) {
    for (const id of activity.locations ?? []) {
      if (!locationIds.has(id)) {
        push('error', 'location-ref', `${activity.id} 指向不存在的地点 ${id}`);
      }
    }
  }

  for (const chain of CONTENT_INDEX.storyChains.values()) {
    auditChain(chain, push);
  }

  for (const dialogue of dialogueIds.values()) {
    for (const id of dialogue.participantIds ?? []) {
      if (!idolIds.has(id)) {
        push('error', 'idol-ref', `${dialogue.id} 的参与者不存在 ${id}`);
      }
    }
  }

  // ---- 效果引用完整性 ----
  const checkEffects = (effects: Effect[] | undefined, owner: string) => {
    for (const effect of effects ?? []) {
      if (effect.kind !== 'scheduleOverride') continue;
      if (!actorIds.has(effect.actorId)) {
        push(
          'error',
          'actor-ref',
          `${owner} 的 scheduleOverride 指向不存在的角色 ${effect.actorId}`,
        );
      }
      if (effect.locationId && !locationIds.has(effect.locationId)) {
        push(
          'error',
          'location-ref',
          `${owner} 的 scheduleOverride 指向不存在的地点 ${effect.locationId}`,
        );
      }
    }
  };

  for (const event of eventIds.values()) {
    for (const choice of event.choices) {
      checkEffects(choice.effects, `${event.id} 的选项`);
    }
  }
  for (const activity of activityIds.values()) {
    checkEffects(activity.effects, activity.id);
  }
  for (const actor of actorIds.values()) {
    for (const topic of actor.topics) {
      checkEffects(topic.effects, `${actor.id}/${topic.id}`);
    }
  }
  for (const chain of CONTENT_INDEX.storyChains.values()) {
    for (const step of chain.steps) {
      checkEffects(step.effects, `${chain.id}/${step.id}`);
    }
  }

  // ---- 组合戏规则与预算 ----
  const budget = new Map<string, { cast: number; generic: number }>();
  for (const event of eventIds.values()) {
    const isPair = Boolean(event.cast) || event.castSize !== undefined;
    if (!isPair) continue;

    if (event.cast) {
      if (event.cast.length !== 2) {
        push('error', 'cast-size', `${event.id} 的 cast 目前只支持 2 人`);
      }
      for (const id of event.cast) {
        if (!idolIds.has(id)) {
          push('error', 'idol-ref', `${event.id} 的 cast 指向不存在的偶像 ${id}`);
        }
      }
    }
    if (event.castSize !== undefined && event.castSize !== 2) {
      push('error', 'cast-size', `${event.id} 的 castSize 目前只支持 2`);
    }

    const anchor = anchorOf(event);
    if (!anchor) {
      push('warning', 'pair-anchor', `${event.id} 是组合戏但没有 after 锚点`);
      continue;
    }
    const entry = budget.get(anchor) ?? { cast: 0, generic: 0 };
    if (event.cast) entry.cast += 1;
    if (event.castSize !== undefined) entry.generic += 1;
    budget.set(anchor, entry);
  }
  for (const [anchor, entry] of budget) {
    if (entry.cast > PAIR_CAST_BUDGET) {
      push(
        'warning',
        'pair-budget',
        `${anchor} 的专属双人剧情 ${entry.cast} 条，超过预算 ${PAIR_CAST_BUDGET}`,
      );
    }
    if (entry.generic > PAIR_GENERIC_BUDGET) {
      push(
        'warning',
        'pair-budget',
        `${anchor} 的通用双人剧情 ${entry.generic} 条，超过预算 ${PAIR_GENERIC_BUDGET}`,
      );
    }
  }

  // ---- flag 读写一致性 ----
  const flagWrites = new Set<string>();
  const flagReads = new Set<string>();
  const collectFromEffects = (effects: Effect[] | undefined) =>
    collectFlagWrites(effects, flagWrites);

  for (const event of eventIds.values()) {
    collectFlagReads(event.when, flagReads);
    for (const choice of event.choices) {
      collectFlagReads(choice.requires, flagReads);
      collectFromEffects(choice.effects);
    }
    if (event.once) flagWrites.add(`seen:${event.id}`);
  }
  for (const activity of activityIds.values()) {
    collectFlagReads(activity.requires, flagReads);
    collectFromEffects(activity.effects);
  }
  for (const actor of actorIds.values()) {
    for (const topic of actor.topics) {
      collectFlagReads(topic.when, flagReads);
      collectFromEffects(topic.effects);
    }
  }
  for (const dialogue of dialogueIds.values()) {
    for (const node of Object.values(dialogue.nodes)) {
      collectFromEffects(node.effects);
      for (const choice of node.choices ?? []) {
        collectFlagReads(choice.requires, flagReads);
        collectFromEffects(choice.effects);
      }
      for (const variant of node.textVariants ?? []) {
        collectFlagReads(variant.when, flagReads);
      }
    }
  }

  for (const key of flagReads) {
    // test_ 前缀是测试钩子，允许只读不写。
    if (key.startsWith('test_')) continue;
    if (!flagWrites.has(key)) {
      push('warning', 'flag-read', `条件读取了从未被写入的 flag：${key}`);
    }
  }

  return issues;
}

function auditChain(
  chain: StoryChainDef,
  push: (level: ContentIssue['level'], code: string, message: string) => void,
): void {
  const idolIds = CONTENT_INDEX.idols;
  const dialogueIds = CONTENT_INDEX.dialogues;
  const locationIds = CONTENT_INDEX.locations;

  if (!idolIds.has(chain.idolId)) {
    push('error', 'idol-ref', `${chain.id} 指向不存在的偶像 ${chain.idolId}`);
  }
  for (const step of chain.steps) {
    if (!dialogueIds.has(step.dialogueId)) {
      push(
        'error',
        'dialogue-ref',
        `${chain.id}/${step.id} 指向不存在的对话 ${step.dialogueId}`,
      );
    }
    if (!locationIds.has(step.locationId)) {
      push(
        'error',
        'location-ref',
        `${chain.id}/${step.id} 指向不存在的地点 ${step.locationId}`,
      );
    }
  }
}
