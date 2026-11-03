import { auditPack } from '../core/contentAudit.js';
import { buildContentIndex, type ContentPack } from '../core/contentIndexCore.js';
import { packApprovedFiles } from '../core/content/approvedPacking.js';
import { mergeApprovedContent } from './approval.js';
import { describeJapaneseLine, findJapaneseLines } from './japaneseText.js';
import type { ReviewDraft } from './types.js';

export type ReviewValidation = {
  ok: boolean;
  /** 阻塞性问题：有它就不能通过。 */
  errors: string[];
  /** 提示性问题：不影响通过（如"变量由另一条还没批的草稿写入"）。 */
  warnings: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * 只做“结构能不能用”的检查：必填字段、数组还是对象、引用链形状。
 * 语义层（条件/效果的种类、id 是否存在、预算、flag 读写）一律交给 `auditPack`，
 * 那份规则和构建门是同一份 —— 这里不再维护第二套白名单。
 */

function requireString(value: unknown, label: string, errors: string[]): void {
  if (typeof value !== 'string' || value.length === 0) {
    errors.push(`${label} 不能为空`);
  }
}

function expectArray(value: unknown, label: string, errors: string[]): boolean {
  if (value === undefined) return true;
  if (!Array.isArray(value)) {
    errors.push(`${label} 必须是数组`);
    return false;
  }
  return true;
}

function checkEffectsShape(
  value: unknown,
  label: string,
  errors: string[],
): void {
  if (value === undefined) return;
  if (!Array.isArray(value)) {
    errors.push(`${label} 必须是数组`);
    return;
  }
  for (const [index, effect] of value.entries()) {
    if (!isRecord(effect)) {
      errors.push(`${label}[${index}] 必须是对象`);
      continue;
    }
    if (typeof effect.kind !== 'string' || !effect.kind) {
      errors.push(`${label}[${index}] 缺少 kind`);
    }
  }
}

function checkConditionsShape(
  value: unknown,
  label: string,
  errors: string[],
): void {
  if (value === undefined) return;
  if (!Array.isArray(value)) {
    errors.push(`${label} 必须是数组`);
    return;
  }
  for (const [index, condition] of value.entries()) {
    if (!isRecord(condition)) {
      errors.push(`${label}[${index}] 必须是对象`);
      continue;
    }
    if (typeof condition.kind !== 'string' || !condition.kind) {
      errors.push(`${label}[${index}] 缺少 kind`);
    }
  }
}

function validateEvent(payload: Record<string, unknown>, errors: string[]): void {
  requireString(payload.id, 'payload.id', errors);
  requireString(payload.title, 'payload.title', errors);
  requireString(payload.text, 'payload.text', errors);
  checkConditionsShape(payload.when, 'when', errors);

  if (!Array.isArray(payload.choices) || payload.choices.length === 0) {
    errors.push('事件至少需要一个选项');
    return;
  }
  for (const [index, choice] of payload.choices.entries()) {
    if (!isRecord(choice)) {
      errors.push(`choices[${index}] 必须是对象`);
      continue;
    }
    requireString(choice.label, `choices[${index}].label`, errors);
    requireString(choice.result, `choices[${index}].result`, errors);
    checkEffectsShape(choice.effects, `choices[${index}].effects`, errors);
    checkConditionsShape(choice.requires, `choices[${index}].requires`, errors);
  }
  if (payload.after !== undefined && !isRecord(payload.after)) {
    errors.push('after 必须是对象');
  }
  if (payload.trigger !== undefined && !isRecord(payload.trigger)) {
    errors.push('trigger 必须是对象');
  }
  if (payload.entry !== undefined && !isRecord(payload.entry)) {
    errors.push('entry 必须是对象');
  }
  if (payload.cast !== undefined && !Array.isArray(payload.cast)) {
    errors.push('cast 必须是数组');
  }
}

function validateJob(payload: Record<string, unknown>, errors: string[]): void {
  requireString(payload.id, 'payload.id', errors);
  requireString(payload.name, 'payload.name', errors);
  if (typeof payload.description !== 'string') {
    errors.push('payload.description 必须是字符串');
  }
  requireString(payload.locationId, 'payload.locationId', errors);
  if (
    typeof payload.fromMinute !== 'number' ||
    typeof payload.toMinute !== 'number' ||
    payload.fromMinute < 0 ||
    payload.toMinute > 24 * 60 ||
    payload.toMinute <= payload.fromMinute
  ) {
    errors.push('工作时间必须满足 0 ≤ from < to ≤ 1440');
  }
  if (typeof payload.pay !== 'number' || payload.pay < 0) {
    errors.push('报酬必须是非负数字');
  }
  checkEffectsShape(payload.effects, 'effects', errors);
}

const ACTIVITY_KINDS = [
  'training',
  'work',
  'rest',
  'bond',
  'explore',
  'sleep',
] as const;

function validateActivity(
  payload: Record<string, unknown>,
  errors: string[],
): void {
  requireString(payload.id, 'payload.id', errors);
  requireString(payload.name, 'payload.name', errors);
  if (typeof payload.description !== 'string') {
    errors.push('payload.description 必须是字符串');
  }
  if (
    typeof payload.kind !== 'string' ||
    !(ACTIVITY_KINDS as readonly string[]).includes(payload.kind)
  ) {
    errors.push(`payload.kind 必须是 ${ACTIVITY_KINDS.join(' / ')} 之一`);
  }
  if (
    typeof payload.durationMinutes !== 'number' ||
    payload.durationMinutes < 0
  ) {
    errors.push('payload.durationMinutes 必须是非负数字');
  }
  if (!isRecord(payload.cost)) {
    errors.push('payload.cost 必须是对象');
  }
  if (!Array.isArray(payload.resultTexts) || payload.resultTexts.length === 0) {
    errors.push('行动至少需要一条结果文本');
  }
  expectArray(payload.locations, 'locations', errors);
  expectArray(payload.timeWindows, 'timeWindows', errors);
  checkEffectsShape(payload.effects, 'effects', errors);
  checkEffectsShape(payload.failureEffects, 'failureEffects', errors);
  checkConditionsShape(payload.requires, 'requires', errors);
  if (payload.check !== undefined && !isRecord(payload.check)) {
    errors.push('check 必须是对象');
  }
}

function validateDialogue(
  payload: Record<string, unknown>,
  errors: string[],
): void {
  requireString(payload.id, 'payload.id', errors);
  requireString(payload.startNodeId, 'payload.startNodeId', errors);
  if (!isRecord(payload.nodes) || Object.keys(payload.nodes).length === 0) {
    errors.push('payload.nodes 至少需要一个节点');
    return;
  }
  const nodes = payload.nodes;
  for (const [id, rawNode] of Object.entries(nodes)) {
    if (!isRecord(rawNode)) {
      errors.push(`nodes.${id} 必须是对象`);
      continue;
    }
    requireString(rawNode.text, `nodes.${id}.text`, errors);
    if (
      rawNode.nextNodeId !== undefined &&
      (typeof rawNode.nextNodeId !== 'string' || !nodes[rawNode.nextNodeId])
    ) {
      errors.push(`nodes.${id}.nextNodeId 不存在`);
    }
    if (rawNode.choices !== undefined) {
      if (!Array.isArray(rawNode.choices)) {
        errors.push(`nodes.${id}.choices 必须是数组`);
        continue;
      }
      for (const [index, choice] of rawNode.choices.entries()) {
        if (!isRecord(choice)) {
          errors.push(`nodes.${id}.choices[${index}] 必须是对象`);
          continue;
        }
        requireString(
          choice.label,
          `nodes.${id}.choices[${index}].label`,
          errors,
        );
        if (typeof choice.nextNodeId !== 'string' || !nodes[choice.nextNodeId]) {
          errors.push(`nodes.${id}.choices[${index}].nextNodeId 不存在`);
        }
        checkEffectsShape(
          choice.effects,
          `nodes.${id}.choices[${index}].effects`,
          errors,
        );
        checkConditionsShape(
          choice.requires,
          `nodes.${id}.choices[${index}].requires`,
          errors,
        );
      }
    }
    checkEffectsShape(rawNode.effects, `nodes.${id}.effects`, errors);
  }
  if (typeof payload.startNodeId === 'string' && !nodes[payload.startNodeId]) {
    errors.push('payload.startNodeId 不存在');
  }
}

function validateStory(payload: Record<string, unknown>, errors: string[]): void {
  requireString(payload.id, 'payload.id', errors);
  requireString(payload.idolId, 'payload.idolId', errors);
  if (payload.priority !== undefined && typeof payload.priority !== 'number') {
    errors.push('payload.priority 必须是数字');
  }
  if (!Array.isArray(payload.steps) || payload.steps.length === 0) {
    errors.push('payload.steps 至少需要一个步骤');
    return;
  }
  for (const [index, rawStep] of payload.steps.entries()) {
    if (!isRecord(rawStep)) {
      errors.push(`steps[${index}] 必须是对象`);
      continue;
    }
    requireString(rawStep.id, `steps[${index}].id`, errors);
    requireString(rawStep.locationId, `steps[${index}].locationId`, errors);
    requireString(rawStep.dialogueId, `steps[${index}].dialogueId`, errors);
    requireString(rawStep.actionLabel, `steps[${index}].actionLabel`, errors);
    // 收尾搬家（可选）：这一章演完把玩家放到另一处。
    // 只校验形状；目标地点是否存在由 content:anchors 查。
    if (rawStep.endLocationId !== undefined) {
      requireString(
        rawStep.endLocationId,
        `steps[${index}].endLocationId`,
        errors,
      );
    }
    if (rawStep.timeWindow !== undefined) {
      if (!isRecord(rawStep.timeWindow)) {
        errors.push(`steps[${index}].timeWindow 必须是对象`);
      } else {
        const from = rawStep.timeWindow.fromMinute;
        const to = rawStep.timeWindow.toMinute;
        if (
          typeof from !== 'number' ||
          typeof to !== 'number' ||
          from < 0 ||
          to > 1440 ||
          to <= from
        ) {
          errors.push(`steps[${index}].timeWindow 非法`);
        }
      }
    }
    checkConditionsShape(rawStep.when, `steps[${index}].when`, errors);
    checkEffectsShape(rawStep.effects, `steps[${index}].effects`, errors);
  }
}

const ITEM_CATEGORIES = ['gift', 'keepsake', 'consumable'] as const;
const EXP_TIERS = [1, 2, 3, 4, 5, 10, 20] as const;

function validateItem(payload: Record<string, unknown>, errors: string[]): void {
  requireString(payload.id, 'payload.id', errors);
  requireString(payload.name, 'payload.name', errors);
  if (typeof payload.description !== 'string') {
    errors.push('payload.description 必须是字符串');
  }
  if (
    typeof payload.category !== 'string' ||
    !(ITEM_CATEGORIES as readonly string[]).includes(payload.category)
  ) {
    errors.push(`payload.category 必须是 ${ITEM_CATEGORIES.join(' / ')} 之一`);
  }
  if (typeof payload.price !== 'number' || payload.price < 0) {
    errors.push('payload.price 必须是非负数字');
  }
  if (payload.shopId !== undefined && typeof payload.shopId !== 'string') {
    errors.push('payload.shopId 必须是字符串');
  }
  if (payload.maxPurchases !== undefined) {
    if (
      typeof payload.maxPurchases !== 'number' ||
      payload.maxPurchases <= 0
    ) {
      errors.push('payload.maxPurchases 必须是正数');
    }
  }
  if (payload.cooldownMinutes !== undefined) {
    if (
      typeof payload.cooldownMinutes !== 'number' ||
      payload.cooldownMinutes <= 0
    ) {
      errors.push('payload.cooldownMinutes 必须是正数');
    }
  }
  if (payload.useEffects !== undefined) {
    if (!Array.isArray(payload.useEffects)) {
      errors.push('payload.useEffects 必须是数组');
    } else {
      checkEffectsShape(payload.useEffects, 'payload.useEffects', errors);
    }
  }
  if (payload.gift !== undefined) {
    if (!isRecord(payload.gift)) {
      errors.push('payload.gift 必须是对象');
      return;
    }
    const gift = payload.gift;
    if (
      typeof gift.defaultTrustTier !== 'number' ||
      !(EXP_TIERS as readonly number[]).includes(gift.defaultTrustTier)
    ) {
      errors.push('gift.defaultTrustTier 必须是 1 / 2 / 3 / 4 / 5 / 10 / 20');
    }
    if (gift.preferences !== undefined) {
      if (!Array.isArray(gift.preferences)) {
        errors.push('gift.preferences 必须是数组');
      } else {
        for (const [index, raw] of gift.preferences.entries()) {
          if (!isRecord(raw)) {
            errors.push(`gift.preferences[${index}] 必须是对象`);
            continue;
          }
          requireString(raw.idolId, `gift.preferences[${index}].idolId`, errors);
          if (
            typeof raw.trustTier !== 'number' ||
            !(EXP_TIERS as readonly number[]).includes(raw.trustTier)
          ) {
            errors.push(
              `gift.preferences[${index}].trustTier 必须是 1 / 3 / 5 / 10 / 20`,
            );
          }
        }
      }
    }
  }
}

function validateShop(payload: Record<string, unknown>, errors: string[]): void {
  requireString(payload.id, 'payload.id', errors);
  requireString(payload.name, 'payload.name', errors);
  if (typeof payload.description !== 'string') {
    errors.push('payload.description 必须是字符串');
  }
  requireString(payload.locationId, 'payload.locationId', errors);
  if (!Array.isArray(payload.itemIds) || payload.itemIds.length === 0) {
    errors.push('payload.itemIds 至少需要一件商品');
  } else {
    for (const [index, id] of payload.itemIds.entries()) {
      if (typeof id !== 'string' || !id) {
        errors.push(`itemIds[${index}] 必须是非空字符串`);
      }
    }
  }
}


/** 话题：挂在某个角色身上的闲聊条目。 */
function validateTopic(payload: Record<string, unknown>, errors: string[]): void {
  requireString(payload.id, 'payload.id', errors);
  requireString(payload.actorId, 'payload.actorId', errors);
  requireString(payload.label, 'payload.label', errors);
  requireString(payload.text, 'payload.text', errors);
  if (!Array.isArray(payload.effects)) {
    errors.push('payload.effects 必须是数组（可以为空）');
  }
  if (payload.when !== undefined && !Array.isArray(payload.when)) {
    errors.push('payload.when 必须是条件数组');
  }
  if (
    payload.cooldownMinutes !== undefined &&
    (typeof payload.cooldownMinutes !== 'number' || payload.cooldownMinutes < 0)
  ) {
    errors.push('payload.cooldownMinutes 必须是非负数字');
  }
  if (payload.once !== undefined && typeof payload.once !== 'boolean') {
    errors.push('payload.once 必须是布尔值');
  }
}

const SHAPE_VALIDATORS: Record<
  string,
  (payload: Record<string, unknown>, errors: string[]) => void
> = {
  activity: validateActivity,
  event: validateEvent,
  job: validateJob,
  dialogue: validateDialogue,
  story: validateStory,
  item: validateItem,
  shop: validateShop,
  topic: validateTopic,
};

export function validateDraftShape(draft: ReviewDraft): string[] {
  const errors: string[] = [];
  if (!draft.id) errors.push('id 不能为空');
  if (!draft.title) errors.push('title 不能为空');

  const validateShape = SHAPE_VALIDATORS[draft.kind];
  if (!validateShape) {
    return [...errors, `kind 必须是 ${Object.keys(SHAPE_VALIDATORS).join(' / ')}`];
  }
  if (!isRecord(draft.payload)) {
    return [...errors, 'payload 必须是对象'];
  }
  validateShape(draft.payload, errors);
  return errors;
}

/** 保存草稿时允许"还没写完"，但不允许"写了个非法值"。 */
const INCOMPLETE_PATTERNS = [/不能为空$/, /至少需要/];

const EXP_TIER_HINT = `${EXP_TIERS.join(' / ')}（ExpTier）`;

function collectBadTiers(value: unknown, base: string, out: string[]): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectBadTiers(item, `${base}[${index}]`, out));
    return;
  }
  if (!isRecord(value)) return;
  if (value.kind === 'attributeExp' && 'tier' in value) {
    const tier = value.tier;
    if (
      typeof tier !== 'number' ||
      !(EXP_TIERS as readonly number[]).includes(tier)
    ) {
      out.push(
        `${base || 'payload'}.tier = ${String(tier)} —— tier 必须是 ${EXP_TIER_HINT}`,
      );
    }
  }
  for (const [key, item] of Object.entries(value)) {
    collectBadTiers(item, base === '' ? key : `${base}.${key}`, out);
  }
}

/**
 * 保存草稿时的校验：**缺字段放行，非法值拦住**。
 *
 * 为什么不能直接用 `validateDraftShape`：草稿是一步步写出来的，
 * 刚新建时 id/正文都是空的，硬拦就没法编辑了。
 * 为什么要把 tier 单拎出来：`tier: 7` 这种值要等 `tsc` 编译生成文件才报，
 * 报错位置看起来像生成器的锅（事故 #34）。这里用 `ExpTier` 的同一份常量查。
 */
export function validateDraftForSave(draft: ReviewDraft): {
  errors: string[];
  incomplete: string[];
} {
  const errors: string[] = [];
  const incomplete: string[] = [];
  for (const message of validateDraftShape(draft)) {
    const target = INCOMPLETE_PATTERNS.some((pattern) => pattern.test(message))
      ? incomplete
      : errors;
    target.push(message);
  }
  if (isRecord(draft.payload)) collectBadTiers(draft.payload, '', errors);
  return { errors, incomplete };
}

export function validateReviewDraft(
  draft: ReviewDraft,
  base: ContentPack,
): ReviewValidation {
  const errors = validateDraftShape(draft);
  const warnings: string[] = [];
  const approved = packApprovedFiles({ [draft.id]: draft });

  try {
    const { pack, duplicates } = mergeApprovedContent(base, approved);
    for (const duplicate of duplicates) {
      errors.push(`ID 与现有内容重复：${duplicate}`);
    }
    for (const issue of auditPack(buildContentIndex(pack), {
      skipPackRules: true,
    })) {
      const line = `${issue.level === 'error' ? '[错误]' : '[警告]'} ${issue.code}: ${issue.message}`;
      if (issue.level === 'error') errors.push(line);
      else warnings.push(line);
    }
  } catch (error) {
    // 结构坏到体检跑不动时，结构错误已经在上面了，这里只补一句说明。
    errors.push(
      `内容体检无法执行：${error instanceof Error ? error.message : String(error)}`,
    );
  }

  // 语言检查：整句日文没翻。和体检同一条路：警告不阻塞，等人判断。
  const japanese = findJapaneseLines(draft.payload);
  for (const line of japanese.slice(0, 12)) warnings.push(describeJapaneseLine(line));
  if (japanese.length > 12) {
    warnings.push(`[警告] japanese-text: 还有 ${japanese.length - 12} 行疑似未翻译，先用 content:drafts 全量看`);
  }

  return { ok: errors.length === 0, errors, warnings };
}
