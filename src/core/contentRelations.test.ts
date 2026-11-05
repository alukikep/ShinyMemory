import { describe, expect, it } from 'vitest';
import { BASE_PACK } from './content/basePack';
import { createContentRelationAnalyzer } from './contentRelations';
import type { ContentPack } from './contentIndexCore';
import type { StoryChainDef } from './types';

const pack: ContentPack = { ...BASE_PACK, idols: BASE_PACK.idols.filter(i => ['mano', 'hiori'].includes(i.id)), storyChains: [] };
const analyze = createContentRelationAnalyzer(pack);
describe('explicit content relationships', () => {
  it('ignores prose, id prefixes, arrival and activity selectors as idol ownership', () => {
    expect(analyze('event', { id: 'mano.arrival', text: 'mano', entry: { kind: 'arrival' }, after: { ids: ['mano'] } })).toEqual({ relations: [], warnings: [] });
  });
  it('retains all evidence but deduplicates repeated references', () => {
    const result = analyze('event', { id: 'pair', cast: ['mano', 'hiori', 'mano'], afterIdol: { ids: ['mano'] },
      when: [{ kind: 'all', of: [{ kind: 'not', of: { kind: 'idolStatus', idolId: 'mano', status: 'recruited' } }] }] });
    expect(result.relations.filter(r => r.idolId === 'mano').map(r => [r.role, r.path])).toEqual([
      ['condition', 'when[0].of[0].of.idolId'], ['exclusive', 'afterIdol.ids[0]'], ['participant', 'cast[0]'], ['participant', 'cast[2]'],
    ]);
    expect(result.warnings).toEqual([]);
  });
  it('uses hosts and registered chain references for non-prefixed topics and draft dialogues', () => {
    expect(analyze('topic', { id: 'hello', actorId: 'mano' }).relations).toEqual([{ idolId: 'mano', role: 'exclusive', path: 'actorId' }]);
    const chain: StoryChainDef = { id: 'card', idolId: 'mano', steps: [{ id: 'first', dialogueId: 'draft-dialogue', locationId: 'park', actionLabel: '' }] };
    const result = createContentRelationAnalyzer(pack, [chain])('dialogue', { id: 'draft-dialogue', participantIds: ['hiori'], nodes: { n: { speakerId: 'producer' } } });
    expect(result.relations).toEqual([
      { idolId: 'hiori', role: 'participant', path: 'participantIds[0]' },
      { idolId: 'mano', role: 'exclusive', path: 'story:card.steps.first.dialogueId' },
    ]);
    expect(result.warnings).toEqual([]);
  });
  it('exposes unknown explicit idol references without inventing a relation or mutating inputs', () => {
    const payload = { id: 'unknown', idolId: 'missing', requires: [{ idolId: 'missing' }] };
    const before = structuredClone(payload);
    expect(analyze('activity', payload)).toEqual({ relations: [], warnings: [
      'activity:unknown 未知偶像 missing (idolId)', 'activity:unknown 未知偶像 missing (requires[0].idolId)',
    ] });
    expect(payload).toEqual(before);
    expect(analyze('event', { id: 'unknown-cast', cast: ['missing'] })).toEqual({ relations: [], warnings: ['event:unknown-cast 未知偶像 missing (cast[0])'] });
  });
});
