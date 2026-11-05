import { describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { BASE_PACK } from './content/basePack';
import { buildCoverageComparison, COVERAGE_METRICS, relationCoverageSelections } from './coverageComparison';
import type { ContentPack } from './contentIndexCore';
import { loadInventorySource } from '../../tools/contentInventoryService';

function fixture(): ContentPack {
  const actor = BASE_PACK.actors[0];
  const activity = BASE_PACK.activities[0];
  const event = { id: 'arrival', title: '', text: '', choices: [], when: [] };
  return { ...BASE_PACK, idols: BASE_PACK.idols.filter(i => ['mano', 'hiori'].includes(i.id)), storyChains: [], dialogues: [], jobs: [],
    actors: [{ ...actor, id: 'mano', topics: [{ id: 'without-prefix', label: '', text: '', effects: [] }] }],
    activities: [{ ...activity, id: 'generic', kind: 'training', idolIds: undefined }, { ...activity, id: 'solo-training', kind: 'training', idolIds: ['mano'] },
      { ...activity, id: 'pair', kind: 'bond', idolIds: ['mano', 'hiori'] }],
    events: [{ ...event, entry: { kind: 'arrival' } }, { ...event, id: 'selector', after: { ids: ['mano'] } },
      { ...event, id: 'cast', cast: ['mano', 'hiori'] }, { ...event, id: 'condition', when: [{ kind: 'idolStatus', idolId: 'mano', status: 'known' }] }],
  };
}
describe('coverage policy comparison', () => {
  it('verifies all current idol content memberships before applying the new gate policy', async () => {
    const source = await loadInventorySource();
    const report = buildCoverageComparison(source.assembly.pack, source.registeredChains);
    expect(report.idols).toHaveLength(28);
    expect(report.activePolicy).toBe('explicit-relations-v1');
    expect(report.warnings).toEqual([]);
    for (const idol of report.idols) for (const metric of idol.metrics) {
      expect(metric.proposedKeys, `${idol.id}/${metric.id}`).toEqual(metric.legacyKeys);
      expect(metric.differences).toEqual([]);
      expect(metric.simulatedDeficit).toBe(0);
    }
  });
  it('reports concrete key and evidence changes independently from thresholds', () => {
    const pack = fixture();
    const before = structuredClone(pack);
    const result = buildCoverageComparison(pack);
    const rows = result.idols.find(i => i.id === 'mano')!.metrics;
    const events = rows.find(m => m.id === 'events')!;
    expect(events.legacyKeys).toEqual(['event:arrival', 'event:selector']);
    expect(events.proposedKeys).toEqual(['event:cast']);
    expect(events.simulatedDeficit).toBe(2);
    expect(events.differences.find(d => d.key === 'event:selector')).toMatchObject({ change: 'removed', legacyEvidence: ['after.ids 包含目标偶像（实际为行动选择器）'], relations: [] });
    expect(events.differences.find(d => d.key === 'event:cast')?.relations).toContainEqual({ idolId: 'mano', role: 'participant', path: 'cast[0]' });
    expect(rows.find(m => m.id === 'training')?.proposedKeys).toEqual(['activity:generic', 'activity:solo-training']);
    expect(rows.find(m => m.id === 'actions')).toMatchObject({ legacyKeys: ['activity:pair'], proposedKeys: ['activity:solo-training'] });
    expect(rows.find(m => m.id === 'topics')).toMatchObject({ legacyKeys: [], proposedKeys: ['topic:mano/without-prefix'] });
    expect(pack).toEqual(before);
    expect(buildCoverageComparison(pack)).toEqual(result);
    expect([...relationCoverageSelections(pack, 'mano').events]).toEqual(['event:cast']);
    expect(COVERAGE_METRICS.map(m => [m.id, m.minimum])).toEqual([
      ['training', 3], ['actions', 1], ['topics', 6], ['events', 3], ['chains', 2], ['dialogues', 2], ['jobs', 2],
    ]);
  });
  it('retains primary and participant facts while counting each dialogue once per policy', () => {
    const pack = fixture();
    pack.dialogues = [{ id: 'd', idolId: 'mano', participantIds: ['mano', 'hiori'], startNodeId: 'n', nodes: {} }];
    pack.storyChains = [{ id: 'chain', idolId: 'mano', steps: [{ id: 's', dialogueId: 'd', locationId: 'park', actionLabel: '' }] }];
    const report = buildCoverageComparison(pack);
    expect(report.idols.find(i => i.id === 'mano')?.metrics.find(m => m.id === 'dialogues')).toMatchObject({ legacyCount: 1, proposedCount: 1, differences: [] });
    expect(report.idols.find(i => i.id === 'hiori')?.metrics.find(m => m.id === 'dialogues')?.proposedCount).toBe(0);
  });
  it('keeps the comparison command report-only and validates error exits', () => {
    const run = (args: string[]) => spawnSync(process.execPath, ['--import', 'tsx', 'tools/coverageComparison.ts', ...args], { encoding: 'utf8' });
    const output = run(['--idol', 'mano', '--json']);
    expect(output.status, output.stderr).toBe(0);
    const report = JSON.parse(output.stdout);
    expect(report.mode).toBe('report-only');
    expect(report.idols).toHaveLength(1);
    expect(report.idols[0].metrics.find((m: { id: string }) => m.id === 'events')).toMatchObject({ legacyCount: 5, proposedCount: 5 });
    for (const args of [['--idol', 'missing'], ['--bad']]) {
      const bad = run(args);
      expect(bad.status).toBe(1);
      expect(bad.stderr).toContain(args[0] === '--bad' ? '非法参数' : '未知偶像');
    }
  }, 15000);
});
