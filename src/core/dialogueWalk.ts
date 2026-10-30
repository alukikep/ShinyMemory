import type { DialogueNode } from './types';

/**
 * 按**阅读顺序**展开一段对话。
 *
 * 审查台原来直接 `Object.keys(nodes)` 渲染，分支节点（n02a/n03b）全排在最后，
 * 读的时候要在脑子里跑一遍跳转表。这里从 startNodeId 沿 nextNodeId 走，
 * 分支处缩进——读到的顺序就是玩家看到的顺序。
 *
 * 说明：
 * - 有环也能停（visited）
 * - 分支节点按选项顺序依次展开，深度 +1
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

  const visit = (nodeId: string, depth: number, viaChoice?: string) => {
    if (visited.has(nodeId)) return;
    const node = nodes[nodeId];
    if (!node) return;
    visited.add(nodeId);
    entries.push({ nodeId, depth, node, viaChoice });

    if (node.choices && node.choices.length > 0) {
      for (const choice of node.choices) {
        visit(choice.nextNodeId, depth + 1, choice.label);
      }
      return;
    }
    if (node.nextNodeId) visit(node.nextNodeId, depth);
  };

  visit(startNodeId, 0);

  // 孤立节点（跳转表没连上）也列出来，方便发现"写了但没接进去"。
  for (const nodeId of Object.keys(nodes)) {
    if (!visited.has(nodeId)) visit(nodeId, 0);
  }

  return entries;
}
