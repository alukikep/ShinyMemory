import type { StoryChainDef } from '../../types';
import meguruCoffee from './meguruCoffee';
import meguruPurity from './meguruPurity';
import meguruStars from './meguruStars';
import meguruSunshine from './meguruSunshine';
import meguruSwimsuit from './meguruSwimsuit';

/**
 * 还没接入 STORY_CHAINS 的章节。
 *
 * 为什么单独放：章节的对话要走审查台，**过审之后**才能把链接进游戏，
 * 否则 BASE_PACK 会引用不存在的对话（每个草稿预检都会报 dialogue-ref）。
 * 审查台靠这份清单知道"哪些草稿属于同一章、按什么顺序读"。
 */
export const PENDING_CHAPTERS: StoryChainDef[] = [
  meguruSwimsuit,
  meguruSunshine,
  meguruPurity,
  meguruCoffee,
  meguruStars,
];
