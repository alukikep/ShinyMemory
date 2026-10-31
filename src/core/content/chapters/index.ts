import type { StoryChainDef } from '../../types';
import meguruCoffee from './meguruCoffee';
import meguruPurity from './meguruPurity';
import meguruStars from './meguruStars';
import meguruSunshine from './meguruSunshine';
import meguruSwimsuit from './meguruSwimsuit';
import { hioriEncounter, manoEncounter, meguruEncounter, manoSlump } from '../storyChains';
import { hioriGap } from '../storyChains';
import { meguruBurden } from '../storyChains';

/**
 * 还没接入 STORY_CHAINS 的章节。
 *
 * 为什么单独放：章节的对话要走审查台，**过审之后**才能把链接进游戏，
 * 否则 BASE_PACK 会引用不存在的对话（每个草稿预检都会报 dialogue-ref）。
 * 审查台靠这份清单知道"哪些草稿属于同一章、按什么顺序读"。
 */
/**
 * 对话在审查台里的剧情链。
 *
 * 卡面章节 + 三条迁出来的旧长线：它们的对话都不在 BASE_PACK，
 * 只有 approved 内容里才有。所以：
 *   - 结构在这里（可直接提交）
 *   - 生产包会**过滤掉对话还没批的链**（见 productionPack.ts），
 *     这样"批到一半"不会让游戏引用不存在的对话。
 */
export const PENDING_CHAPTERS: StoryChainDef[] = [
  manoEncounter,
  hioriEncounter,
  meguruEncounter,
  manoSlump,
  hioriGap,
  meguruBurden,
  meguruSwimsuit,
  meguruSunshine,
  meguruPurity,
  meguruCoffee,
  meguruStars,
];
