export type ReviewStatus = 'review' | 'revision' | 'approved' | 'discarded';

/** 唯一的 kind 清单：类型、校验、工具脚本都从这里取，不要再抄一份。 */
export const REVIEW_KINDS = [
  'activity',
  'event',
  'job',
  'dialogue',
  'story',
  'item',
  'shop',
] as const;

export type ReviewKind = (typeof REVIEW_KINDS)[number];

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
