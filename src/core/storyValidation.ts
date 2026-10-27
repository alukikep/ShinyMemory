import type {
  DialogueDef,
  IdolDef,
  LocationDef,
  StoryChainDef,
} from './types';

export type StoryValidation = {
  ok: boolean;
  errors: string[];
};

function reachableNodes(dialogue: DialogueDef): Set<string> {
  const reachable = new Set<string>();
  const queue = [dialogue.startNodeId];
  while (queue.length > 0) {
    const id = queue.shift()!;
    if (reachable.has(id)) continue;
    const node = dialogue.nodes[id];
    if (!node) continue;
    reachable.add(id);
    if (node.nextNodeId) queue.push(node.nextNodeId);
    for (const choice of node.choices ?? []) queue.push(choice.nextNodeId);
  }
  return reachable;
}

export function validateDialogueDef(
  dialogue: DialogueDef,
  idols: Map<string, IdolDef>,
  errors: string[],
): void {
  if (dialogue.idolId && !idols.has(dialogue.idolId)) {
    errors.push(`${dialogue.id}: 偶像不存在：${dialogue.idolId}`);
  }
  if (!dialogue.nodes[dialogue.startNodeId]) {
    errors.push(`${dialogue.id}: startNodeId 不存在：${dialogue.startNodeId}`);
    return;
  }

  const reachable = reachableNodes(dialogue);
  let terminalCount = 0;

  for (const [id, node] of Object.entries(dialogue.nodes)) {
    if (!node.text?.trim()) errors.push(`${dialogue.id}/${id}: 文本为空`);
    if (!reachable.has(id)) errors.push(`${dialogue.id}/${id}: 不可达节点`);
    if (node.nextNodeId && !dialogue.nodes[node.nextNodeId]) {
      errors.push(`${dialogue.id}/${id}: nextNodeId 不存在：${node.nextNodeId}`);
    }
    for (const choice of node.choices ?? []) {
      if (!choice.label.trim()) errors.push(`${dialogue.id}/${id}: 空选项`);
      if (!dialogue.nodes[choice.nextNodeId]) {
        errors.push(
          `${dialogue.id}/${id}: choice.nextNodeId 不存在：${choice.nextNodeId}`,
        );
      }
    }
    if (!node.nextNodeId && !node.choices?.length) terminalCount += 1;
  }

  if (terminalCount === 0) {
    errors.push(`${dialogue.id}: 缺少 terminal 节点`);
  }
}

export function validateStoryContent({
  dialogues,
  chains,
  idols,
  locations,
}: {
  dialogues: Map<string, DialogueDef>;
  chains: Map<string, StoryChainDef>;
  idols: Map<string, IdolDef>;
  locations: Map<string, LocationDef>;
}): StoryValidation {
  const errors: string[] = [];
  const chainStepIds = new Set<string>();

  for (const dialogue of dialogues.values()) {
    validateDialogueDef(dialogue, idols, errors);
  }

  for (const chain of chains.values()) {
    if (!idols.has(chain.idolId)) {
      errors.push(`${chain.id}: 偶像不存在：${chain.idolId}`);
    }
    if (chain.steps.length === 0) errors.push(`${chain.id}: steps 为空`);
    for (const step of chain.steps) {
      if (chainStepIds.has(step.id)) errors.push(`${chain.id}: 重复步骤 ${step.id}`);
      chainStepIds.add(step.id);
      if (!locations.has(step.locationId)) {
        errors.push(`${chain.id}/${step.id}: 地点不存在：${step.locationId}`);
      }
      if (!dialogues.has(step.dialogueId)) {
        errors.push(`${chain.id}/${step.id}: 对话不存在：${step.dialogueId}`);
      }
      if (
        step.timeWindow &&
        (step.timeWindow.fromMinute < 0 ||
          step.timeWindow.toMinute > 1440 ||
          step.timeWindow.fromMinute >= step.timeWindow.toMinute)
      ) {
        errors.push(`${chain.id}/${step.id}: 时间窗非法`);
      }
    }
  }

  return { ok: errors.length === 0, errors };
}
