import { ACTIVITIES, ENDINGS, EVENTS, LOCATIONS } from './content';
import type {
  ActivityDef,
  ActivityKind,
  EndingDef,
  EventDef,
  LocationDef,
} from './types';

export type ContentIndex = {
  activities: Map<string, ActivityDef>;
  events: Map<string, EventDef>;
  endings: Map<string, EndingDef>;
  locations: Map<string, LocationDef>;
  activitiesByLocation: Map<string, ActivityDef[]>;
  eventsByLocation: Map<string, EventDef[]>;
  eventsByActivityId: Map<string, EventDef[]>;
  eventsByKind: Map<ActivityKind, EventDef[]>;
  globalEvents: EventDef[];
  startingLocationId: string;
};

function buildIndex(): ContentIndex {
  const activities = new Map(ACTIVITIES.map((activity) => [activity.id, activity]));
  const events = new Map(EVENTS.map((event) => [event.id, event]));
  const endings = new Map(ENDINGS.map((ending) => [ending.id, ending]));
  const locations = new Map(LOCATIONS.map((location) => [location.id, location]));

  const activitiesByLocation = new Map<string, ActivityDef[]>();
  for (const location of LOCATIONS) {
    activitiesByLocation.set(
      location.id,
      ACTIVITIES.filter(
        (activity) =>
          !activity.locations || activity.locations.includes(location.id),
      ),
    );
  }

  const startingLocationId =
    LOCATIONS.find((location) => location.isStart)?.id ?? LOCATIONS[0]?.id ?? '';

  const eventsByLocation = new Map<string, EventDef[]>();
  const eventsByActivityId = new Map<string, EventDef[]>();
  const eventsByKind = new Map<ActivityKind, EventDef[]>();
  const globalEvents: EventDef[] = [];

  for (const event of EVENTS) {
    const locationIds: string[] = [];
    for (const condition of event.when) {
      if (condition.kind === 'atLocation') {
        locationIds.push(condition.locationId);
      }
    }

    if (event.after) {
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

    if (locationIds.length > 0) {
      for (const locationId of locationIds) {
        const list = eventsByLocation.get(locationId) ?? [];
        list.push(event);
        eventsByLocation.set(locationId, list);
      }
    } else if (!event.after) {
      globalEvents.push(event);
    }
  }

  return {
    activities,
    events,
    endings,
    locations,
    activitiesByLocation,
    eventsByLocation,
    eventsByActivityId,
    eventsByKind,
    globalEvents,
    startingLocationId,
  };
}

export const CONTENT_INDEX: ContentIndex = buildIndex();
