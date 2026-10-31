import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { BASE_PACK } from '../src/core/content/basePack.js';
import { packApprovedFiles } from '../src/core/content/approvedPacking.js';
import {
  validateChapterAnchors,
  validateChapterShape,
  validateChapterStructure,
  validateChapterTriggers,
} from '../src/core/chapterAnchors.js';
import { CHAPTER_SOURCES } from '../src/core/content/chapterSources.js';
import { PENDING_CHAPTERS } from '../src/core/content/chapters/index.js';
import { buildContentIndex } from '../src/core/contentIndexCore.js';
import { mergeApprovedContent } from '../src/review/approval.js';
import { readApprovedDrafts } from './approvedFiles.js';

/**
 * 卡面改编的锚点校验。
 *
 * 改编允许压缩，但每章必须保留 ≥3 句逐字原文。这个脚本同时查两头：
 *   语料里有没有   → 防止凭印象编台词
 *   游戏里有没有   → 防止压缩时顺手删掉
 *
 * 用法：npm run content:anchors（已接进 content:validate）
 */

const corpusRoot = path.join(process.cwd(), '..', 'SCTranslationData');
const corpusAvailable = existsSync(path.join(corpusRoot, 'data', 'story'));

const approved = await readApprovedDrafts();
const merged = mergeApprovedContent(
  BASE_PACK,
  packApprovedFiles(
    Object.fromEntries(approved.map(({ file, draft }) => [file, draft])),
  ),
);
const index = buildContentIndex(merged.pack);

// 待审的对话草稿也算"内容"——章节在过审之前不该让构建变红。
const pendingDialogues = readdirSync('content-review/drafts')
  .filter((name) => name.startsWith('draft.dialogue.') && name.endsWith('.json'))
  .map((name) => {
    const draft = JSON.parse(
      readFileSync(`content-review/drafts/${name}`, 'utf8'),
    ) as {
      payload?: { id?: string; nodes?: Record<string, { text?: string }> };
    };
    const nodes = (draft.payload?.nodes ?? {}) as Record<
      string,
      { nextNodeId?: string; choices?: { label: string; nextNodeId: string }[] }
    >;
    return {
      id: draft.payload?.id ?? '',
      text: Object.values(nodes)
        .map((node: { text?: string }) => node.text ?? '')
        .join('\n'),
      nodes,
      startNodeId: draft.payload?.startNodeId ?? '',
    };
  });

const pendingDialogueText = pendingDialogues.map((entry) => entry.text).join('\n');
const pendingDialogueIds = pendingDialogues.map((entry) => entry.id).filter(Boolean);

/** 把所有对话正文拼成一个大字符串，用来判断锚点是否进了游戏。 */
const gameText = [...index.dialogues.values()]
  .flatMap((dialogue) =>
    Object.values(dialogue.nodes).flatMap((node) => [
      node.text,
      ...(node.textVariants ?? []).map((variant) => variant.text),
      ...(node.choices ?? []).map((choice) => choice.result ?? ''),
    ]),
  )
  .join('\n');

const allContentText = `${gameText}\n${pendingDialogueText}`;

const cache = new Map<string, string | undefined>();

/** 原作这一章有几个分支（读私有结构缓存；读不到返回 undefined）。 */
function readExpectedBranches(script: string | undefined): number | undefined {
  if (!script) return undefined;
  const file = path.join(process.cwd(), '.cache', 'shiny', `${script}.structure.json`);
  if (!existsSync(file)) return undefined;
  const structure = JSON.parse(readFileSync(file, 'utf8')) as {
    branches?: { label: string }[];
  };
  return structure.branches?.length ?? 0;
}

function readSource(relative: string): string | undefined {
  if (!corpusAvailable) return undefined;
  if (cache.has(relative)) return cache.get(relative);
  const full = path.join(corpusRoot, relative.replace(/\//g, path.sep));
  const content = existsSync(full) ? readFileSync(full, 'utf8') : undefined;
  cache.set(relative, content);
  return content;
}

if (!corpusAvailable) {
  console.warn(
    '提示：没找到 ../SCTranslationData，只检查了锚点是否在游戏内容里。',
  );
}

// 还没接入 STORY_CHAINS 的章节只提示——过审后再接。
const cardChains = PENDING_CHAPTERS.filter((chain) => (chain.kind ?? 'card') === 'card');

const pendingChapters = CHAPTER_SOURCES.filter(
  (chapter) => !index.storyChains.has(chapter.chapterId),
);
const activeChapters = CHAPTER_SOURCES.filter((chapter) =>
  index.storyChains.has(chapter.chapterId),
);

const problems = [
  ...validateChapterStructure(activeChapters, {
    chains: new Map(
      [...index.storyChains.entries()].map(([id, chain]) => [
        id,
        {
          idolId: chain.idolId,
          stepCount: chain.steps.length,
          steps: chain.steps.map((step) => ({
            dialogueId: step.dialogueId,
            locationId: step.locationId,
          })),
        },
      ]),
    ),
    dialogueIds: new Set([...index.dialogues.keys(), ...pendingDialogueIds]),
    locationIds: new Set(index.locations.keys()),
  }),
  ...validateChapterTriggers(
    [...cardChains].map((chain) => {
      const step = chain.steps[0];
      const needsFlags = (step?.when ?? [])
        .filter((condition) => condition.kind === 'flag')
        .map((condition) => String((condition as { key?: string }).key ?? ''));
      const setsFlags = (step?.effects ?? [])
        .filter((effect) => effect.kind === 'flag')
        .map((effect) => String((effect as { key?: string }).key ?? ''));
      const day = (step?.when ?? []).find((c) => c.kind === 'dayAtLeast') as
        | { day?: number }
        | undefined;
      return {
        chapterId: chain.id,
        idolId: chain.idolId,
        needsFlags,
        setsFlags,
        day: day?.day,
        locationId: step?.locationId,
        fromMinute: step?.timeWindow?.fromMinute,
        toMinute: step?.timeWindow?.toMinute,
      };
    }),
  ),
  ...validateChapterShape(
    CHAPTER_SOURCES.map((chapter) => {
      const chain =
        index.storyChains.get(chapter.chapterId) ??
        cardChains.find((entry) => entry.id === chapter.chapterId);
      const dialogueId = chain?.steps[0]?.dialogueId;
      const draft =
        pendingDialogues.find((entry) => entry.id === dialogueId) ??
        (dialogueId && index.dialogues.has(dialogueId)
          ? {
              id: dialogueId,
              startNodeId: index.dialogues.get(dialogueId)!.startNodeId,
              nodes: index.dialogues.get(dialogueId)!.nodes as Record<
                string,
                { nextNodeId?: string; choices?: { label: string; nextNodeId: string }[] }
              >,
            }
          : undefined);
      return {
        chapterId: chapter.chapterId,
        stepCount: chain?.steps.length ?? 0,
        expectedBranches: readExpectedBranches(chapter.script),
        dialogue: draft
          ? { startNodeId: draft.startNodeId, nodes: draft.nodes }
          : undefined,
      };
    }),
  ),
  // 锚点对「全部登记章节」都校验：待审草稿也算内容，没理由跳过。
  ...validateChapterAnchors(CHAPTER_SOURCES, {
    readScriptText(script) {
      const file = path.join(process.cwd(), '.cache', 'shiny', `${script}.json`);
      if (!existsSync(file)) return undefined;
      const entries = JSON.parse(readFileSync(file, 'utf8')) as { text?: string }[];
      return entries.map((entry) => entry.text ?? '').join('\n');
    },
    readScriptIds(script) {
      const file = path.join(process.cwd(), '.cache', 'shiny', `${script}.json`);
      if (!existsSync(file)) return undefined;
      const entries = JSON.parse(readFileSync(file, 'utf8')) as { id?: number }[];
      return new Set(
        entries
          .map((entry) => String(entry.id ?? ''))
          .filter((id) => id && id !== '0'),
      );
    },
  }),
];

// 登记过的章节（哪怕还没接进 base）也要检查地点存在
for (const chapter of CHAPTER_SOURCES) {
  const chain =
    index.storyChains.get(chapter.chapterId) ??
    PENDING_CHAPTERS.find((entry) => entry.id === chapter.chapterId);
  const step = chain?.steps[0];
  if (step && !index.locations.has(step.locationId)) {
    problems.push({
      chapterId: chapter.chapterId,
      message: `地点不存在：${step.locationId}`,
    });
  }
}

for (const chapter of pendingChapters) {
  console.log(
    `  · ${chapter.chapterId}：对话待审，尚未接入 STORY_CHAINS（过审后再加）`,
  );
}

if (CHAPTER_SOURCES.length === 0) {
  console.log('还没有卡面改编章节（chapterSources 为空），跳过锚点校验。');
} else if (problems.length === 0) {
  console.log(
    `卡面锚点通过：${CHAPTER_SOURCES.length} 章，共 ${CHAPTER_SOURCES.reduce(
      (sum, chapter) => sum + chapter.anchors.length,
      0,
    )} 句锚点。`,
  );
} else {
  console.error('卡面锚点未通过：\n');
  for (const problem of problems) {
    console.error(`  [${problem.chapterId}] ${problem.message}`);
  }
  console.error('\n规则见 docs/content/playbook.md 的「卡面改编」一节。');
  process.exitCode = 1;
}
