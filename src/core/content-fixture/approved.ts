import type { EventDef, JobDef } from '../types';

// The frozen fixture pack does not read content-review outputs. Approved
// production content must not be able to change unit-test behavior.
export const APPROVED_EVENTS: EventDef[] = [];
export const APPROVED_JOBS: JobDef[] = [];
