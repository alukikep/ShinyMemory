import type { ChapterSource } from '../chapterAnchors';

/**
 * 卡面改编章节的出处表。
 *
 * 每做一个"卡面章"，就在这里登记一条：
 *   - source：语料文件（相对 SCTranslationData）
 *   - anchors：≥3 句**逐字保留**的原文台词
 *
 * `npm run content:anchors` 会校验两件事：锚点在源文件里、锚点在游戏内容里。
 * 见 docs/content/playbook.md 的「卡面改编」一节。
 */
export const CHAPTER_SOURCES: ChapterSource[] = [
  {
    chapterId: 'meguru-swimsuit',
    source:
      'data/story/八宮めぐる/【夏に恋するピチカート！】八宮めぐる/カラフルサマー.csv',
    anchors: [
      '能全部都穿到就好了——！',
      '能上杂志的只有一件吧……嗯——……好难选——！',
      '……这么大的尺寸应该比较适合制作人了——',
    ],
  },
  {
    chapterId: 'meguru-sunshine',
    source:
      'data/story/八宮めぐる/【夏に恋するピチカート！】八宮めぐる/太陽のしずく.csv',
    anchors: [
      '明明在工作，说开心真的好吗',
      '谢谢你一直看着我！你很热吧？',
      '下次也一起来泳池里玩吧',
    ],
  },
];
