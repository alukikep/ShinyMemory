import { ACTORS, ACTIVITIES, ENDINGS, EVENTS, IDOLS, LOCATIONS } from './content';
import type {
  ActivityDef,
  ActivityKind,
  ActorDef,
  ActorState,
  EndingDef,
  EventDef,
  IdolDef,
  IdolState,
  LocationDef,
} from './types';

export type ContentIndex = {
  activities: Map<string, ActivityDef>;
  actors: Map<string, ActorDef>;
  idols: Map<string, IdolDef>;
  events: Map<string, EventDef>;
  endings: Map<string, EndingDef>;
  locations: Map<string, LocationDef>;
  activitiesByLocation: Map<string, ActivityDef[]>;
  eventsByLocation: Map<string, EventDef[]>;
  eventsByActivityId: Map<string, EventDef[]>;
  eventsByKind: Map<ActivityKind, EventDef[]>;
  eventsByNpcId: Map<string, EventDef[]>;
  globalEvents: EventDef[];
  startingLocationId: string;
  startingIdolId: string;
};

function buildIndex(): ContentIndex {
  const activities = new Map(ACTIVITIES.map((activity) => [activity.id, activity]));
  const actors = new Map(ACTORS.map((actor) => [actor.id, actor]));
  const idols = new Map(IDOLS.map((idol) => [idol.id, idol]));
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
  const startingIdolId =
    IDOLS.find((idol) => idol.isStart)?.id ?? IDOLS[0]?.id ?? '';

  const eventsByLocation = new Map<string, EventDef[]>();
  const eventsByActivityId = new Map<string, EventDef[]>();
  const eventsByKind = new Map<ActivityKind, EventDef[]>();
  const eventsByNpcId = new Map<string, EventDef[]>();
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

    if (event.afterNpc) {
      for (const id of event.afterNpc.ids) {
        const list = eventsByNpcId.get(id) ?? [];
        list.push(event);
        eventsByNpcId.set(id, list);
      }
    }

    if (locationIds.length > 0) {
      for (const locationId of locationIds) {
        const list = eventsByLocation.get(locationId) ?? [];
        list.push(event);
        eventsByLocation.set(locationId, list);
      }
    } else if (!event.after && !event.afterNpc) {
      globalEvents.push(event);
    }
  }

  return {
    activities,
    actors,
    idols,
    events,
    endings,
    locations,
    activitiesByLocation,
    eventsByLocation,
    eventsByActivityId,
    eventsByKind,
    eventsByNpcId,
    globalEvents,
    startingLocationId,
    startingIdolId,
  };
}

export function createInitialActorStates(): Record<string, ActorState> {
  return Object.fromEntries(
    ACTORS.map((actor) => [
      actor.id,
      {
        id: actor.id,
        affinity: 0,
        flags: {},
        topicCooldowns: {},
      } satisfies ActorState,
    ]),
  );
}

export function createInitialIdolStates(): Record<string, IdolState> {
  return Object.fromEntries(
    IDOLS.map((idol) => [
      idol.id,
      {
        id: idol.id,
        stats: {
          vocal: 20,
          dance: 20,
          expression: 20,
          trust: 5,
        },
      } satisfies IdolState,
    ]),
  );
}

export const CONTENT_INDEX: ContentIndex = buildIndex();
