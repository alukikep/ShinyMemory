import type { ReviewAnnotation, ReviewDraft, ReviewKind, ReviewStatus } from './types';

export class ReviewApiError extends Error {
  readonly errors: string[];

  constructor(message: string, errors: string[] = []) {
    super(message);
    this.name = 'ReviewApiError';
    this.errors = errors;
  }
}

async function readError(response: Response): Promise<ReviewApiError> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return new ReviewApiError(`审查请求失败：${response.status}`);
  }
  const record =
    typeof body === 'object' && body !== null
      ? (body as Record<string, unknown>)
      : {};
  return new ReviewApiError(
    typeof record.error === 'string'
      ? record.error
      : `审查请求失败：${response.status}`,
    Array.isArray(record.errors)
      ? record.errors.filter((item): item is string => typeof item === 'string')
      : [],
  );
}

export interface ReviewRepository {
  list(): Promise<ReviewDraft[]>;
  get(id: string): Promise<ReviewDraft | undefined>;
  create(kind: ReviewKind, title: string): Promise<ReviewDraft>;
  save(
    id: string,
    patch: {
      title?: string;
      payload?: unknown;
      annotations?: ReviewAnnotation[];
    },
  ): Promise<ReviewDraft>;
  setStatus(
    id: string,
    status: ReviewStatus,
    note?: string,
  ): Promise<ReviewDraft>;
  revise(id: string): Promise<ReviewDraft>;
  addAnnotation(
    id: string,
    text: string,
    field?: string,
  ): Promise<ReviewDraft>;
  resolveAnnotation(
    id: string,
    annotationId: string,
    resolved: boolean,
  ): Promise<ReviewDraft>;
}

export class LocalReviewRepository implements ReviewRepository {
  async list(): Promise<ReviewDraft[]> {
    const response = await fetch('/api/review/drafts', {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw await readError(response);
    const body = (await response.json()) as { drafts?: ReviewDraft[] };
    return body.drafts ?? [];
  }

  async get(id: string): Promise<ReviewDraft | undefined> {
    const response = await fetch(`/api/review/drafts/${encodeURIComponent(id)}`, {
      headers: { Accept: 'application/json' },
    });
    if (response.status === 404) return undefined;
    if (!response.ok) throw await readError(response);
    const body = (await response.json()) as { draft?: ReviewDraft };
    return body.draft;
  }

  async create(kind: ReviewKind, title: string): Promise<ReviewDraft> {
    const response = await fetch('/api/review/drafts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, title }),
    });
    if (!response.ok) throw await readError(response);
    const body = (await response.json()) as { draft: ReviewDraft };
    return body.draft;
  }

  async save(
    id: string,
    patch: {
      title?: string;
      payload?: unknown;
      annotations?: ReviewAnnotation[];
    },
  ): Promise<ReviewDraft> {
    const response = await fetch(`/api/review/drafts/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!response.ok) throw await readError(response);
    const body = (await response.json()) as { draft: ReviewDraft };
    return body.draft;
  }

  async setStatus(
    id: string,
    status: ReviewStatus,
    note?: string,
  ): Promise<ReviewDraft> {
    const response = await fetch(
      `/api/review/drafts/${encodeURIComponent(id)}/status`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note }),
      },
    );
    if (!response.ok) throw await readError(response);
    const body = (await response.json()) as { draft: ReviewDraft };
    return body.draft;
  }

  async setStatusBatch(
    ids: string[],
    status: ReviewStatus,
    note?: string,
  ): Promise<ReviewDraft[]> {
    const response = await fetch('/api/review/drafts/batch/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, status, note }),
    });
    if (!response.ok) throw await readError(response);
    const body = (await response.json()) as { drafts: ReviewDraft[] };
    return body.drafts;
  }

  async revise(id: string): Promise<ReviewDraft> {
    const response = await fetch(
      `/api/review/drafts/${encodeURIComponent(id)}/revise`,
      { method: 'POST' },
    );
    if (!response.ok) throw await readError(response);
    const body = (await response.json()) as { draft: ReviewDraft };
    return body.draft;
  }

  async addAnnotation(
    id: string,
    text: string,
    field?: string,
  ): Promise<ReviewDraft> {
    const response = await fetch(
      `/api/review/drafts/${encodeURIComponent(id)}/annotations`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, field }),
      },
    );
    if (!response.ok) throw await readError(response);
    const body = (await response.json()) as { draft: ReviewDraft };
    return body.draft;
  }

  async resolveAnnotation(
    id: string,
    annotationId: string,
    resolved: boolean,
  ): Promise<ReviewDraft> {
    const response = await fetch(
      `/api/review/drafts/${encodeURIComponent(id)}/annotations/${encodeURIComponent(annotationId)}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolved }),
      },
    );
    if (!response.ok) throw await readError(response);
    const body = (await response.json()) as { draft: ReviewDraft };
    return body.draft;
  }
}
