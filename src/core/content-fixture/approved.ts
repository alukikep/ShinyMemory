import type {
  DialogueDef,
  EventDef,
  JobDef,
  StoryChainDef,
} from '../types';

// The frozen fixture pack does not read content-review outputs. Approved
// production content must not be able to change unit-test behavior.
export const APPROVED_EVENTS: EventDef[] = [];
export const APPROVED_JOBS: JobDef[] = [];
export const APPROVED_DIALOGUES: DialogueDef[] = [];
export const APPROVED_STORY_CHAINS: StoryChainDef[] = [];
