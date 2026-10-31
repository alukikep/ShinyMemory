import type { StoryChainDef } from '../../types';
import { hioriEncounter, manoEncounter, meguruEncounter, manoSlump, hioriGap, meguruBurden, mamimiEncounter } from '../storyChains';
import hioriSmileCard from './hioriSmileCard';
import mamimiNatural from './mamimiNatural';
import manoNatural from './manoNatural';
import manoSmile from './manoSmile';
import meguruPicarte from './meguruPicarte';

/**
 * 对话在审查台里的剧情链。
 *
 * 卡面：**一张卡 = 一条链**（5 步 = 5 段 commu）。
 * 招募与长线：同样走审查台。
 *
 * 这些链不在 BASE_PACK 里——它们的对话是 approved 内容，
 * 生产包会按"对话是否已批"过滤后挂上（见 productionPack.ts）。
 */
export const PENDING_CHAPTERS: StoryChainDef[] = [
  manoSmile,
  mamimiNatural,
  manoNatural,
  hioriSmileCard,
  meguruPicarte,
  manoEncounter,
  hioriEncounter,
  meguruEncounter,
  mamimiEncounter,
  manoSlump,
  hioriGap,
  meguruBurden,
];
