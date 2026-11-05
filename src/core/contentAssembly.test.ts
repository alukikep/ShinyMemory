import { describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { assembleContent, attachRegisteredChapters } from './contentAssembly';
import { FIXTURE_CONTENT_PACK } from './content-fixture/pack';
import { BASE_PACK } from './content/basePack';
import { APPROVED_CONTENT } from './content/approved.generated';
import { PENDING_CHAPTERS } from './content/chapters';
import { attachPendingChapters } from './content/assemblePack';
import { mergeApprovedContent } from '../review/approval';
import { packApprovedFiles } from './content/approvedPacking';
import type { ContentPack } from './contentIndexCore';
import type { StoryChainDef } from './types';

const emptyApproved = () => packApprovedFiles({});
const dialogue = (id: string) => ({ id, startNodeId: 'start', nodes: { start: { id: 'start', text: 'test' } } });
const chain: StoryChainDef = { id: 'card', idolId: 'mano', steps: [
  { id: 'first', dialogueId: 'd1', locationId: 'park', actionLabel: 'first' },
  { id: 'second', dialogueId: 'd2', locationId: 'park', actionLabel: 'second' },
] };
const base = (): ContentPack => ({ ...BASE_PACK, dialogues: [], storyChains: [] });

describe('content assembly', () => {
  it('reports per-step availability while leaving a partially approved chain unattached', () => {
    const approved = emptyApproved();
    approved.dialogues = [dialogue('d1')];
    const result = assembleContent(base(), approved, [chain]);
    expect(result.mergedPack.dialogues.map(d => d.id)).toEqual(['d1']);
    expect(result.pack.storyChains).toEqual([]);
    expect(result.chapters).toEqual([{ chainId: 'card', attached: false, steps: [
      { stepId: 'first', dialogueId: 'd1', available: true }, { stepId: 'second', dialogueId: 'd2', available: false },
    ] }]);
    expect(result.diagnostics).toEqual([{ kind: 'missing-dialogue', chainId: 'card', stepId: 'second', dialogueId: 'd2', message: '链 card 步骤 second 缺对话：d2' }]);
    approved.dialogues.push(dialogue('d2'));
    const complete = assembleContent(base(), approved, [chain]);
    expect(complete.pack.storyChains.map(c => c.id)).toEqual(['card']);
    expect(complete.chapters[0].attached).toBe(true);
    expect(complete.diagnostics).toEqual([]);
  });
  it('keeps existing merge precedence, duplicate messages and unknown topic host diagnostics', () => {
    const pack = base();
    pack.dialogues = [dialogue('d1')];
    const approved = emptyApproved();
    approved.dialogues = [{ ...dialogue('d1'), startNodeId: 'replacement' }];
    approved.topics = [{ id: 'topic', actorId: 'missing', label: 'test', text: '', effects: [] }];
    const result = assembleContent(pack, approved, []);
    expect(result.duplicates).toEqual(['话题 topic 指向不存在的角色 missing', '对话 d1']);
    expect(result.pack.dialogues[0].startNodeId).toBe('start');
    expect(result.diagnostics).toEqual(result.duplicates.map(message => ({ kind: 'merge-conflict', message })));
    expect(result.pack.actors.some(a => a.topics.some(t => t.id === 'topic'))).toBe(false);
  });
  it('diagnoses registered collisions without silently changing legacy append behavior', () => {
    const pack = base();
    pack.dialogues = [dialogue('d1'), dialogue('d2')];
    pack.storyChains = [chain];
    const result = assembleContent(pack, emptyApproved(), [chain, chain]);
    expect(result.pack.storyChains.map(c => c.id)).toEqual(['card', 'card', 'card']);
    expect(result.diagnostics.map(d => d.kind)).toEqual(['duplicate-chain', 'duplicate-chain']);
  });
  it('retains vacuous empty-chain attachment and reports each missing dependency deterministically', () => {
    const result = assembleContent(base(), emptyApproved(), [{ ...chain, id: 'empty', steps: [] }, chain]);
    expect(result.pack.storyChains.map(c => c.id)).toEqual(['empty']);
    expect(result.diagnostics.map(d => d.message)).toEqual(['链 card 步骤 first 缺对话：d1', '链 card 步骤 second 缺对话：d2']);
  });
  it('does not mutate injected inputs and does not consult the production registry for fixtures', () => {
    const pack = structuredClone(FIXTURE_CONTENT_PACK);
    const before = structuredClone(pack);
    const result = assembleContent(pack, emptyApproved(), []);
    expect(result.pack).toEqual(pack);
    expect(result.chapters).toEqual([]);
    expect(result.diagnostics).toEqual([]);
    expect(pack).toEqual(before);
    expect(attachRegisteredChapters(pack, []).pack).toEqual(pack);
  });
  it('matches the previous merge and chapter-filter result for the complete production input', () => {
    const merged = mergeApprovedContent(BASE_PACK, APPROVED_CONTENT);
    const expected = { ...merged.pack, storyChains: [...merged.pack.storyChains,
      ...PENDING_CHAPTERS.filter(c => c.steps.every(s => merged.pack.dialogues.some(d => d.id === s.dialogueId))) ] };
    const result = assembleContent(BASE_PACK, APPROVED_CONTENT, PENDING_CHAPTERS);
    expect(result.pack).toEqual(expected);
    expect(result.mergedPack).toEqual(merged.pack);
    expect(result.duplicates).toEqual(merged.duplicates);
    expect(result.diagnostics).toEqual([]);
    expect(attachPendingChapters(merged.pack)).toEqual(expected);
  });
  it('keeps coverage and board commands wired to executable source-pack assembly', () => {
    const run = (file: string, args: string[] = []) => spawnSync(process.execPath, ['--import', 'tsx', file, ...args], { encoding: 'utf8' });
    const coverage = run('tools/contentCoverage.ts', ['--quiet']);
    expect(coverage.status, coverage.stderr).toBe(0);
    expect(coverage.stdout).toContain('覆盖度：28 个偶像，全部达标');
    const board = run('tools/chapterBoard.ts');
    expect(board.status, board.stderr).toBe(0);
    expect(board.stdout).toContain('29 张卡 · 110 章（对话可用 110，整链接入章节 110，待审 0）');
    expect(board.stdout).toContain('对话状态 / 链状态');
    expect(board.stdout).toContain('配置检查：全部通过');
  }, 15000);
});
