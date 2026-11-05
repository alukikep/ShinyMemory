import type { ContentPack } from './contentIndexCore';
import { buildContentIndex } from './contentIndexCore';
import { contentKey, createContentRelationAnalyzer, packGroups } from './contentRelations';
import type { StoryChainDef } from './types';
import type { ReviewKind } from '../review/types';

export const COVERAGE_METRICS = [
  { id: 'training', label: '训练行动', minimum: 3 },
  { id: 'actions', label: '专属行动', minimum: 1 },
  { id: 'topics', label: '日常话题', minimum: 6 },
  { id: 'events', label: '事件', minimum: 3 },
  { id: 'chains', label: '剧情链', minimum: 2 },
  { id: 'dialogues', label: '对话', minimum: 2 },
  { id: 'jobs', label: '工作（全角色共享）', minimum: 2 },
] as const;
export type CoverageMetric = typeof COVERAGE_METRICS[number]['id'];

/** Existing gate policy, including its known ownership inaccuracies. Kept explicit for migration comparisons. */
export function legacyCoverageSelections(pack: ContentPack, idolId: string) {
  const index = buildContentIndex(pack);
  const selections: Record<CoverageMetric, Map<string, string[]>> = {
    training: new Map(), actions: new Map(), topics: new Map(), events: new Map(), chains: new Map(), dialogues: new Map(), jobs: new Map(),
  };
  for (const activity of index.activities.values()) {
    const own = activity.idolIds?.includes(idolId) ?? false;
    if (activity.kind === 'training' && (!activity.idolIds || own)) selections.training.set(`activity:${activity.id}`, ['kind=training; 无 idolIds 或包含目标偶像']);
    else if (activity.kind === 'bond' && own) selections.actions.set(`activity:${activity.id}`, ['kind=bond; idolIds 包含目标偶像']);
  }
  for (const topic of index.actors.get(idolId)?.topics ?? []) if (topic.id.startsWith(`${idolId}.chat.`)) {
    selections.topics.set(contentKey('topic', { ...topic, actorId: idolId }), ['宿主为目标偶像且 id 符合 <idol>.chat. 前缀']);
  }
  for (const event of index.events.values()) {
    const reasons = [event.afterIdol?.ids?.includes(idolId) ? 'afterIdol.ids 包含目标偶像' : '',
      event.after && 'ids' in event.after && event.after.ids?.includes(idolId) ? 'after.ids 包含目标偶像（实际为行动选择器）' : '',
      event.entry?.kind === 'arrival' ? 'entry.kind=arrival（旧口径计入所有偶像）' : ''].filter(Boolean);
    if (reasons.length) selections.events.set(`event:${event.id}`, reasons);
  }
  for (const chain of index.storyChains.values()) if (chain.idolId === idolId) selections.chains.set(`story:${chain.id}`, ['idolId']);
  for (const dialogue of index.dialogues.values()) if (dialogue.idolId === idolId) selections.dialogues.set(`dialogue:${dialogue.id}`, ['idolId']);
  for (const job of index.jobs.values()) selections.jobs.set(`job:${job.id}`, ['全角色共享工作']);
  return selections;
}

function collectRelationFacts(pack: ContentPack, registeredChains: readonly StoryChainDef[]) {
  const analyze = createContentRelationAnalyzer(pack, registeredChains);
  const facts = new Map<string, ReturnType<typeof analyze>>();
  for (const [kind, values] of Object.entries(packGroups(pack))) for (const value of values) {
    facts.set(contentKey(kind, value as unknown as Record<string, unknown>), analyze(kind as ReviewKind, value as unknown as Record<string, unknown>));
  }
  return facts;
}

/** Explicit-association gate policy. Availability of generic training and shared jobs is separate from ownership. */
export function relationCoverageSelections(pack: ContentPack, idolId: string, registeredChains: readonly StoryChainDef[] = [], facts = collectRelationFacts(pack, registeredChains)) {
  const legacy = legacyCoverageSelections(pack, idolId);
  const selections: Record<CoverageMetric, Set<string>> = {
    training: new Set(legacy.training.keys()), actions: new Set(), topics: new Set(), events: new Set(),
    chains: new Set(legacy.chains.keys()), dialogues: new Set(), jobs: new Set(legacy.jobs.keys()),
  };
  for (const [key, fact] of facts) {
    const own = fact.relations.filter(r => r.idolId === idolId);
    if (key.startsWith('activity:') && own.some(r => r.role === 'exclusive')) selections.actions.add(key);
    if (key.startsWith(`topic:${idolId}/`) && own.some(r => r.role === 'exclusive')) selections.topics.add(key);
    if (key.startsWith('event:') && own.some(r => r.role === 'exclusive' || r.role === 'participant')) selections.events.add(key);
    if (key.startsWith('dialogue:') && own.some(r => r.role === 'exclusive')) selections.dialogues.add(key);
  }
  return selections;
}

/** Migration diagnostics only: compares the legacy policy with the explicit-association gate. */
export function buildCoverageComparison(pack: ContentPack, registeredChains: readonly StoryChainDef[] = [], pendingIds: readonly string[] = []) {
  const facts = collectRelationFacts(pack, registeredChains);
  const warnings = [...new Set([...facts.values()].flatMap(f => f.warnings))].sort();
  const index = buildContentIndex(pack);
  const idols = [...index.idols.values()].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0).map(idol => {
    const legacy = legacyCoverageSelections(pack, idol.id);
    const proposed = relationCoverageSelections(pack, idol.id, registeredChains, facts);
    const metrics = COVERAGE_METRICS.map(metric => {
      const before = [...legacy[metric.id].keys()].sort();
      const after = [...proposed[metric.id]].sort();
      const differences = [...new Set([...before, ...after])].sort().filter(key => legacy[metric.id].has(key) !== proposed[metric.id].has(key)).map(key => ({
        key, change: proposed[metric.id].has(key) ? 'added' as const : 'removed' as const,
        legacyEvidence: legacy[metric.id].get(key) ?? [], relations: facts.get(key)?.relations ?? [],
        explanation: proposed[metric.id].has(key) ? '显式归属/宿主/参与关系符合候选口径' : '旧规则命中，但缺少候选口径要求的关系；条件引用不计事件覆盖',
      }));
      return { ...metric, legacyCount: before.length, proposedCount: after.length, legacyKeys: before, proposedKeys: after,
        simulatedDeficit: Math.max(0, metric.minimum - after.length), differences };
    });
    return { id: idol.id, name: idol.name, pending: pendingIds.includes(idol.id), metrics };
  });
  return { schemaVersion: 1, mode: 'report-only', activePolicy: 'explicit-relations-v1', policy: '新口径（已接入覆盖率）：专属行动不限 kind；话题按宿主；事件计主属或参与，排除条件引用；对话计主属及登记链宿主。原数值门槛不变；本命令仅报告。',
    idols, warnings, unassignedKeys: [...facts].filter(([key, value]) => value.relations.length === 0 && /^(dialogue|story|topic):/.test(key)).map(([key]) => key).sort() };
}
