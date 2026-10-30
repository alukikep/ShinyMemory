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
    card: { title: '夏に恋するピチカート！', index: 1, total: 5 },
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
    card: { title: '夏に恋するピチカート！', index: 2, total: 5 },
    source:
      'data/story/八宮めぐる/【夏に恋するピチカート！】八宮めぐる/太陽のしずく.csv',
    anchors: [
      '明明在工作，说开心真的好吗',
      '谢谢你一直看着我！你很热吧？',
      '下次也一起来泳池里玩吧',
    ],
  },
  {
    chapterId: 'meguru-purity',
    card: { title: '夏に恋するピチカート！', index: 3, total: 5 },
    source:
      'data/story/八宮めぐる/【夏に恋するピチカート！】八宮めぐる/それはまだ純白な.csv',
    anchors: [
      '制作人谈过恋爱吗',
      '我最喜欢大家了',
      '我想让制作人记住现在的我',
    ],
  },
  {
    chapterId: 'meguru-coffee',
    card: { title: '夏に恋するピチカート！', index: 4, total: 5 },
    source:
      'data/story/八宮めぐる/【夏に恋するピチカート！】八宮めぐる/淹れたてコーヒー.csv',
    anchors: [
      '我最近都没看到你休息啊',
      '因为我才这么忙',
      '因为我是在离你最近的地方看你努力的',
    ],
  },
  {
    chapterId: 'meguru-stars',
    card: { title: '夏に恋するピチカート！', index: 5, total: 5 },
    source:
      'data/story/八宮めぐる/【夏に恋するピチカート！】八宮めぐる/なんでもない日の星空.csv',
    anchors: [
      '在这个公园第一次遇到制作人',
      '今后也拜托你了',
      '我还想记住更多这种什么都没有的日子',
    ],
  },
];
