import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { BASE_PACK } from '../src/core/content/basePack.js';
import { packApprovedFiles } from '../src/core/content/approvedPacking.js';
import {
  validateChapterAnchors,
  validateChapterStructure,
} from '../src/core/chapterAnchors.js';
import { CHAPTER_SOURCES } from '../src/core/content/chapterSources.js';
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

const cache = new Map<string, string | undefined>();

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

const problems = [
  ...validateChapterStructure(CHAPTER_SOURCES, {
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
    dialogueIds: new Set(index.dialogues.keys()),
    locationIds: new Set(index.locations.keys()),
  }),
  ...validateChapterAnchors(CHAPTER_SOURCES, {
    readSource,
    hasInGame: (text, normalize) => normalize(gameText).includes(normalize(text)),
  }),
];

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
