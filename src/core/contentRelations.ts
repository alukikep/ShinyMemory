import type { ContentPack } from './contentIndexCore';
import type { StoryChainDef } from './types';
import type { ReviewKind } from '../review/types';
import type { InventoryRelation } from '../shared/contentInventoryTypes';

export type ContentRecord = Record<string, unknown>;
const record = (value: unknown): ContentRecord => value && typeof value === 'object' && !Array.isArray(value) ? value as ContentRecord : {};
const strings = (value: unknown): string[] => Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
const compare = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;
export const contentKey = (kind: string, payload: ContentRecord) => kind === 'topic'
  ? `topic:${String(payload.actorId ?? '?')}/${String(payload.id)}` : `${kind}:${String(payload.id)}`;
export const packGroups = (pack: ContentPack) => ({ activity: pack.activities, event: pack.events, job: pack.jobs, dialogue: pack.dialogues,
  story: pack.storyChains, item: pack.items, shop: pack.shops,
  topic: pack.actors.flatMap(actor => actor.topics.map(topic => ({ ...topic, actorId: actor.id }))) });

/** Explicit association facts only. Coverage/production policies decide how to count these facts. */
export function createContentRelationAnalyzer(pack: ContentPack, registeredChains: readonly StoryChainDef[] = []) {
  const idolIds = new Set(pack.idols.map(i => i.id));
  const chainMap = new Map(registeredChains.map(c => [c.id, c]));
  for (const chain of pack.storyChains) chainMap.set(chain.id, chain);
  const dialogueHosts = new Map<string, InventoryRelation[]>();
  for (const chain of chainMap.values()) for (const step of chain.steps) {
    const hosts = dialogueHosts.get(step.dialogueId) ?? [];
    hosts.push({ idolId: chain.idolId, role: 'exclusive', path: `story:${chain.id}.steps.${step.id}.dialogueId` });
    dialogueHosts.set(step.dialogueId, hosts);
  }
  return function analyze(kind: ReviewKind, payload: ContentRecord) {
    const found: InventoryRelation[] = [];
    const warnings: string[] = [];
    const add = (value: unknown, role: InventoryRelation['role'], path: string) => {
      if (typeof value !== 'string') return;
      if (idolIds.has(value)) found.push({ idolId: value, role, path });
      else if (path === 'idolId' || path.startsWith('idolIds') || path.startsWith('afterIdol') || path.startsWith('cast[') || path.startsWith('participantIds[') || path.startsWith('story:') || /\.idolIds?(\[|$)/.test(path)) warnings.push(`${kind}:${String(payload.id)} 未知偶像 ${value} (${path})`);
    };
    add(payload.idolId, 'exclusive', 'idolId');
    const ids = strings(payload.idolIds);
    ids.forEach((id, n) => add(id, ids.length === 1 ? 'exclusive' : 'participant', `idolIds[${n}]`));
    if (kind === 'topic') add(payload.actorId, 'exclusive', 'actorId');
    for (const field of ['cast', 'participantIds']) strings(payload[field]).forEach((id, n) => add(id, 'participant', `${field}[${n}]`));
    const afterIds = strings(record(payload.afterIdol).ids);
    afterIds.forEach((id, n) => add(id, afterIds.length === 1 ? 'exclusive' : 'participant', `afterIdol.ids[${n}]`));
    function walk(value: unknown, path: string, conditional = false) {
      if (Array.isArray(value)) { value.forEach((v, n) => walk(v, `${path}[${n}]`, conditional)); return; }
      for (const [key, v] of Object.entries(record(value))) {
        const next = path ? `${path}.${key}` : key;
        const condition = conditional || ['when', 'requires', 'revealWhen'].includes(key);
        if (path && ['idolId', 'actorId', 'speakerId'].includes(key)) add(v, key === 'speakerId' ? 'participant' : condition ? 'condition' : 'reference', next);
        if (path && key === 'idolIds') strings(v).forEach((id, n) => add(id, condition ? 'condition' : 'reference', `${next}[${n}]`));
        walk(v, next, condition);
      }
    }
    walk(payload, '');
    if (kind === 'dialogue') for (const host of dialogueHosts.get(String(payload.id)) ?? []) add(host.idolId, host.role, host.path);
    return { relations: [...new Map(found.map(r => [`${r.idolId}/${r.role}/${r.path}`, r])).values()]
      .sort((a, b) => compare(JSON.stringify(a), JSON.stringify(b))), warnings: [...new Set(warnings)].sort(compare) };
  };
}
