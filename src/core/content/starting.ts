import type { IdolStatus } from '../types';

// Content-owned starting configuration. Change this when the active roster or
// prologue changes; the engine should not hardcode individual idol IDs.
export const STARTING_STATE = {
  activeIdolId: 'mano',
  idolStatus: {
    mano: 'recruited',
    hiori: 'unknown',
  } satisfies Record<string, IdolStatus>,
} as const;
