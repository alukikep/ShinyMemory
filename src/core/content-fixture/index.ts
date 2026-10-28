import type { ActivityDef, EventDef } from '../types';
import { LOCATIONS } from './locations';
import { WALK_EDGES } from './map';
import { TRANSIT_ROUTES } from './transit';
import { ACTORS } from './actors';
import { IDOLS } from './idols';
import { JOBS as BASE_JOBS } from './jobs';
import { ITEMS, SHOPS } from './items';
import { HIORI_DIALOGUES } from './dialogues/hiori';
import { MEGURU_DIALOGUES } from './dialogues/meguru';
import { STORY_CHAINS } from './storyChains';
import { STARTING_STATE } from './starting';
import { APPROVED_EVENTS, APPROVED_JOBS } from './approved';
import vocal from './activities/vocal';
import dance from './activities/dance';
import expression from './activities/expression';
import work from './activities/work';
import tvWork from './activities/tvWork';
import musicWork from './activities/musicWork';
import rest from './activities/rest';
import free from './activities/free';
import lookAround from './activities/lookAround';
import sleep from './activities/sleep';
import advancedVocal from './activities/advancedVocal';
import advancedDance from './activities/advancedDance';
import cafeLunch from './activities/cafeLunch';
import groupGreeting from './activities/groupGreeting';
import demoRecording from './activities/demoRecording';
import photoShoot from './activities/photoShoot';
import coverShoot from './activities/coverShoot';
import nightPractice from './events/locations/practice_room/nightPractice';
import extraLesson from './events/training/extraLesson';
import vocalStrain from './events/activities/training/vocalStrain';
import tvOffer from './events/work/tvOffer';
import onlineComment from './events/work/onlineComment';
import fanLetter from './events/work/fanLetter';
import interview from './events/activities/work/interview';
import insomnia from './events/rest/insomnia';
import cold from './events/rest/cold';
import collapse from './events/rest/collapse';
import escape from './events/rest/escape';
import bento from './events/locations/office/bento';
import rain from './events/story/rain';
import herPast from './events/story/herPast';
import firstName from './events/story/firstName';
import herResolve from './events/story/herResolve';
import beforeLive from './events/locations/studio/beforeLive';
import rival from './events/story/rival';
import birthday from './events/story/birthday';
import producerDoubt from './events/locations/office/producerDoubt';
import hazukiNap from './events/locations/office/hazukiNap';
import manoSoftVoice from './events/idols/manoSoftVoice';
import hioriExtraStep from './events/idols/hioriExtraStep';
import workFailureTv from './events/work/workFailureTv';
import tvSuccess from './events/work/tvSuccess';
import tvAfterglow from './events/work/tvAfterglow';
import tvFailureAftermath from './events/work/tvFailureAftermath';
import deskScript from './events/locations/office/deskScript';
import mirrorNote from './events/locations/practice_room/mirrorNote';
import headphones from './events/locations/studio/headphones';
import homeNote from './events/locations/home/homeNote';
import parkPigeons from './events/locations/park/parkPigeons';
import shoppingWindow from './events/locations/shoppingStreet/shoppingWindow';

export const ACTIVITIES: ActivityDef[] = [vocal, dance, expression, work, tvWork, musicWork, rest, free, lookAround, sleep, advancedVocal, advancedDance, cafeLunch, groupGreeting, demoRecording, photoShoot, coverShoot];

export const EVENTS: EventDef[] = [nightPractice, bento, rain, herPast, insomnia, cold, tvOffer, onlineComment, extraLesson, firstName, herResolve, beforeLive, collapse, vocalStrain, fanLetter, interview, escape, rival, birthday, producerDoubt, deskScript, mirrorNote, headphones, homeNote, parkPigeons, shoppingWindow, hazukiNap, manoSoftVoice, hioriExtraStep, workFailureTv, tvSuccess, tvAfterglow, tvFailureAftermath, ...APPROVED_EVENTS];

export const JOBS = [...BASE_JOBS, ...APPROVED_JOBS];

export const DIALOGUES = [...HIORI_DIALOGUES, ...MEGURU_DIALOGUES];

export const STORY_CHAIN_DEFS = STORY_CHAINS;

export { STARTING_STATE };

export { ACTORS, IDOLS, ITEMS, LOCATIONS, SHOPS, TRANSIT_ROUTES, WALK_EDGES };
