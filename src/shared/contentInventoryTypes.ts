import type { ChapterSource } from '../core/chapterAnchors';
import type { ReviewKind } from '../review/types';

/** JSON contract shared by the pure projection, local service, CLI and review UI. */
export type InventorySnapshot = {
  file: string;
  status: 'approved' | 'review' | 'revision';
  draft: { id: string; kind: ReviewKind; title: string; payload: unknown;
    version?: number; rootId?: string; supersedes?: string };
};
export type InventoryRelation = { idolId: string; role: 'exclusive' | 'participant' | 'condition' | 'reference'; path: string };
export type InventoryVersion = {
  file: string; approval: InventorySnapshot['status'] | 'structure';
  integration: 'integrated' | 'not-integrated'; reason?: string;
  draftId?: string; version?: number; rootId?: string; supersedes?: string;
  relations: InventoryRelation[];
};
export type InventoryEntry = {
  key: string; id: string; kind: ReviewKind; title: string;
  relations: InventoryRelation[]; scope: 'associated' | 'shared' | 'unresolved';
  integrated: boolean; versions: InventoryVersion[];
  storyType?: 'card' | 'recruitment' | 'arc' | 'unclassified';
  chapters?: { id: string; dialogueId: string; available: boolean; integrated: boolean; source?: ChapterSource; script?: string }[];
};
export type InventoryCard = {
  key: string; idolId: string; title: string; expected: number; chainIds: string[];
  chapters: { index: number; id: string; available: boolean; integrated: boolean }[];
  integrated: boolean;
};
export type InventoryCounts = {
  dateScenarios: number;
  cards: number; integratedCards: number; cardChapters: number; registeredCardChapters: number;
  availableCardChapters: number; integratedCardChapters: number;
  recruitment: number; arcs: number; exclusiveActions: number; participantActions: number;
  topics: number; dialogues: number; participantDialogues: number;
  exclusiveEvents: number; participantEvents: number; conditionEvents: number; pending: number;
};
export type InventoryIdol = { id: string; name: string; counts: InventoryCounts; keys: string[]; pendingKeys: string[] };
export type InventoryProjection = {
  dateScenarios: { id: string; title: string; idolId: string; locationId: string; dialogueId: string; file: string; integrated: boolean; problems: string[] }[];
  schemaVersion: 1; basis: string; idols: InventoryIdol[]; cards: InventoryCard[];
  entries: InventoryEntry[]; sharedKeys: string[]; unresolvedKeys: string[]; warnings: string[];
};
export type InventoryReport = InventoryProjection & { history: Record<string, number> };
