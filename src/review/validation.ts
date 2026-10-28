import { IDOLS } from '../core/content/idols/index.js';
import { LOCATIONS } from '../core/content/locations/index.js';
import type { ReviewDraft } from './types.js';

const LOCATION_IDS = new Set(LOCATIONS.map((location) => location.id));
const IDOL_IDS = new Set(IDOLS.map((idol) => idol.id));

const EFFECT_KINDS = new Set([
  'sharedStat',
  'attributeExp',
  'money',
  'flag',
  'actorAffinity',
  'log',
]);

const CONDITION_KINDS = new Set([
  'dayAtLeast',
  'weekAtLeast',
  'timeWindow',
  'sharedStatAtLeast',
  'sharedStatAtMost',
  'attributeAtLeast',
  'attributeAtMost',
  'npcAffinityAtLeast',
  'npcAffinityAtMost',
  'moneyAtMost',
  'atLocation',
  'flag',
  'all',
  'any',
  'not',
]);

export type ReviewValidation = {
  ok: boolean;
  errors: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function checkConditions(
  value: unknown,
  errors: string[],
  label: string,
): void {
  if (value === undefined) return;
  if (!Array.isArray(value)) {
    errors.push(`${label} 必须是数组`);
    return;
  }
  for (const [index, condition] of value.entries()) {
    if (!isRecord(condition) || typeof condition.kind !== 'string') {
      errors.push(`${label}[${index}] 缺少 kind`);
      continue;
    }
    if (!CONDITION_KINDS.has(condition.kind)) {
      errors.push(`${label}[${index}] 未知条件 ${condition.kind}`);
    }
    if (
      condition.kind === 'atLocation' &&
      typeof condition.locationId === 'string' &&
      !LOCATION_IDS.has(condition.locationId)
    ) {
      errors.push(`${label}[${index}] 地点不存在：${condition.locationId}`);
    }
  }
}

function checkEffects(value: unknown, errors: string[], label: string): void {
  if (value === undefined) return;
  if (!Array.isArray(value)) {
    errors.push(`${label} 必须是数组`);
    return;
  }
  for (const [index, effect] of value.entries()) {
    if (!isRecord(effect) || typeof effect.kind !== 'string') {
      errors.push(`${label}[${index}] 缺少 kind`);
      continue;
    }
    if (!EFFECT_KINDS.has(effect.kind)) {
      errors.push(`${label}[${index}] 未知效果 ${effect.kind}`);
    }
  }
}

function validateEvent(
  payload: Record<string, unknown>,
  errors: string[],
): void {
  if (typeof payload.id !== 'string' || payload.id.length === 0) {
    errors.push('payload.id 不能为空');
  }
  if (typeof payload.title !== 'string' || payload.title.length === 0) {
    errors.push('payload.title 不能为空');
  }
  if (typeof payload.text !== 'string' || payload.text.length === 0) {
    errors.push('payload.text 不能为空');
  }
  if (!Array.isArray(payload.choices) || payload.choices.length === 0) {
    errors.push('事件至少需要一个选项');
  } else {
    for (const [index, choice] of payload.choices.entries()) {
      if (!isRecord(choice)) {
        errors.push(`choices[${index}] 必须是对象`);
        continue;
      }
      if (typeof choice.label !== 'string' || choice.label.length === 0) {
        errors.push(`choices[${index}].label 不能为空`);
      }
      if (typeof choice.result !== 'string' || choice.result.length === 0) {
        errors.push(`choices[${index}].result 不能为空`);
      }
      checkEffects(choice.effects, errors, `choices[${index}].effects`);
      checkConditions(choice.requires, errors, `choices[${index}].requires`);
    }
  }
  checkConditions(payload.when, errors, 'when');
  if (payload.after !== undefined && !isRecord(payload.after)) {
    errors.push('after 必须是对象');
  }
}

function validateJob(
  payload: Record<string, unknown>,
  errors: string[],
): void {
  if (typeof payload.id !== 'string' || payload.id.length === 0) {
    errors.push('payload.id 不能为空');
  }
  if (typeof payload.name !== 'string' || payload.name.length === 0) {
    errors.push('payload.name 不能为空');
  }
  if (typeof payload.description !== 'string') {
    errors.push('payload.description 必须是字符串');
  }
  if (
    typeof payload.locationId !== 'string' ||
    !LOCATION_IDS.has(payload.locationId)
  ) {
    errors.push('payload.locationId 必须是已存在的地点');
  }
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
  checkEffects(payload.effects, errors, 'effects');
}

function validateDialogue(
  payload: Record<string, unknown>,
  errors: string[],
): void {
  if (typeof payload.id !== 'string' || payload.id.length === 0) {
    errors.push('payload.id 不能为空');
  }
  if (typeof payload.idolId !== 'string' || !IDOL_IDS.has(payload.idolId)) {
    errors.push('payload.idolId 必须是已存在的偶像');
  }
  if (typeof payload.startNodeId !== 'string' || !payload.startNodeId) {
    errors.push('payload.startNodeId 不能为空');
  }
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
    if (typeof rawNode.text !== 'string' || rawNode.text.trim().length === 0) {
      errors.push(`nodes.${id}.text 不能为空`);
    }
    if (
      rawNode.nextNodeId !== undefined &&
      (typeof rawNode.nextNodeId !== 'string' || !nodes[rawNode.nextNodeId])
    ) {
      errors.push(`nodes.${id}.nextNodeId 不存在`);
    }
    if (rawNode.choices !== undefined) {
      if (!Array.isArray(rawNode.choices)) {
        errors.push(`nodes.${id}.choices 必须是数组`);
      } else {
        for (const [index, choice] of rawNode.choices.entries()) {
          if (!isRecord(choice)) {
            errors.push(`nodes.${id}.choices[${index}] 必须是对象`);
            continue;
          }
          if (typeof choice.label !== 'string' || !choice.label.trim()) {
            errors.push(`nodes.${id}.choices[${index}].label 不能为空`);
          }
          if (
            typeof choice.nextNodeId !== 'string' ||
            !nodes[choice.nextNodeId]
          ) {
            errors.push(`nodes.${id}.choices[${index}].nextNodeId 不存在`);
          }
          checkEffects(
            choice.effects,
            errors,
            `nodes.${id}.choices[${index}].effects`,
          );
          checkConditions(
            choice.requires,
            errors,
            `nodes.${id}.choices[${index}].requires`,
          );
        }
      }
    }
  }
  if (typeof payload.startNodeId === 'string' && !nodes[payload.startNodeId]) {
    errors.push('payload.startNodeId 不存在');
  }
}

function validateStory(
  payload: Record<string, unknown>,
  errors: string[],
): void {
  if (typeof payload.id !== 'string' || payload.id.length === 0) {
    errors.push('payload.id 不能为空');
  }
  if (typeof payload.idolId !== 'string' || !IDOL_IDS.has(payload.idolId)) {
    errors.push('payload.idolId 必须是已存在的偶像');
  }
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
    if (typeof rawStep.id !== 'string' || !rawStep.id) {
      errors.push(`steps[${index}].id 不能为空`);
    }
    if (
      typeof rawStep.locationId !== 'string' ||
      !LOCATION_IDS.has(rawStep.locationId)
    ) {
      errors.push(`steps[${index}].locationId 必须是已存在的地点`);
    }
    if (typeof rawStep.dialogueId !== 'string' || !rawStep.dialogueId) {
      errors.push(`steps[${index}].dialogueId 不能为空`);
    }
    if (typeof rawStep.actionLabel !== 'string' || !rawStep.actionLabel.trim()) {
      errors.push(`steps[${index}].actionLabel 不能为空`);
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
  }
}

export function validateReviewDraft(draft: ReviewDraft): ReviewValidation {
  const errors: string[] = [];
  if (!draft.id) errors.push('id 不能为空');
  if (!draft.title) errors.push('title 不能为空');
  if (
    draft.kind !== 'event' &&
    draft.kind !== 'job' &&
    draft.kind !== 'dialogue' &&
    draft.kind !== 'story'
  ) {
    errors.push('kind 必须是 event、job、dialogue 或 story');
  }
  if (!isRecord(draft.payload)) {
    errors.push('payload 必须是对象');
  } else if (draft.kind === 'event') {
    validateEvent(draft.payload, errors);
  } else if (draft.kind === 'job') {
    validateJob(draft.payload, errors);
  } else if (draft.kind === 'dialogue') {
    validateDialogue(draft.payload, errors);
  } else if (draft.kind === 'story') {
    validateStory(draft.payload, errors);
  }

  return { ok: errors.length === 0, errors };
}


