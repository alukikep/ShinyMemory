import type { StoryChainDef } from '../../types';
import { hioriEncounter, manoEncounter, meguruEncounter, manoSlump, hioriGap, meguruBurden, mamimiEncounter } from '../storyChains';
import chiyokoCard from './chiyokoCard';
import chiyokoEncounter from './chiyokoEncounter';
import hanaCard from './hanaCard';
import harukiCard from './harukiCard';
import harukiEncounter from './harukiEncounter';
import hanaEncounter from './hanaEncounter';
import hioriSmileCard from './hioriSmileCard';
import hinanaCard from './hinanaCard';
import hinanaEncounter from './hinanaEncounter';
import koganeCard from './koganeCard';
import koganeEncounter from './koganeEncounter';
import juriCard from './juriCard';
import juriEncounter from './juriEncounter';
import madokaCard from './madokaCard';
import madokaEncounter from './madokaEncounter';
import amanaCard from './amanaCard';
import asahiCard from './asahiCard';
import fuyukoCard from './fuyukoCard';
import meiCard from './meiCard';
import meiEncounter from './meiEncounter';
import fuyukoEncounter from './fuyukoEncounter';
import asahiEncounter from './asahiEncounter';
import chiyukiCard from './chiyukiCard';
import chiyukiEncounter from './chiyukiEncounter';
import amanaEncounter from './amanaEncounter';
import tenkaCard from './tenkaCard';
import tenkaEncounter from './tenkaEncounter';
import kahoCard from './kahoCard';
import natsuhaCard from './natsuhaCard';
import natsuhaEncounter from './natsuhaEncounter';
import nichikaCard from './nichikaCard';
import nichikaEncounter from './nichikaEncounter';
import nichikaTribute from './nichikaTribute';
import rinzeCard from './rinzeCard';
import rinzeEncounter from './rinzeEncounter';
import kahoEncounter from './kahoEncounter';
import kirikoCard from './kirikoCard';
import kirikoEncounter from './kirikoEncounter';
import koitoCard from './koitoCard';
import koitoEncounter from './koitoEncounter';
import lucaCard from './lucaCard';
import lucaEncounter from './lucaEncounter';
import mamimiNatural from './mamimiNatural';
import manoNatural from './manoNatural';
import manoSmile from './manoSmile';
import meguruPicarte from './meguruPicarte';
import mikotoCard from './mikotoCard';
import mikotoEncounter from './mikotoEncounter';
import sakuyaCard from './sakuyaCard';
import sakuyaEncounter from './sakuyaEncounter';
import toruCard from './toruCard';
import toruEncounter from './toruEncounter';
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
  natsuhaEncounter,
  natsuhaCard,
  amanaEncounter,
  amanaCard,
  tenkaEncounter,
  tenkaCard,
  chiyukiEncounter,
  chiyukiCard,
  asahiEncounter,
  asahiCard,
  fuyukoEncounter,
  fuyukoCard,
  meiEncounter,
  meiCard,
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
  toruEncounter,
  toruCard,
  madokaEncounter,
  madokaCard,
  koitoEncounter,
  koitoCard,
  hinanaEncounter,
  hinanaCard,
  nichikaEncounter,
  nichikaCard,
  nichikaTribute,
  mikotoEncounter,
  mikotoCard,
  lucaEncounter,
  lucaCard,
  hanaEncounter,
  hanaCard,
  harukiEncounter,
  harukiCard,
  manoSlump,
  hioriGap,
  meguruBurden,
];
