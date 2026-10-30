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
