export type ReviewStatus = 'review' | 'revision' | 'approved' | 'discarded';

export type ReviewKind =
  | 'activity'
  | 'event'
  | 'job'
  | 'dialogue'
  | 'story'
  | 'item'
  | 'shop';

export type ReviewAnnotation = {
  id: string;
  text: string;
  field?: string;
  createdAt: string;
  resolved?: boolean;
};

export type ReviewHistoryEntry = {
  status: ReviewStatus;
  at: string;
  note?: string;
};

export type ReviewDraft = {
  id: string;
  kind: ReviewKind;
  title: string;
  status: ReviewStatus;
  version?: number;
  rootId?: string;
  supersedes?: string;
  payload: unknown;
  annotations: ReviewAnnotation[];
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  history?: ReviewHistoryEntry[];
};
