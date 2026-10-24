import { describe, expect, it } from 'vitest';
import { ACTIVITIES, ENDINGS, EVENTS, LOCATIONS } from './content';
import { CONTENT_INDEX } from './contentIndex';
import type { ActivityKind, Condition, EventDef } from './types';

const ACTIVITY_KINDS: ActivityKind[] = [
  'training',
  'work',
  'rest',
  'bond',
  'explore',
  'sleep',
];

function locationsInConditions(conditions: Condition[]): string[] {
  const found: string[] = [];
  for (const condition of conditions) {
    if (condition.kind === 'atLocation') {
      found.push(condition.locationId);
    } else if (condition.kind === 'all' || condition.kind === 'any') {
      found.push(...locationsInConditions(condition.of));
    } else if (condition.kind === 'not') {
      found.push(...locationsInConditions([condition.of]));
    }
  }
  return found;
}

function topLevelLocations(event: EventDef): string[] {
  const found: string[] = [];
  for (const condition of event.when) {
    if (condition.kind === 'atLocation') found.push(condition.locationId);
  }
  return found;
}

function afterLocations(event: EventDef): Set<string> | null {
  if (!event.after) return null;

  const locations = new Set<string>();
  let unrestricted = false;

  const addActivity = (activity: (typeof ACTIVITIES)[number] | undefined) => {
    if (!activity) return;
    if (!activity.locations) {
      unrestricted = true;
      return;
    }
    for (const locationId of activity.locations) locations.add(locationId);
  };

  if ('ids' in event.after) {
    for (const id of event.after.ids) {
      addActivity(ACTIVITIES.find((activity) => activity.id === id));
    }
  } else {
    for (const kind of event.after.kinds) {
      for (const activity of ACTIVITIES.filter((item) => item.kind === kind)) {
        addActivity(activity);
      }
    }
  }

  return unrestricted || locations.size === 0 ? null : locations;
}

describe('content integrity', () => {
  it('has unique ids', () => {
    const activityIds = ACTIVITIES.map((activity) => activity.id);
    const eventIds = EVENTS.map((event) => event.id);
    const endingIds = ENDINGS.map((ending) => ending.id);
    expect(new Set(activityIds).size).toBe(activityIds.length);
    expect(new Set(eventIds).size).toBe(eventIds.length);
    expect(new Set(endingIds).size).toBe(endingIds.length);
  });

  it('has four unique locations and a starting location', () => {
    const ids = LOCATIONS.map((location) => location.id);
    expect(ids).toHaveLength(4);
    expect(new Set(ids).size).toBe(ids.length);
    expect(CONTENT_INDEX.startingLocationId).toBe('office');
    expect(CONTENT_INDEX.locations.has('office')).toBe(true);
    expect(CONTENT_INDEX.locations.has('practice_room')).toBe(true);
    expect(CONTENT_INDEX.locations.has('studio')).toBe(true);
    expect(CONTENT_INDEX.locations.has('home')).toBe(true);
  });

  it('keeps activity time windows in range', () => {
    for (const activity of ACTIVITIES) {
      for (const window of activity.timeWindows ?? []) {
        expect(window.fromMinute).toBeGreaterThanOrEqual(0);
        expect(window.fromMinute).toBeLessThan(24 * 60);
        expect(window.toMinute).toBeGreaterThanOrEqual(0);
        expect(window.toMinute).toBeLessThan(24 * 60);
      }
    }
  });

  it('keeps location open hours in range', () => {
    for (const location of LOCATIONS) {
      for (const window of location.openHours ?? []) {
        expect(window.fromMinute).toBeGreaterThanOrEqual(0);
        expect(window.fromMinute).toBeLessThan(24 * 60);
        expect(window.toMinute).toBeGreaterThanOrEqual(0);
        expect(window.toMinute).toBeLessThan(24 * 60);
      }
    }
  });

  it('references existing locations from activities', () => {
    const locationIds = new Set(LOCATIONS.map((location) => location.id));
    for (const activity of ACTIVITIES) {
      for (const locationId of activity.locations ?? []) {
        expect(locationIds.has(locationId), `${activity.id} -> ${locationId}`).toBe(
          true,
        );
      }
    }
  });

  it('gives every location at least one activity', () => {
    for (const location of LOCATIONS) {
      const activities = CONTENT_INDEX.activitiesByLocation.get(location.id);
      expect(activities?.length ?? 0).toBeGreaterThan(0);
    }
  });

  it('makes look_around available in every location', () => {
    const lookAround = ACTIVITIES.find((activity) => activity.id === 'look_around');
    expect(lookAround?.kind).toBe('explore');
    for (const location of LOCATIONS) {
      expect(
        CONTENT_INDEX.activitiesByLocation
          .get(location.id)
          ?.some((activity) => activity.id === 'look_around'),
      ).toBe(true);
    }
  });

  it('references existing locations from event conditions', () => {
    const locationIds = new Set(LOCATIONS.map((location) => location.id));
    for (const event of EVENTS) {
      for (const locationId of locationsInConditions(event.when)) {
        expect(locationIds.has(locationId), `${event.id} -> ${locationId}`).toBe(
          true,
        );
      }
    }
  });

  it('has at least one location-owned event per location', () => {
    for (const location of LOCATIONS) {
      const events = CONTENT_INDEX.eventsByLocation.get(location.id);
      expect(events?.length ?? 0).toBeGreaterThan(0);
    }
  });

  it('gives every location a look_around event', () => {
    for (const location of LOCATIONS) {
      const found = EVENTS.some(
        (event) =>
          topLevelLocations(event).includes(location.id) &&
          event.after !== undefined &&
          'ids' in event.after &&
          event.after.ids.includes('look_around'),
      );
      expect(found).toBe(true);
    }
  });

  it('does not conflict or duplicate after with atLocation', () => {
    const problems: string[] = [];

    for (const event of EVENTS) {
      const eventLocations = topLevelLocations(event);
      const possibleLocations = afterLocations(event);
      if (eventLocations.length === 0 || !possibleLocations) continue;

      const overlaps = [...possibleLocations].some((locationId) =>
        eventLocations.includes(locationId),
      );
      if (!overlaps) {
        problems.push(
          `${event.id}: after never happens at ${eventLocations.join(', ')}`,
        );
      }

      const redundant = [...possibleLocations].every((locationId) =>
        eventLocations.includes(locationId),
      );
      if (redundant) {
        problems.push(`${event.id}: atLocation is already implied by after`);
      }
    }

    expect(problems).toEqual([]);
  });

  it('uses at most one top-level atLocation per event', () => {
    for (const event of EVENTS) {
      expect(topLevelLocations(event).length).toBeLessThanOrEqual(1);
    }
  });

  it('has 24 events and 3 endings', () => {
    expect(EVENTS).toHaveLength(24);
    expect(ENDINGS).toHaveLength(3);
  });

  it('references existing activities in after.ids', () => {
    const activityIds = new Set(ACTIVITIES.map((activity) => activity.id));
    for (const event of EVENTS) {
      if (event.after && 'ids' in event.after) {
        for (const id of event.after.ids) {
          expect(activityIds.has(id), `${event.id} -> ${id}`).toBe(true);
        }
      }
    }
  });

  it('references valid activity kinds in after.kinds', () => {
    for (const event of EVENTS) {
      if (event.after && 'kinds' in event.after) {
        for (const kind of event.after.kinds) {
          expect(ACTIVITY_KINDS).toContain(kind);
        }
      }
    }
  });

  it('keeps probability and weighting values in range', () => {
    for (const event of EVENTS) {
      if (event.chance !== undefined) {
        expect(event.chance).toBeGreaterThanOrEqual(0);
        expect(event.chance).toBeLessThanOrEqual(1);
      }
      if (event.weight !== undefined) {
        expect(event.weight).toBeGreaterThan(0);
      }
      if (event.priority !== undefined) {
        expect(event.priority).toBeGreaterThanOrEqual(0);
      }
      if (event.cooldownActions !== undefined) {
        expect(Number.isInteger(event.cooldownActions)).toBe(true);
        expect(event.cooldownActions).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('gives every event at least one complete choice', () => {
    for (const event of EVENTS) {
      expect(event.choices.length).toBeGreaterThan(0);
      for (const choice of event.choices) {
        expect(choice.label.length).toBeGreaterThan(0);
        expect(choice.result.length).toBeGreaterThan(0);
        if (choice.durationMinutes !== undefined) {
          expect(choice.durationMinutes).toBeGreaterThan(0);
        }
      }
    }
  });

  it('gates the late-night TV offer by place and time', () => {
    const offer = EVENTS.find((event) => event.id === 'evt.tv_offer');
    expect(offer?.when).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'atLocation',
          locationId: 'studio',
        }),
        expect.objectContaining({ kind: 'timeWindow' }),
      ]),
    );
    expect(offer?.choices[0]?.durationMinutes).toBe(240);
  });

  it('builds the content index', () => {
    expect(CONTENT_INDEX.activities.size).toBe(ACTIVITIES.length);
    expect(CONTENT_INDEX.events.size).toBe(EVENTS.length);
    expect(CONTENT_INDEX.endings.size).toBe(ENDINGS.length);
    expect(CONTENT_INDEX.locations.size).toBe(LOCATIONS.length);
    expect(CONTENT_INDEX.eventsByActivityId.get('vocal')).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 'evt.vocal_strain' })]),
    );
    expect(CONTENT_INDEX.activitiesByLocation.get('practice_room')).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 'vocal' })]),
    );
    expect(CONTENT_INDEX.activitiesByLocation.get('office')).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 'rest' })]),
    );
    expect(CONTENT_INDEX.eventsByLocation.get('office')).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 'evt.bento' })]),
    );
    expect(CONTENT_INDEX.eventsByLocation.get('practice_room')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'evt.night_practice' }),
      ]),
    );
    expect(CONTENT_INDEX.eventsByLocation.get('studio')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'evt.before_live' }),
      ]),
    );
    expect(CONTENT_INDEX.eventsByLocation.get('home')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'evt.home_note' }),
      ]),
    );
    expect(
      CONTENT_INDEX.globalEvents.some((event) => event.id === 'evt.bento'),
    ).toBe(false);
  });

  it('demonstrates the v0.2 trigger features', () => {
    const strain = EVENTS.find((event) => event.id === 'evt.vocal_strain');
    expect(strain?.after).toEqual({ ids: ['vocal'] });
    expect(strain?.chance).toBe(0.5);
    expect(strain?.cooldownActions).toBe(4);

    const collapse = EVENTS.find((event) => event.id === 'evt.collapse');
    expect(collapse?.priority).toBe(100);
  });
});
