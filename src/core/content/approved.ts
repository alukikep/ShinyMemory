import type { EventDef, JobDef } from '../types';

type JsonModule = { default: unknown };

const modules = import.meta.glob<JsonModule>(
  '../../../content-review/approved/*.json',
  { eager: true, import: 'default' },
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function payloadOf(value: unknown): unknown {
  if (isRecord(value) && 'payload' in value) return value.payload;
  return value;
}

function isEventDef(value: unknown): value is EventDef {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.text === 'string' &&
    Array.isArray(value.when) &&
    Array.isArray(value.choices) &&
    value.choices.length > 0
  );
}

function isJobDef(value: unknown): value is JobDef {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.description === 'string' &&
    typeof value.locationId === 'string' &&
    typeof value.fromMinute === 'number' &&
    typeof value.toMinute === 'number' &&
    typeof value.pay === 'number'
  );
}

const values = Object.values(modules).map((module) => payloadOf(module.default));

export const APPROVED_EVENTS: EventDef[] = values.filter(isEventDef);
export const APPROVED_JOBS: JobDef[] = values.filter(isJobDef);
