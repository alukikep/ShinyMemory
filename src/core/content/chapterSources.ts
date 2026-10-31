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
    script: '200300501',
    anchors: ['2003005010010', '2003005010300', '2003005010190'],
  },
  {
    chapterId: 'meguru-sunshine',
    card: { title: '夏に恋するピチカート！', index: 2, total: 5 },
    source:
      'data/story/八宮めぐる/【夏に恋するピチカート！】八宮めぐる/太陽のしずく.csv',
    script: '200300502',
    anchors: ['2003005020010', '2003005020100', '2003005020210'],
  },
  {
    chapterId: 'meguru-purity',
    card: { title: '夏に恋するピチカート！', index: 3, total: 5 },
    source:
      'data/story/八宮めぐる/【夏に恋するピチカート！】八宮めぐる/それはまだ純白な.csv',
    script: '200300503',
    anchors: ['2003005030010', '2003005030300', '2003005030110'],
  },
  {
    chapterId: 'meguru-coffee',
    card: { title: '夏に恋するピチカート！', index: 4, total: 5 },
    source:
      'data/story/八宮めぐる/【夏に恋するピチカート！】八宮めぐる/淹れたてコーヒー.csv',
    script: '200300504',
    anchors: ['2003005040010', '2003005040250', '2003005040090'],
  },
  {
    chapterId: 'meguru-stars',
    card: { title: '夏に恋するピチカート！', index: 5, total: 5 },
    source:
      'data/story/八宮めぐる/【夏に恋するピチカート！】八宮めぐる/なんでもない日の星空.csv',
    script: '200300511',
    anchors: ['2003005110010', '2003005110150', '2003005110290'],
  },
  {
    chapterId: 'mamimi-yukata',
    script: '200500501',
    source: '剧本 200500501',
    card: { title: '夕つ方まみみチック', index: 1, total: 2 },
    anchors: ['2005005010010', '2005005010070', '2005005010240'],
  },
  {
    chapterId: 'mamimi-purple',
    script: '200500511',
    source: '剧本 200500511',
    card: { title: '夕つ方まみみチック', index: 2, total: 2 },
    anchors: ['2005005110040', '2005005110120', '2005005110220'],
  },
  {
    chapterId: 'mano-shopping',
    script: '200100301',
    source: '剧本 200100301',
    card: { title: 'ナチュラルモード', index: 1, total: 3 },
    anchors: ['2001003010010', '2001003010100', '2001003010220'],
  },
  {
    chapterId: 'mano-hiking',
    script: '200100302',
    source: '剧本 200100302',
    card: { title: 'ナチュラルモード', index: 2, total: 3 },
    anchors: ['2001003020010', '2001003020100', '2001003020190'],
  },
  {
    chapterId: 'mano-thanks',
    script: '200100311',
    source: '剧本 200100311',
    card: { title: 'ナチュラルモード', index: 3, total: 3 },
    anchors: ['2001003110010', '2001003110100', '2001003110220'],
  },
  {
    chapterId: 'mano-hover',
    script: '200100401',
    source: '剧本 200100401',
    card: { title: 'ほわっとスマイル', index: 1, total: 5 },
    anchors: ['2001004010010', '2001004010150', '2001004010200'],
  },
  {
    chapterId: 'mano-dream',
    script: '200100411',
    source: '剧本 200100411',
    card: { title: 'ほわっとスマイル', index: 5, total: 5 },
    anchors: ['2001004110010', '2001004110190', '2001004110240'],
  },
  {
    chapterId: 'mano-afterglow',
    script: '200100404',
    source: '剧本 200100404',
    card: { title: 'ほわっとスマイル', index: 4, total: 5 },
    anchors: ['2001004040010', '2001004040060', '2001004040130'],
  },
  {
    chapterId: 'mano-growth',
    script: '200100403',
    source: '剧本 200100403',
    card: { title: 'ほわっとスマイル', index: 3, total: 5 },
    anchors: ['2001004030010', '2001004030080', '2001004030170'],
  },
  {
    chapterId: 'mano-plainclothes',
    script: '200100402',
    source: '剧本 200100402',
    card: { title: 'ほわっとスマイル', index: 2, total: 5 },
    anchors: ['2001004020010', '2001004020100', '2001004020110'],
  },
  {
    chapterId: 'hiori-support',
    script: '200200402',
    source: '剧本 200200402',
    card: { title: '柔らかな微笑み', index: 2, total: 5 },
    // 这个剧本是旧格式（没有行 id），锚点用日文原句
    anchors: [
      '苦手だって言ってたステップ',
      '休むことだってアイドルの仕事',
      '仕事が楽しいっていうのもあるけどな',
    ],
  },
  {
    chapterId: 'hiori-gift',
    script: '200200403',
    source: '剧本 200200403',
    card: { title: '柔らかな微笑み', index: 3, total: 5 },
    anchors: ['2002004030010', '2002004030150', '2002004030250'],
  },
  {
    chapterId: 'hiori-answer',
    script: '200200404',
    source: '剧本 200200404',
    card: { title: '柔らかな微笑み', index: 4, total: 5 },
    // 旧格式剧本：锚点用日文原句
    anchors: [
      '雑誌のインタビューの事前アンケート',
      '『W.I.N.G.』でのステージは灯織にとって',
      '俺も、灯織のステージが見られるのを楽しみにしてるよ',
    ],
  },
  {
    chapterId: 'hiori-ideal',
    script: '200200411',
    source: '剧本 200200411',
    card: { title: '柔らかな微笑み', index: 5, total: 5 },
    anchors: ['2002004110010', '2002004110190', '2002004110230'],
  },
  {
    chapterId: 'hiori-smile',
    script: '200200401',
    source: '剧本 200200401',
    card: { title: '柔らかな微笑み', index: 1, total: 5 },
    anchors: ['2002004010010', '2002004010130', '2002004010250'],
  },
];
