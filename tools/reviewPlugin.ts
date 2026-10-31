import type { IncomingMessage, ServerResponse } from 'node:http';
import { readdir, readFile, rename } from 'node:fs/promises';
import path from 'node:path';
import type { Plugin } from 'vite';
import type { ReviewDraft, ReviewKind, ReviewStatus } from '../src/review/types.js';
import { REVIEW_KINDS } from '../src/review/types.js';
import { mergeApprovedContent } from '../src/review/approval.js';
import { validateReviewDraft } from '../src/review/validation.js';
import { packApprovedFiles } from '../src/core/content/approvedPacking.js';
import { BASE_PACK } from '../src/core/content/basePack.js';
import { readApprovedDrafts } from './approvedFiles.js';
import { syncApprovedContent } from './syncApproved.js';
import {
  createReviewDraft,
  getReviewDraft,
  listReviewDrafts,
  moveReviewDraft,
  moveReviewDrafts,
  reviseReviewDraft,
  saveReviewDraft,
} from './reviewStore.js';

/**
 * 校验时要能看到“已经通过的兄弟内容”：一条剧情链引用五分钟前刚过的对话，
 * 必须能过审。所以基准包 = 生产内容 + 所有 approved（排除正在审的这份，
 * 以及它要替换的旧版本——旧版本通过前和新版本共用同一个 payload id）。
 */
async function basePackFor(excludeIds: string[]) {
  const skip = new Set(excludeIds.filter(Boolean));
  const drafts = await readApprovedDrafts();
  const approved = packApprovedFiles(
    Object.fromEntries(
      drafts
        .filter(
          ({ draft }) =>
            // supersedes 里写的可能是"内容 id"（activity.daily_errand），
            // 也可能是"草稿 id"（draft.activity.daily_errand.v2）——两种都要排除，
            // 否则旧版还留在基准包里，报"ID 与现有内容重复"。
            !skip.has(draft.id) &&
            !skip.has(String((draft.payload as { id?: string } | undefined)?.id ?? '')),
        )
        .map(({ file, draft }) => [file, draft]),
    ),
  );
  return mergeApprovedContent(BASE_PACK, approved).pack;
}

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
            if (
              typeof kind !== 'string' ||
              !(REVIEW_KINDS as readonly string[]).includes(kind)
            ) {
              sendJson(response, 400, {
                error: `kind must be one of ${REVIEW_KINDS.join(', ')}`,
              });
              return;
            }
            const title = typeof body.title === 'string' ? body.title : '';
            const draft = await createReviewDraft(kind as ReviewKind, title);
            sendJson(response, 201, { draft });
            return;
          }

          if (
            parts[0] === 'drafts' &&
            parts[1] === 'batch' &&
            parts[2] === 'status' &&
            request.method === 'POST'
          ) {
            const body = await readJson(request);
            if (
              !isRecord(body) ||
              !Array.isArray(body.ids) ||
              typeof body.status !== 'string'
            ) {
              sendJson(response, 400, { error: 'ids and status are required' });
              return;
            }
            if (!STATUSES.has(body.status as ReviewStatus)) {
              sendJson(response, 400, { error: 'unknown status' });
              return;
            }
            const ids = body.ids.filter(
              (value): value is string => typeof value === 'string',
            );
            // 先全部校验，再统一移动——不允许"半章通过"。
            const errors: string[] = [];
            const drafts: ReviewDraft[] = [];
            for (const id of ids) {
              const current = await getReviewDraft(id);
              if (!current) {
                errors.push(`${id}: 草稿不存在`);
                continue;
              }
              if (
                current.status === 'approved' ||
                current.status === 'discarded'
              ) {
                errors.push(`${id}: 已锁定`);
                continue;
              }
              if (body.status === 'approved') {
                const validation = validateReviewDraft(
                  current,
                  await basePackFor([current.id, current.supersedes ?? '']),
                );
                if (!validation.ok) {
                  errors.push(...validation.errors.map((e) => `${id}: ${e}`));
                  continue;
                }
              }
              drafts.push(current);
            }
            if (errors.length > 0) {
              sendJson(response, 422, { error: 'batch validation failed', errors });
              return;
            }
            const moved = await moveReviewDrafts(
              drafts.map((draft) => draft.id),
              body.status as ReviewStatus,
              typeof body.note === 'string' ? body.note : undefined,
            );
            sendJson(response, 200, { drafts: moved });
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
              const validation = validateReviewDraft(
                current,
                await basePackFor([current.id, current.supersedes ?? '']),
              );
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
              // 按 payload.id 扫一遍：旧版本可能已经被改名成内容 id 存在 approved 里，
              // 只按 draft id 找会漏掉（真实踩过：approved 里留下两份同一 id 的对话）。
              const approvedDir = 'content-review/approved';
              for (const name of await readdir(approvedDir)) {
                if (!name.endsWith('.json')) continue;
                const file = path.join(approvedDir, name);
                const raw = JSON.parse(await readFile(file, 'utf8')) as {
                  id?: string;
                  payload?: { id?: string };
                };
                if (raw.payload?.id !== current.supersedes) continue;
                await rename(file, path.join('content-review', 'discarded', `${Date.now()}-${name}`));
              }
              const previous = await getReviewDraft(current.supersedes);
              if (previous?.status === 'approved') {
                await moveReviewDraft(
                  previous.id,
                  'discarded',
                  `已被 ${draft.id}（v${draft.version ?? 1}）替换`,
                );
              }
            }
            // approved 目录变了，立刻重新生成给游戏用的模块（dev 下会热更新）。
            await syncApprovedContent();
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
