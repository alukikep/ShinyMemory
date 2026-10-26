import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';
import type { ReviewKind, ReviewStatus } from '../src/review/types.js';
import { validateReviewDraft } from '../src/review/validation.js';
import {
  createReviewDraft,
  getReviewDraft,
  listReviewDrafts,
  moveReviewDraft,
  reviseReviewDraft,
  saveReviewDraft,
} from './reviewStore.js';

const STATUSES = new Set<ReviewStatus>([
  'review',
  'revision',
  'approved',
  'discarded',
]);

function sendJson(response: ServerResponse, status: number, body: unknown): void {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.end(JSON.stringify(body));
}

async function readJson(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += buffer.length;
    if (total > 1_000_000) throw new Error('payload too large');
    chunks.push(buffer);
  }
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function reviewApiPlugin(): Plugin {
  return {
    name: 'shiny-memory-review-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/review', async (request, response, next) => {
        try {
          const pathname = (request.url ?? '/').split('?')[0] ?? '/';
          const parts = pathname.split('/').filter(Boolean);

          if (request.method === 'GET') {
            if (parts.length === 0 || (parts.length === 1 && parts[0] === 'drafts')) {
              sendJson(response, 200, { drafts: await listReviewDrafts() });
              return;
            }
            if (parts[0] === 'drafts' && parts[1]) {
              const draft = await getReviewDraft(decodeURIComponent(parts[1]));
              if (!draft) {
                sendJson(response, 404, { error: 'draft not found' });
                return;
              }
              sendJson(response, 200, { draft });
              return;
            }
          }

          if (request.method === 'POST' && parts[0] === 'drafts' && parts.length === 1) {
            const body = await readJson(request);
            if (!isRecord(body)) {
              sendJson(response, 400, { error: 'body must be an object' });
              return;
            }
            const kind = body.kind;
            if (kind !== 'event' && kind !== 'job') {
              sendJson(response, 400, { error: 'kind must be event or job' });
              return;
            }
            const title = typeof body.title === 'string' ? body.title : '';
            const draft = await createReviewDraft(kind as ReviewKind, title);
            sendJson(response, 201, { draft });
            return;
          }

          if (parts[0] !== 'drafts' || !parts[1]) {
            next();
            return;
          }

          const id = decodeURIComponent(parts[1]);

          if (request.method === 'PUT' && parts.length === 2) {
            const current = await getReviewDraft(id);
            if (!current) {
              sendJson(response, 404, { error: 'draft not found' });
              return;
            }
            if (current.status === 'approved' || current.status === 'discarded') {
              sendJson(response, 409, { error: 'approved/discarded draft is locked' });
              return;
            }
            const body = await readJson(request);
            if (!isRecord(body)) {
              sendJson(response, 400, { error: 'body must be an object' });
              return;
            }
            const draft = await saveReviewDraft(id, {
              title: typeof body.title === 'string' ? body.title : undefined,
              payload: body.payload,
              annotations: Array.isArray(body.annotations)
                ? (body.annotations as never)
                : undefined,
            });
            sendJson(response, 200, { draft });
            return;
          }

          if (request.method === 'POST' && parts[2] === 'revise') {
            const current = await getReviewDraft(id);
            if (!current) {
              sendJson(response, 404, { error: 'draft not found' });
              return;
            }
            if (current.status !== 'approved') {
              sendJson(response, 409, { error: 'only approved drafts can be revised' });
              return;
            }
            const draft = await reviseReviewDraft(id);
            sendJson(response, 201, { draft });
            return;
          }

          if (request.method === 'POST' && parts[2] === 'status') {
            const body = await readJson(request);
            if (!isRecord(body) || typeof body.status !== 'string') {
              sendJson(response, 400, { error: 'status is required' });
              return;
            }
            if (!STATUSES.has(body.status as ReviewStatus)) {
              sendJson(response, 400, { error: 'unknown status' });
              return;
            }
            const current = await getReviewDraft(id);
            if (!current) {
              sendJson(response, 404, { error: 'draft not found' });
              return;
            }
            if (current.status === 'approved' || current.status === 'discarded') {
              sendJson(response, 409, { error: 'approved/discarded draft is locked' });
              return;
            }
            if (body.status === 'approved') {
              const validation = validateReviewDraft(current);
              if (!validation.ok) {
                sendJson(response, 422, {
                  error: 'draft is not valid',
                  errors: validation.errors,
                });
                return;
              }
            }
            const draft = await moveReviewDraft(
              id,
              body.status as ReviewStatus,
              typeof body.note === 'string' ? body.note : undefined,
            );
            if (body.status === 'approved' && current.supersedes) {
              const previous = await getReviewDraft(current.supersedes);
              if (previous?.status === 'approved') {
                await moveReviewDraft(
                  previous.id,
                  'discarded',
                  `已被 ${draft.id}（v${draft.version ?? 1}）替换`,
                );
              }
            }
            sendJson(response, 200, { draft });
            return;
          }

          if (request.method === 'POST' && parts[2] === 'annotations') {
            const body = await readJson(request);
            if (!isRecord(body) || typeof body.text !== 'string' || !body.text.trim()) {
              sendJson(response, 400, { error: 'annotation text is required' });
              return;
            }
            const current = await getReviewDraft(id);
            if (!current) {
              sendJson(response, 404, { error: 'draft not found' });
              return;
            }
            if (current.status === 'approved' || current.status === 'discarded') {
              sendJson(response, 409, { error: 'approved/discarded draft is locked' });
              return;
            }
            const annotation = {
              id: `note-${Date.now()}`,
              text: body.text.trim(),
              field: typeof body.field === 'string' && body.field.trim()
                ? body.field.trim()
                : undefined,
              createdAt: new Date().toISOString(),
              resolved: false,
            };
            const draft = await saveReviewDraft(id, {
              annotations: [...current.annotations, annotation],
            });
            sendJson(response, 200, { draft });
            return;
          }

          if (
            request.method === 'PATCH' &&
            parts[2] === 'annotations' &&
            parts[3]
          ) {
            const body = await readJson(request);
            const current = await getReviewDraft(id);
            if (!current) {
              sendJson(response, 404, { error: 'draft not found' });
              return;
            }
            if (current.status === 'approved' || current.status === 'discarded') {
              sendJson(response, 409, { error: 'approved/discarded draft is locked' });
              return;
            }
            const annotationId = decodeURIComponent(parts[3]);
            const annotations = current.annotations.map((annotation) =>
              annotation.id === annotationId
                ? {
                    ...annotation,
                    resolved:
                      isRecord(body) && typeof body.resolved === 'boolean'
                        ? body.resolved
                        : true,
                  }
                : annotation,
            );
            const draft = await saveReviewDraft(id, { annotations });
            sendJson(response, 200, { draft });
            return;
          }

          next();
        } catch (error) {
          sendJson(response, 500, {
            error: error instanceof Error ? error.message : 'review API error',
          });
        }
      });
    },
  };
}
