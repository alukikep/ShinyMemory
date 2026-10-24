import { ACTIVITIES, ENDINGS, EVENTS } from './content';
import type {
  ActivityDef,
  ActivityKind,
  EndingDef,
  EventDef,
} from './types';

export type ContentIndex = {
  activities: Map<string, ActivityDef>;
  events: Map<string, EventDef>;
  endings: Map<string, EndingDef>;
  eventsByActivityId: Map<string, EventDef[]>;
  eventsByKind: Map<ActivityKind, EventDef[]>;
  globalEvents: EventDef[];
};

function buildIndex(): ContentIndex {
  const activities = new Map(ACTIVITIES.map((activity) => [activity.id, activity]));
  const events = new Map(EVENTS.map((event) => [event.id, event]));
  const endings = new Map(ENDINGS.map((ending) => [ending.id, ending]));

  const eventsByActivityId = new Map<string, EventDef[]>();
  const eventsByKind = new Map<ActivityKind, EventDef[]>();
  const globalEvents: EventDef[] = [];

  for (const event of EVENTS) {
    if (!event.after) {
      globalEvents.push(event);
      continue;
    }

    if ('ids' in event.after) {
      for (const id of event.after.ids) {
        const list = eventsByActivityId.get(id) ?? [];
        list.push(event);
        eventsByActivityId.set(id, list);
      }
    } else {
      for (const kind of event.after.kinds) {
        const list = eventsByKind.get(kind) ?? [];
        list.push(event);
        eventsByKind.set(kind, list);
      }
    }
  }

  return {
    activities,
    events,
    endings,
    eventsByActivityId,
    eventsByKind,
    globalEvents,
  };
}

export const CONTENT_INDEX: ContentIndex = buildIndex();
