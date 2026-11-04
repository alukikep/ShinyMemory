import { describe, expect, it } from 'vitest';
import { buildContentInventory, type InventoryInput, type InventorySnapshot } from './contentInventory';
import { BASE_PACK } from './content/basePack';
import type { ContentPack } from './contentIndexCore';
import type { StoryChainDef } from './types';

const dialogue = (id: string) => ({ id, startNodeId: 'n', nodes: { n: { id: 'n', text: 'text' } } });
const chain: StoryChainDef = { id: 'card-a', idolId: 'mano', kind: 'card', steps: [
  { id: 'ch1', dialogueId: 'd1', locationId: 'park', actionLabel: 'one' },
  { id: 'ch2', dialogueId: 'd2', locationId: 'park', actionLabel: 'two' },
] };
function fixture(): InventoryInput {
  const pack: ContentPack = { ...BASE_PACK, idols: BASE_PACK.idols.filter(i => ['mano', 'hiori'].includes(i.id)),
    actors: [], activities: [], events: [], jobs: [], items: [], shops: [], storyChains: [], dialogues: [dialogue('d1')] };
  return { pack, snapshots: [], registeredChains: [chain], sources: chain.steps.map((s, i) => ({
    chapterId: s.id, card: { title: 'A', index: i + 1, total: 2 }, source: `card/${i}.csv`, anchors: [], script: `script${i}` })) };
}
function snapshot(status: InventorySnapshot['status'], kind: InventorySnapshot['draft']['kind'], payload: unknown, version = 1): InventorySnapshot {
  return { file: `${status}/${version}.json`, status, draft: { id: `draft-${version}`, title: 'draft', kind, payload, version, rootId: 'root', supersedes: version > 1 ? 'draft-1' : undefined } };
}
const mano = (input: InventoryInput) => buildContentInventory(input).idols.find(i => i.id === 'mano')!;

describe('content inventory', () => {
  it('counts one registered card, two chapters and partial dialogue availability without claiming integration', () => {
    const input = fixture();
    expect(mano(input).counts).toMatchObject({ cards: 1, integratedCards: 0, cardChapters: 2, availableCardChapters: 1, integratedCardChapters: 0 });
    const entry = buildContentInventory(input).entries.find(e => e.key === 'story:card-a')!;
    expect(entry.versions[0].reason).toBe('缺对话：d2');
    expect(entry.chapters?.map(c => [c.id, c.available, c.integrated])).toEqual([['ch1', true, false], ['ch2', false, false]]);
    expect(entry.chapters?.[0].source?.script).toBe('script0');
    input.pack.dialogues.push(dialogue('d2'));
    input.pack.storyChains.push(chain);
    expect(mano(input).counts).toMatchObject({ cards: 1, integratedCards: 1, integratedCardChapters: 2 });
  });
  it('uses recruitment effects, not lock exemption alone, and separates arcs', () => {
    const input = fixture();
    input.pack.storyChains = [
      { ...chain, id: 'recruit', kind: 'arc', steps: [{ ...chain.steps[0], id: 'recruit-step', complete: { status: 'recruited' } }] },
      { ...chain, id: 'arc', kind: 'arc', steps: [] },
      { ...chain, id: 'exempt', lockScope: 'none', kind: 'arc', steps: [] },
    ];
    expect(mano(input).counts).toMatchObject({ recruitment: 1, arcs: 1 });
    expect(buildContentInventory(input).warnings).toContain('待确认剧情类型 story:exempt');
  });
  it('deduplicates a split card and retains the original card total when registration is incomplete', () => {
    const input = fixture();
    input.registeredChains = [{ ...chain, steps: [chain.steps[0]] }, { ...chain, id: 'split', steps: [chain.steps[1]] }];
    input.sources.forEach(s => { s.card!.total = 5; });
    const report = buildContentInventory(input);
    expect(mano(input).counts).toMatchObject({ cards: 1, cardChapters: 5, registeredCardChapters: 2, availableCardChapters: 1 });
    expect(report.warnings).toContain('一张卡拆为多链 mano/A: card-a, split');
    expect(report.cards[0].integrated).toBe(false);
  });
  it('distinguishes exclusive, multi-idol and generic activities, including non-bond actions', () => {
    const input = fixture();
    const template = BASE_PACK.activities[0];
    input.pack.activities = [
      { ...template, id: 'solo', kind: 'training', idolIds: ['mano'] },
      { ...template, id: 'pair', idolIds: ['mano', 'hiori'] },
      { ...template, id: 'shared', idolIds: undefined },
    ];
    const report = buildContentInventory(input);
    expect(mano(input).counts).toMatchObject({ exclusiveActions: 1, participantActions: 1 });
    expect(report.sharedKeys).toContain('activity:shared');
    expect(mano(input).keys).not.toContain('activity:shared');
  });
  it('does not attribute arrival or after activity ids to idols; retains cast and condition evidence', () => {
    const input = fixture();
    const template = { id: 'arrival', title: 'arrival', when: [], text: '', choices: [] };
    input.pack.events = [
      { ...template, entry: { kind: 'arrival' }, after: { ids: ['mano'] } },
      { ...template, id: 'solo', afterIdol: { ids: ['mano'] } },
      { ...template, id: 'pair', cast: ['mano', 'hiori'] },
      { ...template, id: 'condition', when: [{ kind: 'idolStatus', idolId: 'mano', status: 'recruited' }] },
    ];
    const report = buildContentInventory(input);
    expect(mano(input).counts).toMatchObject({ exclusiveEvents: 1, participantEvents: 1, conditionEvents: 1 });
    expect(report.entries.find(e => e.id === 'arrival')?.relations).toEqual([]);
    expect(report.entries.find(e => e.id === 'condition')?.relations).toEqual([{ idolId: 'mano', role: 'condition', path: 'when[0].idolId' }]);
  });
  it('uses topic hosts and allows identical local topic ids on different hosts', () => {
    const input = fixture();
    const actor = BASE_PACK.actors[0];
    const topic = { id: 'greeting', label: 'hello', text: 'hello', effects: [] };
    input.pack.actors = [{ ...actor, id: 'mano', topics: [topic] }, { ...actor, id: 'hiori', topics: [topic] }];
    const report = buildContentInventory(input);
    expect(mano(input).counts.topics).toBe(1);
    expect(report.entries.filter(e => e.kind === 'topic').map(e => e.key)).toEqual(['topic:hiori/greeting', 'topic:mano/greeting']);
    expect(report.warnings.some(w => w.includes('重复'))).toBe(false);
  });
  it('retains production and revision versions without doubling output, including proposed owner changes', () => {
    const input = fixture();
    const activity = { ...BASE_PACK.activities[0], id: 'a', idolIds: ['mano'] };
    input.pack.activities = [activity];
    input.snapshots = [snapshot('approved', 'activity', activity), snapshot('review', 'activity', { ...activity, idolIds: ['hiori'] }, 2)];
    const report = buildContentInventory(input);
    const entry = report.entries.find(e => e.key === 'activity:a')!;
    expect(entry.versions.map(v => [v.approval, v.integration, v.version])).toEqual([['approved', 'integrated', 1], ['review', 'not-integrated', 2]]);
    expect(entry.versions[1]).toMatchObject({ rootId: 'root', supersedes: 'draft-1' });
    expect(mano(input).counts).toMatchObject({ exclusiveActions: 1, pending: 0 });
    expect(report.idols.find(i => i.id === 'hiori')).toMatchObject({ counts: { exclusiveActions: 0, pending: 1 }, pendingKeys: ['activity:a'] });
  });
  it('keeps colliding approved content unintegrated when the base definition wins', () => {
    const input = fixture();
    const activity = { ...BASE_PACK.activities[0], id: 'a', idolIds: ['mano'] };
    input.pack.activities = [activity];
    input.basePack = structuredClone(input.pack);
    input.snapshots = [snapshot('approved', 'activity', activity)];
    const entry = buildContentInventory(input).entries.find(e => e.key === 'activity:a')!;
    expect(entry.versions.map(v => [v.approval, v.integration])).toEqual([['structure', 'integrated'], ['approved', 'not-integrated']]);
  });
  it('reports duplicate current drafts and unassigned dialogue instead of inventing ownership', () => {
    const input = fixture();
    input.snapshots = [snapshot('review', 'dialogue', dialogue('unknown')), snapshot('review', 'dialogue', dialogue('unknown'), 2)];
    const report = buildContentInventory(input);
    expect(report.unresolvedKeys).toContain('dialogue:unknown');
    expect(report.warnings).toContain('同流程重复内容 review/dialogue:unknown (review/2.json)');
    expect(report.idols.every(i => !i.pendingKeys.includes('dialogue:unknown'))).toBe(true);
  });
  it('counts main ownership and participants separately and never mutates inputs', () => {
    const input = fixture();
    input.pack.dialogues = [{ ...dialogue('pair'), idolId: 'mano', participantIds: ['mano', 'hiori'], nodes: { n: { id: 'n', text: '', speakerId: 'hiori' } } }];
    const before = JSON.stringify(input);
    const first = buildContentInventory(input);
    expect(first.idols.find(i => i.id === 'mano')?.counts).toMatchObject({ dialogues: 1, participantDialogues: 1 });
    expect(first.idols.find(i => i.id === 'hiori')?.counts).toMatchObject({ dialogues: 0, participantDialogues: 1 });
    expect(JSON.stringify(input)).toBe(before);
    expect(buildContentInventory(input)).toEqual(first);
  });
});
