import { describe, expect, it } from 'vitest';
import { execFileSync, spawnSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import { createHash } from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import { formatInventory, loadInventory, parseInventoryArgs, readInventorySnapshots, selectInventory } from '../../tools/contentInventory';

describe('inventory CLI', () => {
  it('rejects missing, duplicate and unknown arguments', () => {
    expect(parseInventoryArgs(['--idol', 'mano', '--json'])).toEqual({ idol: 'mano', json: true, details: false });
    for (const args of [['--idol'], ['--oops'], ['--json', '--json'], ['mano']]) expect(() => parseInventoryArgs(args)).toThrow();
  });
  it('matches real card and idol baselines and preserves the worktree', async () => {
    const before = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' });
    const snapshots = await readInventorySnapshots();
    const files = [...snapshots.map(s => s.file), 'src/core/content/approved.generated.ts'];
    const hashFiles = async () => Promise.all(files.map(async file => createHash('sha256').update(await fs.readFile(file)).digest('hex')));
    const hashes = await hashFiles();
    const report = await loadInventory();
    expect(report.idols).toHaveLength(28);
    expect(report.idols.reduce((sum, i) => sum + i.counts.cards, 0)).toBe(29);
    expect(report.idols.reduce((sum, i) => sum + i.counts.cardChapters, 0)).toBe(110);
    const selected = selectInventory(report, 'mano');
    expect(selected.idols[0].counts).toMatchObject({ cards: 2, cardChapters: 8, recruitment: 1, arcs: 1, exclusiveActions: 2, topics: 9, pending: 1 });
    expect(selected.idols[0].pendingKeys).toEqual(['activity:activity.mano.cooking']);
    expect(selectInventory(report, 'hiori').idols[0].counts).toMatchObject({ cards: 1, cardChapters: 5, recruitment: 1, arcs: 1 });
    expect(selected.entries.filter(e => e.storyType === 'card').map(e => e.id)).toEqual(['mano-natural', 'mano-smile']);
    expect(report.warnings.some(w => w.includes('重复源包内容 topic:'))).toBe(false);
    expect(formatInventory(selected, true)).toContain('script=');
    expect(formatInventory(selected, false)).toContain('樱木真乃 (mano)');
    expect(() => selectInventory(report, 'missing')).toThrow('未知偶像');
    expect(execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' })).toBe(before);
    expect(await hashFiles()).toEqual(hashes);
  });
  it('emits parseable JSON and nonzero exit codes for invalid CLI requests', () => {
    const invoke = (args: string[]) => spawnSync(process.execPath, ['--import', 'tsx', 'tools/contentInventory.ts', ...args], { encoding: 'utf8' });
    const result = invoke(['--idol', 'mano', '--json']);
    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
    expect(JSON.parse(result.stdout).idols[0].id).toBe('mano');
    for (const args of [['--idol', 'missing'], ['--bad'], ['--idol']]) {
      const failed = invoke(args);
      expect(failed.status).toBe(1);
      expect(failed.stdout).toBe('');
      expect(failed.stderr.length).toBeGreaterThan(0);
    }
  }, 15000);
  it('fails explicitly on unreadable directories and malformed files', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'shiny-inventory-'));
    try {
      await expect(readInventorySnapshots(root)).rejects.toThrow();
      for (const dir of ['approved', 'drafts', 'revisions']) await fs.mkdir(path.join(root, 'content-review', dir), { recursive: true });
      await fs.writeFile(path.join(root, 'content-review', 'drafts', 'bad.json'), '{bad');
      await expect(readInventorySnapshots(root)).rejects.toThrow('content-review/drafts/bad.json');
      await fs.writeFile(path.join(root, 'content-review', 'drafts', 'bad.json'), JSON.stringify({ id: 'bad', kind: 'invented', payload: { id: 'bad' } }));
      await expect(readInventorySnapshots(root)).rejects.toThrow('缺少合法');
    } finally { await fs.rm(root, { recursive: true }); }
  });
});
