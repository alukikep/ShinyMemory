import { describe, expect, it } from 'vitest';
import { validateChapterAnchors, type ChapterSource } from './chapterAnchors';

/**
 * 锚点校验的两头：语料里有、游戏里也有。
 * 这里用纯函数 + 假数据测，不依赖真实语料库（换机器也能跑）。
 */

const source = 'data/story/test/card.csv';
const corpus = [
  '制作人｜好，那就出门吧课程我晚点给你安排',
  '巡｜能全部都穿到就好了',
  '巡｜能上杂志的只有一件吧',
].join('\n');

const chapter: ChapterSource = {
  chapterId: 'chapter-1',
  source,
  anchors: [
    '能全部都穿到就好了',
    '能上杂志的只有一件吧',
    '那就出门吧课程我晚点',
  ],
};

const baseOptions = {
  readSource: (path: string) => (path === source ? corpus : undefined),
  hasInGame: () => true,
};

describe('chapter anchors', () => {
  it('accepts a chapter whose anchors exist in both places', () => {
    expect(validateChapterAnchors([chapter], baseOptions)).toEqual([]);
  });

  it('rejects anchors that were rewritten', () => {
    const problems = validateChapterAnchors(
      [
        {
          ...chapter,
          anchors: [
            '能全部都穿到吧朋友',
            '能上杂志的只有一件吧',
            '那就出门吧课程我晚点',
          ],
        },
      ],
      baseOptions,
    );
    expect(problems.some((p) => p.message.includes('语料里找不到'))).toBe(true);
  });

  it('rejects anchors that did not survive into the game', () => {
    const problems = validateChapterAnchors([chapter], {
      ...baseOptions,
      hasInGame: (text) => text !== '能上杂志的只有一件吧',
    });
    expect(problems.some((p) => p.message.includes('没进游戏内容'))).toBe(true);
  });

  it('requires at least three anchors', () => {
    const problems = validateChapterAnchors(
      [{ ...chapter, anchors: ['能全部都穿到就好了'] }],
      baseOptions,
    );
    expect(problems.some((p) => p.message.includes('锚点不足'))).toBe(true);
  });

  it('fails when the source file is missing', () => {
    const problems = validateChapterAnchors([chapter], {
      ...baseOptions,
      readSource: () => undefined,
    });
    expect(problems.some((p) => p.message.includes('语料文件不存在'))).toBe(true);
  });
});
