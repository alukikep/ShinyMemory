import type { ContentIndex } from './contentIndexCore';
import { isKnownConditionKind, isKnownEffectKind } from './contentSchema';
import { RANK_ORDER } from './growth';
import { getSchedulesForDay } from './schedule';
import { isMinuteInWindow } from './time';
import type {
  ActivityDef,
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

/**
 * 某个偶像在 28 天里真的做得成的行动。
 *
 * 只按"日程地点 + 行动地点 + 时段 + 归属"推，不模拟金钱/体力/flag；
 * 目的只有一个：拦住"事件挂在某个偶像永远做不到的行动上"这种死内容。
 */
function reachableActivityIds(
  index: ContentIndex,
  idolId: string,
  cache: Map<string, Set<string>>,
): Set<string> {
  const cached = cache.get(idolId);
  if (cached) return cached;

  const reachable = new Set<string>();
  const allActivities: ActivityDef[] = [...index.activities.values()];
  // 地点页行动（制作人自己的活、多偶像行动）不需要这个偶像在场，谁都能触发。
  for (const activity of allActivities) {
    if (activity.target === 'none' || activity.target === 'all-present-idols') {
      reachable.add(activity.id);
    }
  }

  const actor = index.actors.get(idolId);
  if (actor) {
    for (let day = 1; day <= 28; day += 1) {
      const slots = getSchedulesForDay(actor, day);
      if (slots.length === 0) continue;
      for (let minute = 0; minute < 1440; minute += 15) {
        const absolute = (day - 1) * 1440 + minute;
        const slot = slots.find((entry) => isMinuteInWindow(absolute, entry));
        if (!slot?.locationId) continue;
        const slotLocationId = slot.locationId;
        for (const activity of index.activitiesByLocation.get(slotLocationId) ??
          []) {
          if (activity.locations && !activity.locations.includes(slotLocationId)) {
            continue;
          }
          if (activity.idolIds && !activity.idolIds.includes(idolId)) continue;
          if (
            activity.timeWindows &&
            !activity.timeWindows.some((window) =>
              isMinuteInWindow(absolute, window),
            )
          ) {
            continue;
          }
          reachable.add(activity.id);
        }
      }
    }
  }

  cache.set(idolId, reachable);
  return reachable;
}

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

function collectVarWrites(effects: Effect[] | undefined, out: Set<string>): void {
  for (const effect of effects ?? []) {
    if (effect.kind === 'var') out.add(effect.key);
  }
}

function collectVarReads(
  conditions: Condition[] | undefined,
  out: Set<string>,
): void {
  walkConditions(conditions, (condition) => {
    if (condition.kind === 'varAtLeast' || condition.kind === 'varAtMost') {
      out.add(condition.key);
    }
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
/**
 * 对任意内容索引做同一套体检。审查台用它校验单条草稿，
 * 构建门用它校验整包，两边不再各写一套规则。
 */
export type AuditOptions = {
  /** 跳过整包级规则（单条草稿校验时用）。 */
  skipPackRules?: boolean;
};

export function auditPack(
  index: ContentIndex,
  options: AuditOptions = {},
): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const push = (
    level: ContentIssue['level'],
    code: string,
    message: string,
  ) => issues.push({ level, code, message });

  const idolIds = index.idols;
  const actorIds = index.actors;
  const activityIds = index.activities;
  const eventIds = index.events;
  const dialogueIds = index.dialogues;
  const locationIds = index.locations;
  const rankOrder: string[] = RANK_ORDER;

  // ---- 引用完整性 ----
  for (const event of eventIds.values()) {
    if (!Array.isArray(event.choices) || event.choices.length === 0) {
      push('error', 'event-shape', `${event.id} 没有 choices（至少一个选项）`);
    }
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

    for (const choice of event.choices ?? []) {
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
    if (activity.idolIds) {
      for (const id of activity.idolIds) {
        if (!idolIds.has(id)) {
          push('error', 'idol-ref', `${activity.id} 的专属偶像不存在 ${id}`);
        }
      }
      if (activity.idolIds.length === 0) {
        push('warning', 'activity-idol-target', `${activity.id} 的 idolIds 是空数组`);
      }
      if (activity.target !== 'present-idol' && activity.target !== 'all-present-idols') {
        push(
          'warning',
          'activity-idol-target',
          `${activity.id} 是专属行动但 target 不是 present-idol / all-present-idols，永远不会出现`,
        );
      }
      if (activity.kind === 'rest' || activity.kind === 'sleep') {
        push(
          'warning',
          'activity-idol-target',
          `${activity.id} 是 ${activity.kind}，不该做专属`,
        );
      }
    }
  }

  // ---- 身份 ↔ 日程 ----
  // 事故（2026-11-02）：把 19 岁的冬優子写成"社会人"（facts 写着专门学校），
  // 而身份直接决定日程——学生平日上午必须是 protected 的学校时段，成人则不该有。
  const schoolLocation: Record<string, string> = {
    elementary: 'school',
    junior: 'school',
    high: 'school',
    university: 'university',
    specialised: 'school',
  };
  // 旧日程还没补学校的角色（真技债，见 dev-guide §6）。
  const schoolSlotDebt = new Set(['mano']);
  for (const idol of idolIds.values()) {
    // 夹具包不声明身份；是否声明由 identity.test 对正式包统一检查。
    if (!idol.school) continue;
    const actor = index.actors.get(idol.id);
    if (!actor) continue;
    const isWeekday = (entry: { weekdays?: number[] }) =>
      (entry.weekdays ?? []).some((day) => day >= 1 && day <= 5);
    const protectedSchool = actor.schedule.filter(
      (entry) =>
        entry.protected &&
        (entry.locationId === 'school' || entry.locationId === 'university'),
    );
    if (idol.school === 'none') {
      if (protectedSchool.length > 0) {
        push(
          'error',
          'idol-school-stage',
          `${idol.id} 声明无学籍，但日程里有 protected 的学校时段`,
        );
      }
      continue;
    }
    const expected = schoolLocation[idol.school];
    const hasSlot = actor.schedule.some(
      (entry) => isWeekday(entry) && entry.protected && entry.locationId === expected,
    );
    if (!hasSlot && !schoolSlotDebt.has(idol.id)) {
      push(
        'error',
        'idol-school-stage',
        `${idol.id} 声明 ${idol.school}，但日程没有 protected 的 ${expected} 时段`,
      );
    }
  }

  // ---- 事件要真的做得到 ----
  // 事故 #30：摩美々的舞蹈课/表演课事件挂在她永远做不到的行动上
  // （她的日程里没有练习室），覆盖率却按"事件写了 3 条"算通过。
  const reachCache = new Map<string, Set<string>>();
  for (const event of eventIds.values()) {
    const afterIds =
      event.after && 'ids' in event.after ? event.after.ids : undefined;
    const idolIdsAfter = event.afterIdol?.ids ?? [];
    if (!afterIds || afterIds.length === 0 || idolIdsAfter.length === 0) {
      continue;
    }
    const reachable = idolIdsAfter.some((idolId) =>
      afterIds.some((id) =>
        reachableActivityIds(index, idolId, reachCache).has(id),
      ),
    );
    if (!reachable) {
      push(
        'error',
        'event-unreachable',
        `${event.id}：${idolIdsAfter.join('/')} 永远做不到 ${afterIds.join('/')}，这个事件不会触发`,
      );
    }
  }

  for (const job of index.jobs.values()) {
    if (!locationIds.has(job.locationId)) {
      push('error', 'location-ref', `${job.id} 指向不存在的地点 ${job.locationId}`);
    }
    if (job.check && !(job.failureEffects?.length)) {
      push(
        'warning',
        'job-check-branch',
        `${job.id} 有检定但没有 failureEffects，失败只是少拿钱`,
      );
    }
  }

  // 粉丝是只增不减的累计值：整包里一条 fans 效果都没有，它就永远是 0。
  const collectedEffects: Effect[][] = [
    ...[...activityIds.values()].map((activity) => activity.effects ?? []),
    ...[...eventIds.values()].flatMap((event) => [
      ...(event.choices ?? []).map((choice) => choice.effects ?? []),
    ]),
    ...[...index.jobs.values()].map((job) => job.effects ?? []),
    ...[...actorIds.values()].flatMap((actor) =>
      actor.topics.map((topic) => topic.effects ?? []),
    ),
    ...[...index.storyChains.values()].flatMap((chain) =>
      chain.steps.map((step) => step.effects ?? []),
    ),
    ...[...dialogueIds.values()].flatMap((dialogue) =>
      Object.values(dialogue.nodes ?? {}).flatMap((node) => [
        node.effects ?? [],
        ...(node.choices ?? []).map((choice) => choice.effects ?? []),
      ]),
    ),
  ];
  const hasFansSource = collectedEffects.some((effects) =>
    effects.some((effect) => effect.kind === 'fans'),
  );
  if (!hasFansSource && !options.skipPackRules) {
    push(
      'warning',
      'fans-source',
      '内容里没有任何 fans 效果，粉丝数会永远是 0',
    );
  }

  // 工作引用了 flag 当解锁条件，但整包没人写这个 flag → 这份工作永远开不了。
  const setFlags = new Set(
    collectedEffects
      .flat()
      .filter((effect) => effect.kind === 'flag' && effect.value)
      .map((effect) => (effect as { key: string }).key),
  );
  for (const job of index.jobs.values()) {
    for (const condition of job.requires ?? []) {
      if (condition.kind !== 'flag') continue;
      if (setFlags.has(condition.key)) continue;
      push(
        'warning',
        'job-unlock-flag',
        `${job.id} 需要 flag ${condition.key}，但内容里没有任何效果会设置它`,
      );
    }
  }

  // 商品货架由商店的 itemIds 决定；物品不反向引用商店，避免两处真相。
  for (const shop of index.shops.values()) {
    if (!locationIds.has(shop.locationId)) {
      push('error', 'location-ref', `${shop.id} 指向不存在的地点 ${shop.locationId}`);
    }
    for (const id of shop.itemIds ?? []) {
      if (!index.items.has(id)) {
        push('error', 'item-ref', `${shop.id} 上架了不存在的物品 ${id}`);
      }
    }
  }

  for (const facility of index.facilities.values()) {
    if (!locationIds.has(facility.locationId)) {
      push(
        'error',
        'location-ref',
        `${facility.id} 指向不存在的地点 ${facility.locationId}`,
      );
    }
    const activity = index.activities.get(facility.activityId);
    if (!activity) {
      push(
        'error',
        'activity-ref',
        `${facility.id} 指向不存在的行动 ${facility.activityId}`,
      );
    } else if (!activity.levels?.length) {
      push(
        'warning',
        'facility-levels',
        `${facility.id} 的行动 ${facility.activityId} 没有 levels，升级不会改变训练`,
      );
    } else if (activity.levels.length < facility.levels.length) {
      push(
        'warning',
        'facility-levels',
        `${facility.id} 有 ${facility.levels.length} 级，但行动只有 ${activity.levels.length} 级`,
      );
    }
    if (!facility.varKey.trim()) {
      push('error', 'facility-var', `${facility.id} 的 varKey 不能为空`);
    }
    const seen = new Set<number>();
    for (const level of facility.levels) {
      if (seen.has(level.level)) {
        push('error', 'facility-level', `${facility.id} 等级 ${level.level} 重复`);
      }
      seen.add(level.level);
      if (level.cost <= 0) {
        push(
          'error',
          'facility-cost',
          `${facility.id} 等级 ${level.level} 的费用必须是正数`,
        );
      }
    }
  }

  for (const chain of index.storyChains.values()) {
    auditChain(chain, push, index);
  }

  for (const dialogue of dialogueIds.values()) {
    if (dialogue.idolId && !idolIds.has(dialogue.idolId)) {
      push('error', 'idol-ref', `${dialogue.id} 的主偶像不存在 ${dialogue.idolId}`);
    }
    for (const id of dialogue.participantIds ?? []) {
      if (!idolIds.has(id)) {
        push('error', 'idol-ref', `${dialogue.id} 的参与者不存在 ${id}`);
      }
    }
  }

  // ---- 效果引用完整性 ----
  const checkEffects = (effects: Effect[] | undefined, owner: string) => {
    for (const effect of effects ?? []) {
      if (!isKnownEffectKind(String(effect.kind))) {
        push('error', 'effect-kind', `${owner} 出现未知效果 ${String(effect.kind)}`);
        continue;
      }
      if (effect.kind === 'fans' && effect.idolId && !idolIds.has(effect.idolId)) {
        push(
          'error',
          'idol-ref',
          `${owner} 的 fans 效果指向不存在的偶像 ${effect.idolId}`,
        );
      }
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
    for (const choice of event.choices ?? []) {
      checkEffects(choice.effects, `${event.id} 的选项`);
    }
  }
  for (const activity of activityIds.values()) {
    checkEffects(activity.effects, activity.id);
    checkEffects(activity.failureEffects, `${activity.id} 的失败分支`);
  }
  for (const actor of actorIds.values()) {
    for (const topic of actor.topics) {
      checkEffects(topic.effects, `${actor.id}/${topic.id}`);
    }
  }
  for (const chain of index.storyChains.values()) {
    for (const step of chain.steps) {
      checkEffects(step.effects, `${chain.id}/${step.id}`);
    }
  }
  for (const dialogue of dialogueIds.values()) {
    for (const node of Object.values(dialogue.nodes)) {
      checkEffects(node.effects, `${dialogue.id}/${node.id}`);
      for (const choice of node.choices ?? []) {
        checkEffects(choice.effects, `${dialogue.id}/${node.id} 的选项`);
      }
    }
  }

  // ---- 饰品与检定 ----
  const modifierKeys = new Set<string>([
    'staminaCost',
    'staminaCap',
    'duration',
    'trainingExp',
    'workMoney',
  ]);
  const mulCount = new Map<string, number>();
  for (const equip of index.equips.values()) {
    for (const modifier of equip.modifiers) {
      if (!modifierKeys.has(modifier.key)) {
        push(
          'error',
          'modifier-key',
          `${equip.id} 的加成 key 不存在：${modifier.key}`,
        );
        continue;
      }
      if ((modifier.op ?? 'mul') === 'mul') {
        mulCount.set(modifier.key, (mulCount.get(modifier.key) ?? 0) + 1);
      }
    }
  }
  for (const [key, count] of mulCount) {
    if (count > 3) {
      push(
        'warning',
        'modifier-stack',
        `「${key}」有 ${count} 条乘算加成，超过 3 条容易滚出离谱数值`,
      );
    }
  }

  for (const activity of activityIds.values()) {
    const check = activity.check;
    if (!check) continue;
    if (!rankOrder.includes(check.difficulty)) {
      push(
        'error',
        'check-rank',
        `${activity.id} 的检定难度不是合法等级：${check.difficulty}`,
      );
    }
    if (Math.abs(check.shift ?? 0) > 40) {
      push(
        'warning',
        'check-shift',
        `${activity.id} 的检定 shift 超过 ±40，等于把难度抹平了`,
      );
    }
    if (!activity.failureEffects?.length && !activity.failureTexts?.length) {
      push(
        'warning',
        'check-branch',
        `${activity.id} 有检定但没有失败分支，成败无差别`,
      );
    }
  }

  // ---- 组合戏规则与预算 ----
  const budget = new Map<string, { cast: number; generic: number }>();
  for (const event of eventIds.values()) {
    const isArrival = event.entry?.kind === 'arrival';
    if (isArrival) {
      if (event.after || event.afterNpc || event.afterIdol) {
        push(
          'error',
          'arrival-anchor',
          `${event.id} 是到达事件，不会经过行动后的锚点判定，after/afterNpc/afterIdol 永远不会命中`,
        );
      }
      if (event.trigger) {
        push(
          'error',
          'arrival-trigger',
          `${event.id} 同时写了 arrival 和 trigger：定时事件不走到达池，请二选一`,
        );
      }
      if (event.cooldownActions) {
        push(
          'warning',
          'arrival-cooldown',
          `${event.id} 的 cooldownActions 按行动数计，而移动不算行动，冷却几乎不会推进；到达事件建议用 once 或 chance`,
        );
      }
    }

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
      if (!isArrival) {
        push('warning', 'pair-anchor', `${event.id} 是组合戏但没有 after 锚点`);
      }
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

  // ---- flag / var 读写一致性 ----
  const flagWrites = new Set<string>();
  const flagReads = new Set<string>();
  const varWrites = new Set<string>();
  const varReads = new Set<string>();
  const collectFromEffects = (effects: Effect[] | undefined) => {
    collectFlagWrites(effects, flagWrites);
    collectVarWrites(effects, varWrites);
  };
  const collectReads = (conditions: Condition[] | undefined) => {
    collectFlagReads(conditions, flagReads);
    collectVarReads(conditions, varReads);
  };

  for (const event of eventIds.values()) {
    collectReads(event.when);
    for (const choice of event.choices ?? []) {
      collectReads(choice.requires);
      collectFromEffects(choice.effects);
    }
    if (event.once) flagWrites.add(`seen:${event.id}`);
  }
  for (const activity of activityIds.values()) {
    collectReads(activity.requires);
    collectFromEffects(activity.effects);
  }
  for (const actor of actorIds.values()) {
    for (const topic of actor.topics) {
      collectReads(topic.when);
      collectFromEffects(topic.effects);
    }
  }
  for (const dialogue of dialogueIds.values()) {
    for (const node of Object.values(dialogue.nodes)) {
      collectFromEffects(node.effects);
      for (const choice of node.choices ?? []) {
        collectReads(choice.requires);
        collectFromEffects(choice.effects);
      }
      for (const variant of node.textVariants ?? []) {
        collectReads(variant.when);
      }
    }
  }
  for (const chain of index.storyChains.values()) {
    collectReads(chain.revealWhen);
    for (const step of chain.steps) {
      collectReads(step.when);
      collectFromEffects(step.effects);
    }
  }

  // ---- 条件引用的 id 是否真实存在 ----
  const itemIds = index.items;
  const checkConditionRefs = (
    conditions: Condition[] | undefined,
    owner: string,
  ) => {
    walkConditions(conditions, (condition) => {
      if (!isKnownConditionKind(String(condition.kind))) {
        push(
          'error',
          'condition-kind',
          `${owner} 出现未知条件 ${String(condition.kind)}`,
        );
        return;
      }
      switch (condition.kind) {
        case 'hasItem':
          if (!itemIds.has(condition.itemId)) {
            push(
              'error',
              'item-ref',
              `${owner} 指向不存在的物品 ${condition.itemId}`,
            );
          }
          break;
        case 'atLocation':
          if (!locationIds.has(condition.locationId)) {
            push(
              'error',
              'location-ref',
              `${owner} 指向不存在的地点 ${condition.locationId}`,
            );
          }
          break;
        case 'idolStatus':
          if (condition.idolId && !idolIds.has(condition.idolId)) {
            push(
              'error',
              'idol-ref',
              `${owner} 指向不存在的偶像 ${condition.idolId}`,
            );
          }
          break;
        case 'fansAtLeast':
        case 'fansAtMost':
          if (condition.idolId && !idolIds.has(condition.idolId)) {
            push(
              'error',
              'idol-ref',
              `${owner} 指向不存在的偶像 ${condition.idolId}`,
            );
          }
          break;
        case 'castPresent':
          for (const id of condition.idolIds) {
            if (!idolIds.has(id)) {
              push('error', 'idol-ref', `${owner} 指向不存在的偶像 ${id}`);
            }
          }
          break;
        case 'npcAffinityAtLeast':
        case 'npcAffinityAtMost':
          if (!actorIds.has(condition.actorId)) {
            push(
              'error',
              'actor-ref',
              `${owner} 指向不存在的角色 ${condition.actorId}`,
            );
          }
          break;
        default:
          break;
      }
    });
  };

  for (const event of eventIds.values()) {
    checkConditionRefs(event.when, event.id);
    for (const choice of event.choices ?? []) {
      checkConditionRefs(choice.requires, `${event.id} 的选项`);
    }
  }
  for (const activity of activityIds.values()) {
    checkConditionRefs(activity.requires, activity.id);
  }
  for (const actor of actorIds.values()) {
    for (const topic of actor.topics) {
      checkConditionRefs(topic.when, `${actor.id}/${topic.id}`);
    }
  }
  for (const dialogue of dialogueIds.values()) {
    for (const node of Object.values(dialogue.nodes)) {
      for (const choice of node.choices ?? []) {
        checkConditionRefs(choice.requires, `${dialogue.id}/${node.id}`);
      }
      for (const variant of node.textVariants ?? []) {
        checkConditionRefs(variant.when, `${dialogue.id}/${node.id}`);
      }
    }
  }
  for (const chain of index.storyChains.values()) {
    checkConditionRefs(chain.revealWhen, `${chain.id} 的 revealWhen`);
    for (const step of chain.steps) {
      checkConditionRefs(step.when, `${chain.id}/${step.id}`);
    }
  }

  for (const key of flagReads) {
    // test_ 前缀是测试钩子，允许只读不写。
    if (key.startsWith('test_')) continue;
    if (!flagWrites.has(key)) {
      push('warning', 'flag-read', `条件读取了从未被写入的 flag：${key}`);
    }
  }

  for (const key of varReads) {
    if (key.startsWith('test.')) continue;
    if (!varWrites.has(key)) {
      push('warning', 'var-read', `条件读取了从未被写入的 var：${key}`);
    }
  }
  for (const key of [...varWrites, ...varReads]) {
    if (key.startsWith('test.')) continue;
    if (!key.includes('.')) {
      push(
        'warning',
        'var-namespace',
        `var 键名缺少命名空间（建议 domain.name）：${key}`,
      );
    }
  }

  return issues;
}

function auditChain(
  chain: StoryChainDef,
  push: (level: ContentIssue['level'], code: string, message: string) => void,
  index: ContentIndex,
): void {
  const idolIds = index.idols;
  const dialogueIds = index.dialogues;
  const locationIds = index.locations;

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
