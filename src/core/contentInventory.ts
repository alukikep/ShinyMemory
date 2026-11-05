import type { ContentPack } from './contentIndexCore';
import type { ChapterSource } from './chapterAnchors';
import type { StoryChainDef } from './types';
import type { ReviewKind } from '../review/types';
import { contentKey, packGroups, createContentRelationAnalyzer } from './contentRelations';
import { validateDateScenario } from './dateValidation';
import { buildContentIndex } from './contentIndexCore';

import type { InventorySnapshot, InventoryRelation as Relation, InventoryVersion, InventoryEntry, InventoryProjection } from '../shared/contentInventoryTypes';
export type { InventorySnapshot, InventoryVersion, InventoryEntry } from '../shared/contentInventoryTypes';
type RecordValue = Record<string, unknown>;
export type InventoryInput = {
  pack: ContentPack; registeredChains: StoryChainDef[]; sources: ChapterSource[];
  snapshots: InventorySnapshot[]; warnings?: string[]; basePack?: ContentPack;
};
const record = (value: unknown): RecordValue => value && typeof value === 'object' && !Array.isArray(value) ? value as RecordValue : {};
const strings = (value: unknown): string[] => Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
const compare = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;

/** Pure projection: ownership comes from fields and registrations, never prose or id prefixes. */
export function buildContentInventory(input: InventoryInput): InventoryProjection {
  const { pack, snapshots, sources } = input;
  const warnings = [...(input.warnings ?? [])];
  const index = buildContentIndex(pack);
  const dateScenarios = (pack.dateScenarios ?? []).map(s => {
    const problems = validateDateScenario(s, index);
    warnings.push(...problems.map(p => `约会方案：${p}`));
    return { id: s.id, title: s.title, idolId: s.idolId, locationId: s.locationId, dialogueId: s.dialogueId,
      file: 'src/core/content/dateScenarios.ts', integrated: problems.length === 0, problems };
  }).sort((a, b) => compare(a.id, b.id));
  const idolIds = new Set(pack.idols.map(i => i.id));
  const analyze = createContentRelationAnalyzer(pack, input.registeredChains);
  const entries = new Map<string, InventoryEntry>();
  function add(kind: ReviewKind, raw: unknown, version: Omit<InventoryVersion, 'relations'>) {
    const payload = record(raw);
    if (typeof payload.id !== 'string' || !payload.id) { warnings.push(`${version.file}: 缺少 payload.id`); return; }
    const key = contentKey(kind, payload);
    const analysis = analyze(kind, payload);
    const refs = analysis.relations;
    warnings.push(...analysis.warnings);
    let entry = entries.get(key);
    if (!entry) {
      entry = { key, id: payload.id, kind, title: String(payload.title ?? payload.name ?? payload.label ?? payload.id),
        relations: [], scope: 'unresolved', integrated: false, versions: [] };
      entries.set(key, entry);
    }
    entry.versions.push({ ...version, relations: refs });
    entry.integrated ||= version.integration === 'integrated';
    // Current production ownership is independent of a proposed revision's ownership.
    const selected = entry.versions.some(v => v.integration === 'integrated')
      ? entry.versions.filter(v => v.integration === 'integrated') : entry.versions;
    entry.relations = [...new Map(selected.flatMap(v => v.relations).map(r => [`${r.idolId}/${r.role}/${r.path}`, r])).values()];
    const npcTopic = kind === 'topic' && pack.actors.some(a => a.id === payload.actorId && !idolIds.has(a.id));
    const explicitOwner = typeof payload.idolId === 'string' || strings(payload.idolIds).length > 0 || strings(record(payload.afterIdol).ids).length > 0;
    entry.scope = entry.relations.length ? 'associated' : !explicitOwner && (npcTopic || ['activity', 'event', 'job', 'item', 'shop'].includes(kind)) ? 'shared' : 'unresolved';
    if (version.approval !== 'structure' && kind === 'topic' && !pack.actors.some(a => a.id === payload.actorId)) warnings.push(`${key}: 话题宿主缺失或未知 (${version.file})`);
    if (kind === 'story' && Array.isArray(payload.steps)) {
      const chain = raw as StoryChainDef;
      const chapters = chain.steps.map(step => ({ id: step.id, dialogueId: step.dialogueId,
        available: pack.dialogues.some(d => d.id === step.dialogueId),
        integrated: pack.storyChains.some(c => c.id === chain.id) && pack.dialogues.some(d => d.id === step.dialogueId),
        source: sources.find(s => s.chapterId === step.id), script: step.source }));
      if (!entry.chapters || version.integration === 'integrated') {
        entry.chapters = chapters;
        entry.storyType = chapters.some(c => c.source?.card) ? 'card'
          : chain.steps.some(s => s.complete?.status === 'recruited') ? 'recruitment'
          : chain.kind === 'arc' && chain.lockScope !== 'none' ? 'arc' : 'unclassified';
      }
    }
    return entry;
  }
  const groups = packGroups(pack);
  const baseKeys = new Set(input.basePack ? Object.entries(packGroups(input.basePack)).flatMap(([k, values]) => values.map(v => contentKey(k, record(v)))) : []);
  for (const [kind, values] of Object.entries(groups)) for (const payload of values) {
    const key = contentKey(kind, record(payload));
    if (entries.has(key)) warnings.push(`重复源包内容 ${key}`);
    const approved = baseKeys.has(key) ? [] : snapshots.filter(s => s.status === 'approved' && contentKey(s.draft.kind, record(s.draft.payload)) === key);
    add(kind as ReviewKind, payload, { file: approved[0]?.file ?? (kind === 'story' && input.registeredChains.some(c => c.id === payload.id) ? 'src/core/content/chapters/index.ts' : 'src/core/content/basePack.ts'),
      approval: approved.length ? 'approved' : 'structure', integration: 'integrated',
      ...(approved[0] ? { draftId: approved[0].draft.id, version: approved[0].draft.version,
        rootId: approved[0].draft.rootId, supersedes: approved[0].draft.supersedes } : {}) });
  }
  for (const chain of input.registeredChains) if (!entries.has(`story:${chain.id}`)) {
    const missing = chain.steps.filter(s => !pack.dialogues.some(d => d.id === s.dialogueId)).map(s => s.dialogueId);
    add('story', chain, { file: 'src/core/content/chapters/index.ts', approval: 'structure', integration: 'not-integrated',
      reason: missing.length ? `缺对话：${missing.join(', ')}` : '结构未挂载' });
  }
  const seen = new Set<string>();
  for (const { file, status, draft } of [...snapshots].sort((a, b) => compare(a.file, b.file))) {
    const key = contentKey(draft.kind, record(draft.payload));
    const versionKey = `${status}/${key}`;
    if (seen.has(versionKey)) warnings.push(`同流程重复内容 ${versionKey} (${file})`);
    seen.add(versionKey);
    if (status === 'approved' && entries.get(key)?.versions.some(v => v.file === file)) continue;
    add(draft.kind, draft.payload, { file, approval: status, integration: 'not-integrated',
      reason: status === 'approved' ? '未挂载或重复 id；检查警告' : '尚未批准',
      draftId: draft.id, version: draft.version, rootId: draft.rootId, supersedes: draft.supersedes });
  }
  const items = [...entries.values()].sort((a, b) => compare(a.key, b.key));
  for (const entry of items) {
    if (entry.scope === 'unresolved') warnings.push(`待确认归属 ${entry.key} (${entry.versions.map(v => v.file).join(', ')})`);
    if (entry.storyType === 'unclassified') warnings.push(`待确认剧情类型 ${entry.key}`);
  }
  // A malformed split card still counts as one card. Source index/total define chapter units.
  const cardMap = new Map<string, { key: string; idolId: string; title: string; expected: number;
    chainIds: string[]; chapters: { index: number; id: string; available: boolean; integrated: boolean }[] }>();
  for (const entry of items.filter(e => e.storyType === 'card')) {
    const owner = entry.relations.find(r => r.role === 'exclusive')?.idolId;
    if (!owner) continue;
    for (const chapter of entry.chapters ?? []) {
      const source = chapter.source;
      if (!source?.card) { warnings.push(`卡面章节缺少出处登记 ${entry.key}/${chapter.id}`); continue; }
      const key = `${owner}/${source.card.title}`;
      let card = cardMap.get(key);
      if (!card) {
        card = { key, idolId: owner, title: source.card.title, expected: source.card.total, chainIds: [], chapters: [] };
        cardMap.set(key, card);
      }
      if (card.expected !== source.card.total) warnings.push(`卡面章节总数不一致 ${key}`);
      card.expected = Math.max(card.expected, source.card.total);
      if (!card.chainIds.includes(entry.id)) card.chainIds.push(entry.id);
      if (card.chapters.some(c => c.index === source.card!.index)) warnings.push(`重复卡面章节 ${key} #${source.card.index}`);
      else card.chapters.push({ index: source.card.index, id: chapter.id, available: chapter.available, integrated: chapter.integrated });
    }
  }
  const cards = [...cardMap.values()].sort((a, b) => compare(a.key, b.key)).map(card => ({ ...card,
    chainIds: card.chainIds.sort(compare), chapters: card.chapters.sort((a, b) => a.index - b.index),
    integrated: card.chapters.length === card.expected && card.chapters.every(c => c.integrated) }));
  for (const card of cards) if (card.chainIds.length > 1) warnings.push(`一张卡拆为多链 ${card.key}: ${card.chainIds.join(', ')}`);
  const idols = [...pack.idols].sort((a, b) => compare(a.id, b.id)).map(idol => {
    const related = items.filter(e => e.relations.some(r => r.idolId === idol.id));
    const live = related.filter(e => e.integrated);
    const count = (kind: ReviewKind, role?: Relation['role']) => live.filter(e => e.kind === kind && (!role || e.relations.some(r => r.idolId === idol.id && r.role === role))).length;
    const ownCards = cards.filter(c => c.idolId === idol.id);
    return { id: idol.id, name: idol.name,
      counts: { dateScenarios: dateScenarios.filter(s => s.idolId === idol.id && s.integrated).length, cards: ownCards.length, integratedCards: ownCards.filter(e => e.integrated).length,
        cardChapters: ownCards.reduce((sum, c) => sum + c.expected, 0),
        registeredCardChapters: ownCards.flatMap(e => e.chapters).length,
        availableCardChapters: ownCards.flatMap(e => e.chapters).filter(c => c.available).length,
        integratedCardChapters: ownCards.flatMap(e => e.chapters).filter(c => c.integrated).length,
        recruitment: live.filter(e => e.storyType === 'recruitment').length, arcs: live.filter(e => e.storyType === 'arc').length,
        exclusiveActions: count('activity', 'exclusive'), participantActions: count('activity', 'participant'),
        topics: count('topic', 'exclusive'), dialogues: count('dialogue', 'exclusive'), participantDialogues: count('dialogue', 'participant'),
        exclusiveEvents: count('event', 'exclusive'), participantEvents: count('event', 'participant'), conditionEvents: count('event', 'condition'),
        pending: items.filter(e => e.versions.some(v => ['review', 'revision'].includes(v.approval) && v.relations.some(r => r.idolId === idol.id))).length },
      keys: related.map(e => e.key),
      pendingKeys: items.filter(e => e.versions.some(v => ['review', 'revision'].includes(v.approval) && v.relations.some(r => r.idolId === idol.id))).map(e => e.key) };
  });
  return { schemaVersion: 1, basis: '已接入（源包），不代表已部署或可触发', idols, cards, dateScenarios, entries: items,
    sharedKeys: items.filter(e => e.scope === 'shared').map(e => e.key),
    unresolvedKeys: items.filter(e => e.scope === 'unresolved').map(e => e.key), warnings: [...new Set(warnings)].sort(compare) };
}
