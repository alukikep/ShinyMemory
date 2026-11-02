import { describe, expect, it } from 'vitest';
import { BASE_PACK } from '../core/content/basePack';
import { countHiragana, findJapaneseLines, looksJapanese } from './japaneseText';
import type { ReviewDraft } from './types';
import { validateReviewDraft } from './validation';

describe('japanese text detection', () => {
  it('flags a full Japanese sentence', () => {
    expect(looksJapanese('……もしかして、ライブパフォーマンスに出演する方ですか？')).toBe(true);
    expect(looksJapanese('（それにしては、ずいぶんあどけないような……）')).toBe(true);
  });

  it('flags a short but complete Japanese line', () => {
    // 7 个平假名 / 9 个可见字符
    expect(looksJapanese('うん……ありがとう。')).toBe(true);
  });

  it('flags a Chinese line with a whole Japanese clause left in', () => {
    expect(looksJapanese('……あ、制作人先生。お、おはようございます……！')).toBe(true);
  });

  it('keeps 口癖 / 拟声 / 方言词', () => {
    expect(looksJapanese('ふふー。')).toBe(false);
    expect(looksJapanese('……きゅっきゅ♪')).toBe(false);
    expect(looksJapanese('んふふー♪ 那是我的故乡嘛，当然的ばい！')).toBe(false);
    expect(looksJapanese('ごし、ごし♪')).toBe(false);
  });

  it('keeps katakana proper nouns inside Chinese lines', () => {
    // 组合名是片假名，但不是日语句子
    expect(looksJapanese('还有，你要以『放課後クライマックスガールズ』这个五人组合活动。')).toBe(false);
    expect(looksJapanese('「长崎啊……海、坡道、ちゃんぽん的味道……」')).toBe(false);
  });

  it('keeps repeated hiragana nicknames inside Chinese lines', () => {
    // なーちゃん ×2 = 8 个平假名，但占比只有 21%
    expect(looksJapanese('啊，呃……なーちゃん是……甜花的妹妹……')).toBe(false);
    expect(looksJapanese('可是なーちゃん那样说了……所以，为了なーちゃん，甜花想努力试试……')).toBe(false);
  });

  it('reports the path of the offending string', () => {
    const lines = findJapaneseLines({
      nodes: {
        '3': { speakerId: 'haruki', text: '（ここでスカウト、ってことはないと思うけど）' },
        '4': { speakerId: 'haruki', text: '「辛苦了。」' },
      },
    });
    expect(lines).toHaveLength(1);
    expect(lines[0]!.path).toBe('nodes.3.text');
    expect(countHiragana(lines[0]!.text)).toBeGreaterThan(0);
  });

  it('walks arrays (choices / resultTexts) too', () => {
    const lines = findJapaneseLines({
      resultTexts: ['好，出发吧。', 'はい、わかりました。よろしくお願いします。'],
    });
    expect(lines.map((line) => line.path)).toEqual(['resultTexts[1]']);
  });

  it('surfaces as a warning, not an error, in review validation', () => {
    const draft: ReviewDraft = {
      id: 'draft.japanese.test',
      kind: 'event',
      title: '测试事件',
      status: 'review',
      payload: {
        id: 'evt.japanese.test',
        title: '测试事件',
        text: '正文',
        choices: [
          {
            label: '选项',
            result: '……はい。……よろしくお願いしますー。',
            effects: [{ kind: 'attributeExp', ref: 'trust', tier: 1 }],
          },
        ],
      },
      annotations: [],
      createdAt: '2026-11-02T00:00:00.000Z',
      updatedAt: '2026-11-02T00:00:00.000Z',
    };
    const result = validateReviewDraft(draft, BASE_PACK);
    expect(result.ok).toBe(true);
    expect(result.warnings.some((line) => line.includes('japanese-text'))).toBe(true);
  });
});
