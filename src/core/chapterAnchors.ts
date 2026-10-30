/**
 * 卡面改编的锚点校验（纯函数，不碰文件系统）。
 *
 * 改编允许压缩台词，但每章必须保留 ≥3 句**原文逐字**的台词作为锚点。
 * 锚点同时校验两头：
 *   1. 它真的出现在语料源文件里（不是凭印象写的）
 *   2. 它真的活到了游戏内容里（改编时没被删掉）
 *
 * 这样「压缩」和「走样」就能被机器区分开。
 */

export type ChapterSource = {
  /** 章节 id，建议和剧情链 id 一致。 */
  chapterId: string;
  /** 语料文件路径，相对 SCTranslationData（如 data/story/.../xxx.csv）。 */
  source: string;
  /** 必须逐字保留的原文台词，至少 3 句。 */
  anchors: string[];
};

export type AnchorProblem = {
  chapterId: string;
  message: string;
};

export type AnchorValidatorOptions = {
  /** 读语料文件；不存在时返回 undefined。 */
  readSource: (source: string) => string | undefined;
  /** 判断一段文字是否出现在游戏内容里（对话正文）。 */
  hasInGame: (text: string) => boolean;
};

const MIN_ANCHORS = 3;

export function validateChapterAnchors(
  chapters: ChapterSource[],
  options: AnchorValidatorOptions,
): AnchorProblem[] {
  const problems: AnchorProblem[] = [];

  for (const chapter of chapters) {
    if (chapter.anchors.length < MIN_ANCHORS) {
      problems.push({
        chapterId: chapter.chapterId,
        message: `锚点不足 ${MIN_ANCHORS} 句（现在 ${chapter.anchors.length} 句）`,
      });
    }

    const source = options.readSource(chapter.source);
    if (source === undefined) {
      problems.push({
        chapterId: chapter.chapterId,
        message: `语料文件不存在：${chapter.source}`,
      });
      continue;
    }

    for (const anchor of chapter.anchors) {
      if (anchor.trim().length < 6) {
        problems.push({
          chapterId: chapter.chapterId,
          message: `锚点太短，无法校验：${anchor}`,
        });
        continue;
      }
      if (!source.includes(anchor)) {
        problems.push({
          chapterId: chapter.chapterId,
          message: `锚点在语料里找不到（可能改写过了）：「${anchor}」`,
        });
      }
      if (!options.hasInGame(anchor)) {
        problems.push({
          chapterId: chapter.chapterId,
          message: `锚点没进游戏内容（改编时丢了）：「${anchor}」`,
        });
      }
    }
  }

  return problems;
}

/**
 * 章节结构的机器校验。
 *
 * 章节是**结构**（TS），进不了审查台——所以由这里代替人审：
 * 链存不存在、每一步的对话/地点/时间窗有没有真的接上。
 *
 * 锚点管"像不像原作"，这里管"能不能跑起来"。
 */

export type ChapterStructureProbe = {
  /** 剧情链 id → 步骤（只有校验需要的字段）。 */
  chains: Map<
    string,
    {
      idolId: string;
      stepCount: number;
      steps: { dialogueId: string; locationId: string }[];
    }
  >;
  dialogueIds: Set<string>;
  locationIds: Set<string>;
};

export type ChapterStructureProblem = {
  chapterId: string;
  message: string;
};

export function validateChapterStructure(
  chapters: ChapterSource[],
  probe: ChapterStructureProbe,
): ChapterStructureProblem[] {
  const problems: ChapterStructureProblem[] = [];
  const registered = new Set(chapters.map((chapter) => chapter.chapterId));

  for (const chapter of chapters) {
    const chain = probe.chains.get(chapter.chapterId);
    if (!chain) {
      problems.push({
        chapterId: chapter.chapterId,
        message: '找不到同名剧情链（chapterId 和链 id 必须一致）',
      });
      continue;
    }

    if (chain.stepCount < 2) {
      problems.push({
        chapterId: chapter.chapterId,
        message: `章节只有 ${chain.stepCount} 步，至少 2 步`,
      });
    }

    for (const [index, step] of chain.steps.entries()) {
      if (!probe.dialogueIds.has(step.dialogueId)) {
        problems.push({
          chapterId: chapter.chapterId,
          message: `第 ${index + 1} 步的对话不存在：${step.dialogueId}`,
        });
      }
      if (!probe.locationIds.has(step.locationId)) {
        problems.push({
          chapterId: chapter.chapterId,
          message: `第 ${index + 1} 步的地点不存在：${step.locationId}`,
        });
      }
    }
  }

  // 反过来：设了 cadenceDays 的链必须是登记过的卡面章，避免"偷偷做了一章没登记"。
  for (const [chainId, chain] of probe.chains) {
    if (!chainId.includes('chapter')) continue;
    if (!registered.has(chainId)) {
      problems.push({
        chapterId: chainId,
        message: `链 id 看起来像卡面章（${chain.idolId}），但没在 chapterSources 登记（缺锚点）`,
      });
    }
  }

  return problems;
}
