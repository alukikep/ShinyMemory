import type { DialogueNode } from './types';

/**
 * 按**阅读顺序**展开一段对话，分支就地展开。
 *
 * 规则：
 * - 从 startNodeId 沿 nextNodeId 走
 * - 遇到 choices：**先**把每条分支分别走到"汇合点"（停止点），再继续汇合之后的正文
 * - 汇合点 = 所有分支都能到达的最近节点
 *
 * 之前是"先走完第一条分支的整条线再回来"，结果另一条分支被排到章节末尾，
 * 看起来像"后面才发生"——审查时读不出因果。
 */

export type DialogueWalkEntry = {
  nodeId: string;
  depth: number;
  node: DialogueNode;
  /** 这一行是哪个选项引出来的（根节点没有）。 */
  viaChoice?: string;
};

export function walkDialogue(
  nodes: Record<string, DialogueNode>,
  startNodeId: string,
): DialogueWalkEntry[] {
  const entries: DialogueWalkEntry[] = [];
  const visited = new Set<string>();

  const reachable = (id: string): Set<string> => {
    const seen = new Set<string>();
    const queue = [id];
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (seen.has(current) || !nodes[current]) continue;
      seen.add(current);
      const node = nodes[current]!;
      if (node.nextNodeId) queue.push(node.nextNodeId);
      for (const choice of node.choices ?? []) queue.push(choice.nextNodeId);
    }
    return seen;
  };

  /** 线性走一条链，遇到 stop 就停（不含 stop）。 */
  const visitLinear = (
    id: string | undefined,
    depth: number,
    viaChoice: string | undefined,
    stop: Set<string>,
  ) => {
    let current = id;
    let guard = 0;
    while (current && guard < 200) {
      guard += 1;
      if (stop.has(current) || visited.has(current)) return;
      const node = nodes[current];
      if (!node) return;
      visited.add(current);
      entries.push({ nodeId: current, depth, node, viaChoice });

      if (node.choices && node.choices.length > 0) {
        visitChoice(current, depth);
        return;
      }
      current = node.nextNodeId;
      viaChoice = undefined;
    }
  };

  const visitChoice = (nodeId: string, depth: number) => {
    const node = nodes[nodeId]!;
    const choices = node.choices ?? [];
    const starts = choices.map((choice) => choice.nextNodeId);

    // 汇合点：所有分支都能到达的节点里，离起点最近的那个。
    const sets = starts.map((id) => reachable(id));
    const common = sets.length === 0
      ? new Set<string>()
      : new Set([...sets[0]!].filter((id) => sets.every((set) => set.has(id))));
    const merge = [...common][0];

    const stop = new Set<string>(merge ? [merge] : []);
    for (const choice of choices) {
      visitLinear(choice.nextNodeId, depth + 1, choice.label, stop);
    }
    if (merge) visitLinear(merge, depth, undefined, new Set());
  };

  visitLinear(startNodeId, 0, undefined, new Set());

  // 孤立节点（跳转表没连上）也列出来，方便发现"写了但没接进去"。
  for (const nodeId of Object.keys(nodes)) {
    if (!visited.has(nodeId)) visitLinear(nodeId, 0, undefined, new Set());
  }

  return entries;
}
