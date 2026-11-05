import type { ContentIndex } from './contentIndexCore';
import type { DateScenarioDef, Effect } from './types';
import { EXP_TIER_VALUES } from './growth';

/** Acyclic, bounded trust-only reward dialogue. No cross-character or schedule effects hidden in choices. */
export function validateDateScenario(s: DateScenarioDef, index: ContentIndex): string[] {
  const errors: string[] = [];
  const fail = (text: string) => errors.push(`${s.id}: ${text}`);
  const actor = index.actors.get(s.idolId);
  if (!index.idols.has(s.idolId) || actor?.role !== 'idol') fail('未知偶像');
  const location = index.locations.get(s.locationId);
  if (!location || location.reachable === false || location.kind === 'area' || s.locationId === 'home') fail('必须使用可达的公开成员/独立地点');
  if (!s.id || !s.title) fail('缺少方案 ID 或名称');
  if (!Number.isInteger(s.fee) || s.fee <= 0 || !Number.isInteger(s.rewardBudget) || s.rewardBudget < 0 || s.rewardBudget > 20) fail('费用或奖励预算无效（奖励预算上限 20）');
  if (![s.durationMinutes, s.arrivalWindowMinutes].every(n => Number.isInteger(n) && n > 0) || s.durationMinutes + s.arrivalWindowMinutes > 12 * 60) fail('时间范围无效');
  if (!(s.penaltyTier in EXP_TIER_VALUES)) fail('处罚档位无效');
  const dialogue = index.dialogues.get(s.dialogueId);
  if (!dialogue) { fail('对话尚未接入'); return errors; }
  const nodes = dialogue.nodes;
  if (dialogue.idolId !== s.idolId || dialogue.participantIds?.some(id => id !== s.idolId)) fail('对话目标必须是预约偶像');
  const active = new Set<string>();
  const memo = new Map<string, number>();
  function reward(effects: Effect[] = []): number {
    let total = 0;
    for (const e of effects) {
      if (e.kind === 'log' || e.kind === 'flag') continue;
      if (e.kind !== 'attributeExp' || (typeof e.ref === 'string' ? e.ref !== 'trust' : e.ref.scope !== 'idol' || e.ref.key !== 'trust') || !(e.tier in EXP_TIER_VALUES)) { fail('约会对话仅支持信任经验、flag 与日志效果'); continue; }
      total += e.direction === 'loss' ? 0 : EXP_TIER_VALUES[e.tier];
    }
    return total;
  }
  function visit(id: string): number {
    if (active.has(id)) { fail('约会对话不能循环领取奖励'); return 0; }
    if (memo.has(id)) return memo.get(id)!;
    const node = nodes[id];
    if (!node) { fail(`缺少对话节点 ${id}`); return 0; }
    if (node.choices?.length && !node.choices.some(c => !c.requires?.length)) fail(`节点 ${id} 必须保留一个无条件选项`);
    active.add(id);
    const branches = node.choices?.length ? node.choices.map(c => reward(c.effects) + visit(c.nextNodeId)) : [node.nextNodeId ? visit(node.nextNodeId) : 0];
    const total = reward(node.effects) + Math.max(...branches);
    active.delete(id);
    memo.set(id, total);
    return total;
  }
  if (visit(dialogue.startNodeId) > s.rewardBudget) fail('对话最大路径奖励超过预算');
  return [...new Set(errors)];
}
