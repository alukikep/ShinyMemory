import type { ContentPack } from './contentIndexCore';
import type { StoryChainDef } from './types';
import type { ApprovedContent } from './content/approvedPacking';
import { mergeApprovedContent } from '../review/approval';

export type AssemblyDiagnostic =
  | { kind: 'merge-conflict'; message: string }
  | { kind: 'duplicate-chain'; chainId: string; message: string }
  | { kind: 'missing-dialogue'; chainId: string; stepId: string; dialogueId: string; message: string };
export type ChapterAssemblyStatus = {
  chainId: string; attached: boolean;
  steps: { stepId: string; dialogueId: string; available: boolean }[];
};

/** Injectable chapter attachment. Diagnostics do not change the existing append/filter policy. */
export function attachRegisteredChapters(pack: ContentPack, chapters: readonly StoryChainDef[]) {
  const dialogueIds = new Set(pack.dialogues.map(d => d.id));
  const seen = new Set(pack.storyChains.map(c => c.id));
  const diagnostics: AssemblyDiagnostic[] = [];
  const statuses: ChapterAssemblyStatus[] = [];
  const attached: StoryChainDef[] = [];
  for (const chain of chapters) {
    if (seen.has(chain.id)) diagnostics.push({ kind: 'duplicate-chain', chainId: chain.id, message: `章节登记链 ID 重复：${chain.id}` });
    seen.add(chain.id);
    const steps = chain.steps.map(step => {
      const available = dialogueIds.has(step.dialogueId);
      if (!available) diagnostics.push({ kind: 'missing-dialogue', chainId: chain.id, stepId: step.id,
        dialogueId: step.dialogueId, message: `链 ${chain.id} 步骤 ${step.id} 缺对话：${step.dialogueId}` });
      return { stepId: step.id, dialogueId: step.dialogueId, available };
    });
    const ready = steps.every(step => step.available);
    statuses.push({ chainId: chain.id, attached: ready, steps });
    if (ready) attached.push(chain);
  }
  return { pack: { ...pack, storyChains: [...pack.storyChains, ...attached] }, diagnostics, chapters: statuses };
}

/** Same merge/attach pipeline for generated snapshots and approved filesystem inputs. No IO or registry globals. */
export function assembleContent(base: ContentPack, approved: ApprovedContent, chapters: readonly StoryChainDef[]) {
  const merged = mergeApprovedContent(base, approved);
  const attached = attachRegisteredChapters(merged.pack, chapters);
  return { mergedPack: merged.pack, pack: attached.pack, duplicates: merged.duplicates,
    chapters: attached.chapters,
    diagnostics: [
      ...merged.duplicates.map((message): AssemblyDiagnostic => ({ kind: 'merge-conflict', message })),
      ...attached.diagnostics,
    ] };
}
