import type { ActivityDef, EventDef, EndingDef } from '../types';
import { LOCATIONS } from './locations';
import vocal from './activities/vocal';
import dance from './activities/dance';
import expression from './activities/expression';
import work from './activities/work';
import rest from './activities/rest';
import free from './activities/free';
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
import trueEnding from './endings/true';
import normalEnding from './endings/normal';
import badEnding from './endings/bad';

export const ACTIVITIES: ActivityDef[] = [vocal, dance, expression, work, rest, free];

export const EVENTS: EventDef[] = [nightPractice, bento, rain, herPast, insomnia, cold, tvOffer, onlineComment, extraLesson, firstName, herResolve, beforeLive, collapse, vocalStrain, fanLetter, interview, escape, rival, birthday, producerDoubt];

export const ENDINGS: EndingDef[] = [trueEnding, normalEnding, badEnding];

export { LOCATIONS };
