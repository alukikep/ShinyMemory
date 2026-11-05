import { promises as fs } from 'node:fs';
import path from 'node:path';
import { buildContentInventory } from '../src/core/contentInventory.js';
import type { InventoryReport, InventorySnapshot } from '../src/shared/contentInventoryTypes.js';
import { BASE_PACK } from '../src/core/content/basePack.js';
import { APPROVED_CONTENT } from '../src/core/content/approved.generated.js';
import { packApprovedFiles } from '../src/core/content/approvedPacking.js';
import { assembleContent } from '../src/core/contentAssembly.js';
import { PENDING_CHAPTERS } from '../src/core/content/chapters/index.js';
import { CHAPTER_SOURCES } from '../src/core/content/chapterSources.js';
import { REVIEW_KINDS, type ReviewKind } from '../src/review/types.js';

// Unlike forgiving review readers, inventory must never turn an unreadable directory into zero content.
export async function readInventorySnapshots(root = process.cwd()): Promise<InventorySnapshot[]> {
  const result: InventorySnapshot[] = [];
  for (const [dir, status] of [['approved', 'approved'], ['drafts', 'review'], ['revisions', 'revision']] as const) {
    const directory = path.join(root, 'content-review', dir);
    const names = await fs.readdir(directory);
    for (const name of names.filter(n => n.endsWith('.json')).sort()) {
      const file = `content-review/${dir}/${name}`;
      try {
        const raw = JSON.parse(await fs.readFile(path.join(directory, name), 'utf8'));
        if (!raw || !REVIEW_KINDS.includes(raw.kind as ReviewKind) || typeof raw.id !== 'string'
          || !raw.payload || typeof raw.payload.id !== 'string' || !raw.payload.id) throw new Error('缺少合法的 kind、草稿 id 或 payload.id');
        result.push({ file, status, draft: raw });
      } catch (error) { throw new Error(`${file}: ${error instanceof Error ? error.message : String(error)}`); }
    }
  }
  return result;
}

export function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.entries(value).filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(',')}}`;
  return JSON.stringify(value) ?? 'null';
}

export async function loadInventorySource(root = process.cwd()) {
  const snapshots = await readInventorySnapshots(root);
  const approved = packApprovedFiles(Object.fromEntries(snapshots.filter(s => s.status === 'approved').map(s => [s.file, s.draft])));
  const assembly = assembleContent(BASE_PACK, approved, PENDING_CHAPTERS);
  const warnings = assembly.diagnostics.map(d => `装配警告：${d.message}`);
  if (canonical(approved) !== canonical(APPROVED_CONTENT)) warnings.push('approved.generated.ts 与批准源文件不同步；本命令未执行 content:sync');
  return { assembly, snapshots, warnings, registeredChains: PENDING_CHAPTERS };
}

export async function loadInventory(root = process.cwd()): Promise<InventoryReport> {
  const { assembly, snapshots, warnings } = await loadInventorySource(root);
  const report = buildContentInventory({ pack: assembly.pack, registeredChains: PENDING_CHAPTERS,
    sources: CHAPTER_SOURCES, snapshots, warnings, basePack: BASE_PACK });
  const history: Record<string, number> = {};
  for (const dir of ['archived', 'discarded']) history[dir] = (await fs.readdir(path.join(root, 'content-review', dir))).filter(n => n.endsWith('.json')).length;
  return { ...report, history };
}
