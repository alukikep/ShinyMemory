import type { ReviewDraft } from './types';

export interface ReviewRepository {
  list(): Promise<ReviewDraft[]>;
  get(id: string): Promise<ReviewDraft | undefined>;
}

export class LocalReviewRepository implements ReviewRepository {
  async list(): Promise<ReviewDraft[]> {
    const response = await fetch('/api/review/drafts', {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`审查列表读取失败：${response.status}`);
    }
    const body = (await response.json()) as { drafts?: ReviewDraft[] };
    return body.drafts ?? [];
  }

  async get(id: string): Promise<ReviewDraft | undefined> {
    const response = await fetch(`/api/review/drafts/${encodeURIComponent(id)}`, {
      headers: { Accept: 'application/json' },
    });
    if (response.status === 404) return undefined;
    if (!response.ok) {
      throw new Error(`审查内容读取失败：${response.status}`);
    }
    const body = (await response.json()) as { draft?: ReviewDraft };
    return body.draft;
  }
}
