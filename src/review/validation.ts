import { LOCATIONS } from '../core/content/locations/index.js';
import type { ReviewDraft } from './types.js';

const LOCATION_IDS = new Set(LOCATIONS.map((location) => location.id));

const EFFECT_KINDS = new Set([
  'sharedStat',
  'idolExp',
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
  'rankAtLeast',
  'rankAtMost',
  'npcAffinityAtLeast',
  'npcAffinityAtMost',
  'moneyAtMost',
  'atLocation',
  'flag',
  'scoreAtLeast',
  'scoreAtMost',
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

export function validateReviewDraft(draft: ReviewDraft): ReviewValidation {
  const errors: string[] = [];
  if (!draft.id) errors.push('id 不能为空');
  if (!draft.title) errors.push('title 不能为空');
  if (draft.kind !== 'event' && draft.kind !== 'job') {
    errors.push('kind 必须是 event 或 job');
  }
  if (!isRecord(draft.payload)) {
    errors.push('payload 必须是对象');
  } else if (draft.kind === 'event') {
    validateEvent(draft.payload, errors);
  } else if (draft.kind === 'job') {
    validateJob(draft.payload, errors);
  }

  return { ok: errors.length === 0, errors };
}


