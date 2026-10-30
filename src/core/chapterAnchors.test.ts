import { describe, expect, it } from 'vitest';
import {
  validateChapterAnchors,
  validateChapterShape,
  validateChapterStructure,
  type ChapterSource,
} from './chapterAnchors';

/**
 * 锚点 = 原作里必须覆盖到的**行 id**。
 * 中文是我们自己写的，没有权威译本可比；id 能对着游戏剧本（私有缓存）核对。
 */

const chapter: ChapterSource = {
  chapterId: 'chapter-1',
  source: 'data/story/test/card.csv',
  script: '200300599',
  anchors: ['2003005990010', '2003005990100', '2003005990200'],
};

const scriptIds = new Set(['2003005990010', '2003005990100', '2003005990200']);

const baseOptions = {
  readScriptIds: () => scriptIds,
};

describe('chapter anchors', () => {
  it('accepts a chapter whose anchor ids exist in the script', () => {
    expect(validateChapterAnchors([chapter], baseOptions)).toEqual([]);
  });

  it('rejects an anchor id the script does not have', () => {
    const problems = validateChapterAnchors(
      [{ ...chapter, anchors: ['2003005990010', '2003005999999', '2003005990200'] }],
      baseOptions,
    );
    expect(problems.some((p) => p.message.includes('剧本里不存在'))).toBe(true);
  });

  it('requires at least three anchors', () => {
    const problems = validateChapterAnchors(
      [{ ...chapter, anchors: ['2003005990010'] }],
      baseOptions,
    );
    expect(problems.some((p) => p.message.includes('锚点不足'))).toBe(true);
  });

  it('skips id checks when the private script cache is unavailable', () => {
    expect(
      validateChapterAnchors([chapter], { readScriptIds: () => undefined }),
    ).toEqual([]);
  });
});

describe('chapter structure', () => {
  const chainId = 'meguru-chapter-1';

  const probe = {
    chains: new Map([
      [
        chainId,
        {
          idolId: 'meguru',
          stepCount: 2,
          steps: [
            { dialogueId: 'dialogue.a', locationId: 'shopping_street' },
            { dialogueId: 'dialogue.b', locationId: 'office' },
          ],
        },
      ],
    ]),
    dialogueIds: new Set(['dialogue.a', 'dialogue.b']),
    locationIds: new Set(['shopping_street', 'office']),
  };

  it('accepts a chapter whose chain wires up', () => {
    expect(
      validateChapterStructure([{ ...chapter, chapterId: chainId }], probe),
    ).toEqual([]);
  });

  it('rejects a chapter with no matching chain', () => {
    const problems = validateChapterStructure(
      [{ ...chapter, chapterId: 'missing-chapter' }],
      probe,
    );
    expect(problems.some((p) => p.message.includes('找不到同名剧情链'))).toBe(
      true,
    );
  });

  it('rejects steps pointing at missing dialogues or locations', () => {
    const problems = validateChapterStructure([{ ...chapter, chapterId: chainId }], {
      ...probe,
      dialogueIds: new Set(['dialogue.b']),
      locationIds: new Set(['office']),
    });
    expect(problems.some((p) => p.message.includes('对话不存在'))).toBe(true);
    expect(problems.some((p) => p.message.includes('地点不存在'))).toBe(true);
  });

  it('rejects an unregistered chapter chain', () => {
    const problems = validateChapterStructure([], probe);
    expect(
      problems.some((p) => p.message.includes('没在 chapterSources 登记')),
    ).toBe(true);
  });
});

describe('chapter shape', () => {
  const nodes = (branchLength: number) => {
    const built: Record<string, { nextNodeId?: string; choices?: { label: string; nextNodeId: string }[] }> = {
      start: {
        choices: [
          { label: 'A', nextNodeId: 'a1' },
          { label: 'B', nextNodeId: 'b1' },
        ],
      },
    };
    for (const key of ['a', 'b'] as const) {
      for (let index = 1; index <= branchLength; index += 1) {
        built[`${key}${index}`] = {
          nextNodeId: index === branchLength ? 'merge' : `${key}${index + 1}`,
        };
      }
    }
    built.merge = {};
    return built;
  };

  it('rejects a card chapter split into several steps', () => {
    const problems = validateChapterShape([
      { chapterId: 'c1', stepCount: 3 },
    ]);
    expect(problems.some((p) => p.message.includes('1 步'))).toBe(true);
  });

  it('rejects thin branches when the source has branch content', () => {
    const problems = validateChapterShape([
      {
        chapterId: 'c1',
        stepCount: 1,
        expectBranch: true,
        dialogue: { startNodeId: 'start', nodes: nodes(1) },
      },
    ]);
    expect(problems.some((p) => p.message.includes('分支只有'))).toBe(true);
  });

  it('accepts thin branches when the source converges immediately', () => {
    const problems = validateChapterShape([
      {
        chapterId: 'c1',
        stepCount: 1,
        expectBranch: false,
        dialogue: { startNodeId: 'start', nodes: nodes(1) },
      },
    ]);
    expect(problems).toEqual([]);
  });

  it('accepts thick branches that converge', () => {
    const problems = validateChapterShape([
      {
        chapterId: 'c1',
        stepCount: 1,
        expectBranch: true,
        dialogue: { startNodeId: 'start', nodes: nodes(4) },
      },
    ]);
    expect(problems).toEqual([]);
  });

  it('rejects more than one choice point in a chapter', () => {
    const graph = nodes(3);
    graph.merge = { choices: [{ label: 'A', nextNodeId: 'merge2' }, { label: 'B', nextNodeId: 'merge2' }] };
    graph.merge2 = {};
    const problems = validateChapterShape([
      { chapterId: 'c1', stepCount: 1, dialogue: { startNodeId: 'start', nodes: graph } },
    ]);
    expect(problems.some((p) => p.message.includes('0 或 1 个'))).toBe(true);
  });
});
