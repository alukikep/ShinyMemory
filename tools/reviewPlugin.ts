import type { Plugin } from 'vite';
import { getReviewDraft, listReviewDrafts } from './reviewStore.js';

function sendJson(
  response: import('node:http').ServerResponse,
  status: number,
  body: unknown,
): void {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.end(JSON.stringify(body));
}

export function reviewApiPlugin(): Plugin {
  return {
    name: 'shiny-memory-review-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/review', async (request, response, next) => {
        if (request.method !== 'GET') {
          sendJson(response, 405, { error: 'method not allowed' });
          return;
        }

        try {
          const pathname = (request.url ?? '/').split('?')[0] ?? '/';
          if (pathname === '/' || pathname === '/drafts') {
            sendJson(response, 200, { drafts: await listReviewDrafts() });
            return;
          }

          if (pathname.startsWith('/drafts/')) {
            const id = decodeURIComponent(pathname.slice('/drafts/'.length));
            const draft = await getReviewDraft(id);
            if (!draft) {
              sendJson(response, 404, { error: 'draft not found' });
              return;
            }
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
