import type {
  DialogueDef,
  EventDef,
  JobDef,
  StoryChainDef,
} from '../types';

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

function isDialogueDef(value: unknown): value is DialogueDef {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.idolId === 'string' &&
    typeof value.startNodeId === 'string' &&
    isRecord(value.nodes) &&
    Object.keys(value.nodes).length > 0
  );
}

function isStoryChainDef(value: unknown): value is StoryChainDef {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.idolId === 'string' &&
    Array.isArray(value.steps) &&
    value.steps.length > 0
  );
}

const values = Object.values(modules).map((module) => payloadOf(module.default));

export const APPROVED_EVENTS: EventDef[] = values.filter(isEventDef);
export const APPROVED_JOBS: JobDef[] = values.filter(isJobDef);
export const APPROVED_DIALOGUES: DialogueDef[] = values.filter(isDialogueDef);
export const APPROVED_STORY_CHAINS: StoryChainDef[] =
  values.filter(isStoryChainDef);
