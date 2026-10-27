import type { IdolStatus } from '../types';

// Content-owned starting configuration. The production game starts with a
// short office prologue and no recruited idol.
export const STARTING_STATE = {
  activeIdolId: 'mano',
  idolStatus: {
    mano: 'unknown',
  } as Record<string, IdolStatus>,
  dialogueId: 'dialogue.prologue.office',
} as const;
