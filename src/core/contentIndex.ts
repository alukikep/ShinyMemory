import {
  ACTORS,
  ACTIVITIES,
  ENDINGS,
  EVENTS,
  IDOLS,
  ITEMS,
  JOBS,
  LOCATIONS,
  SHOPS,
  TRANSIT_ROUTES,
} from './content';
import type {
  ActivityDef,
  ActivityKind,
  ActorDef,
  ActorState,
  EndingDef,
  EventDef,
  IdolDef,
  IdolState,
  ItemDef,
  JobDef,
  LocationDef,
  ShopDef,
  TransitRouteDef,
} from './types';

export type ContentIndex = {
  activities: Map<string, ActivityDef>;
  actors: Map<string, ActorDef>;
  idols: Map<string, IdolDef>;
  events: Map<string, EventDef>;
  jobs: Map<string, JobDef>;
  items: Map<string, ItemDef>;
  shops: Map<string, ShopDef>;
  shopsByLocation: Map<string, ShopDef[]>;
  endings: Map<string, EndingDef>;
  locations: Map<string, LocationDef>;
  transitRoutes: Map<string, TransitRouteDef>;
  transitRoutesByLocation: Map<string, TransitRouteDef[]>;
  activitiesByLocation: Map<string, ActivityDef[]>;
  eventsByLocation: Map<string, EventDef[]>;
  eventsByActivityId: Map<string, EventDef[]>;
  eventsByKind: Map<ActivityKind, EventDef[]>;
  eventsByNpcId: Map<string, EventDef[]>;
  eventsByIdolId: Map<string, EventDef[]>;
  globalEvents: EventDef[];
  startingLocationId: string;
  startingIdolId: string;
};

function buildIndex(): ContentIndex {
  const activities = new Map(ACTIVITIES.map((activity) => [activity.id, activity]));
  const actors = new Map(ACTORS.map((actor) => [actor.id, actor]));
  const idols = new Map(IDOLS.map((idol) => [idol.id, idol]));
  const events = new Map(EVENTS.map((event) => [event.id, event]));
  const jobs = new Map(JOBS.map((job) => [job.id, job]));
  const items = new Map(ITEMS.map((item) => [item.id, item]));
  const shops = new Map(SHOPS.map((shop) => [shop.id, shop]));
  const shopsByLocation = new Map<string, ShopDef[]>();
  for (const shop of SHOPS) {
    const list = shopsByLocation.get(shop.locationId) ?? [];
    list.push(shop);
    shopsByLocation.set(shop.locationId, list);
  }
  const endings = new Map(ENDINGS.map((ending) => [ending.id, ending]));
  const locations = new Map(LOCATIONS.map((location) => [location.id, location]));
  const transitRoutes = new Map(
    TRANSIT_ROUTES.map((route) => [route.id, route]),
  );
  const transitRoutesByLocation = new Map<string, TransitRouteDef[]>();
  for (const location of LOCATIONS) {
    transitRoutesByLocation.set(
      location.id,
      TRANSIT_ROUTES.filter((route) => route.from === location.id),
    );
  }

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
  const eventsByIdolId = new Map<string, EventDef[]>();
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

    if (event.afterIdol) {
      for (const id of event.afterIdol.ids) {
        const list = eventsByIdolId.get(id) ?? [];
        list.push(event);
        eventsByIdolId.set(id, list);
      }
    }

    if (locationIds.length > 0) {
      for (const locationId of locationIds) {
        const list = eventsByLocation.get(locationId) ?? [];
        list.push(event);
        eventsByLocation.set(locationId, list);
      }
    } else if (
      !event.after &&
      !event.afterNpc &&
      !event.afterIdol &&
      (!event.entry || event.entry.kind === 'random')
    ) {
      globalEvents.push(event);
    }
  }

  return {
    activities,
    actors,
    idols,
    events,
    jobs,
    items,
    shops,
    shopsByLocation,
    endings,
    locations,
    transitRoutes,
    transitRoutesByLocation,
    activitiesByLocation,
    eventsByLocation,
    eventsByActivityId,
    eventsByKind,
    eventsByNpcId,
    eventsByIdolId,
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
        scheduleOverrides: [],
      } satisfies ActorState,
    ]),
  );
}

export function createInitialIdolStates(): Record<string, IdolState> {
  const startingIdol = IDOLS.find((idol) => idol.isStart) ?? IDOLS[0];
  return Object.fromEntries(
    IDOLS.map((idol) => [
      idol.id,
      {
        id: idol.id,
        stats: Object.fromEntries(
          Object.entries(idol.growth).map(([key, growth]) => [
            key,
            {
              rank: growth.initial,
              exp: 0,
              maxRank: growth.max,
            },
          ]),
        ) as IdolState['stats'],
        status: idol.id === startingIdol?.id ? 'recruited' : 'unknown',
      } satisfies IdolState,
    ]),
  );
}

export const CONTENT_INDEX: ContentIndex = buildIndex();
