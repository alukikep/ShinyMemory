import type { StoryChainDef } from '../../types';
import { hioriEncounter, manoEncounter, meguruEncounter, manoSlump, hioriGap, meguruBurden, mamimiEncounter } from '../storyChains';
import chiyokoCard from './chiyokoCard';
import chiyokoEncounter from './chiyokoEncounter';
import hioriSmileCard from './hioriSmileCard';
import koganeCard from './koganeCard';
import koganeEncounter from './koganeEncounter';
import juriCard from './juriCard';
import juriEncounter from './juriEncounter';
import kahoCard from './kahoCard';
import rinzeCard from './rinzeCard';
import rinzeEncounter from './rinzeEncounter';
import kahoEncounter from './kahoEncounter';
import kirikoCard from './kirikoCard';
import kirikoEncounter from './kirikoEncounter';
import mamimiNatural from './mamimiNatural';
import manoNatural from './manoNatural';
import manoSmile from './manoSmile';
import meguruPicarte from './meguruPicarte';
import sakuyaCard from './sakuyaCard';
import sakuyaEncounter from './sakuyaEncounter';
import yuikaCard from './yuikaCard';
import yuikaEncounter from './yuikaEncounter';

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
  kahoEncounter,
  kahoCard,
  rinzeEncounter,
  rinzeCard,
  chiyokoEncounter,
  chiyokoCard,
  juriEncounter,
  juriCard,
  kirikoEncounter,
  kirikoCard,
  koganeEncounter,
  koganeCard,
  sakuyaEncounter,
  sakuyaCard,
  yuikaEncounter,
  yuikaCard,
  manoSlump,
  hioriGap,
  meguruBurden,
];
