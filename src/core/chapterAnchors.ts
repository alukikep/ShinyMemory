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
  /**
   * 这张卡里的第几节。index/total 由 content:anchors 按 commu 序号核对，
   * 手填错会直接报红——顺序靠猜会出事（见 playbook §4.9）。
   */
  card?: { title: string; index: number; total: number };
  /** 必须逐字保留的原文台词，至少 3 句。 */
  anchors: string[];
};

export type AnchorProblem = {
  chapterId: string;
  message: string;
};

/** 按 commu id 的第 7–8 位排序后，某一段在卡里的位置。 */
export type CardOrder = { index: number; total: number };

export type AnchorValidatorOptions = {
  /** 给一个章节源文件，返回它在卡里的顺序（拿不到就不校验）。 */
  readCardOrder?: (source: string) => CardOrder | undefined;
  /** 读语料文件；不存在时返回 undefined。 */
  readSource: (source: string) => string | undefined;
  /** 判断一段文字是否出现在游戏内容里（对话正文）。调用方自行归一化。 */
  hasInGame: (text: string, normalize: (value: string) => string) => boolean;
};

const MIN_ANCHORS = 3;

/**
 * 归一化后再比较。
 * 语料 CSV 里的换行是字面的 "\n"，锚点跨行时直接 includes 会失败；
 * 空格同理。所以两边都去掉 "\n" 和空白再比。
 */
function normalize(text: string): string {
  return text.replace(/\\n/g, '').replace(/\s+/g, '');
}

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

    if (chapter.card && options.readCardOrder) {
      const order = options.readCardOrder(chapter.source);
      if (order && (order.index !== chapter.card.index || order.total !== chapter.card.total)) {
        problems.push({
          chapterId: chapter.chapterId,
          message: `卡内序号与语料不一致：写的是第 ${chapter.card.index}/${chapter.card.total} 节，实际是第 ${order.index}/${order.total} 节`,
        });
      }
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
      if (!normalize(source).includes(normalize(anchor))) {
        problems.push({
          chapterId: chapter.chapterId,
          message: `锚点在语料里找不到（可能改写过了）：「${anchor}」`,
        });
      }
      if (!options.hasInGame(anchor, normalize)) {
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
