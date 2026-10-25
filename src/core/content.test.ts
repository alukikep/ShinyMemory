import { describe, expect, it } from 'vitest';
import { ACTIVITIES, ACTORS, ENDINGS, EVENTS, IDOLS, LOCATIONS } from './content';
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

  it('has valid actors with schedules and topics', () => {
    expect(ACTORS).toHaveLength(4);
    expect(ACTORS.map((actor) => actor.id)).toEqual([
      'hazuki',
      'tsutomu',
      'mano',
      'hiori',
    ]);
    expect(CONTENT_INDEX.actors.size).toBe(ACTORS.length);

    for (const actor of ACTORS) {
      for (const entry of actor.schedule) {
        expect(entry.fromMinute).toBeGreaterThanOrEqual(0);
        expect(entry.fromMinute).toBeLessThan(24 * 60);
        expect(entry.toMinute).toBeGreaterThanOrEqual(0);
        expect(entry.toMinute).toBeLessThan(24 * 60);
        expect(CONTENT_INDEX.locations.has(entry.locationId)).toBe(true);
      }

      const topicIds = actor.topics.map((topic) => topic.id);
      expect(new Set(topicIds).size).toBe(topicIds.length);
      for (const topic of actor.topics) {
        expect(topic.label.length).toBeGreaterThan(0);
        expect(topic.text.length).toBeGreaterThan(0);
        if (topic.cooldownMinutes !== undefined) {
          expect(topic.cooldownMinutes).toBeGreaterThan(0);
        }
        for (const effect of topic.effects) {
          if (effect.kind === 'actorAffinity') {
            expect(effect.actorId).toBe(actor.id);
          }
        }
      }
    }
  });

  it('has a starting idol and a second idol', () => {
    expect(IDOLS).toHaveLength(2);
    expect(IDOLS.map((idol) => idol.id)).toEqual(['mano', 'hiori']);
    expect(IDOLS[0]?.name).toBe('樱木真乃');
    expect(IDOLS[1]?.name).toBe('风野灯织');
    expect(CONTENT_INDEX.startingIdolId).toBe('mano');
    expect(CONTENT_INDEX.idols.size).toBe(IDOLS.length);
  });

  it('validates work reward checks and weights', () => {
    const ranks = new Set(['F', 'E', 'D', 'C', 'B', 'A', 'S']);
    const attributes = new Set(['vocal', 'dance', 'expression', 'trust']);
    for (const activity of ACTIVITIES) {
      if (!activity.workReward) continue;
      expect(activity.workReward.baseMoney).toBeGreaterThan(0);
      expect(activity.workReward.checks.length).toBeGreaterThan(0);
      const weight = activity.workReward.checks.reduce(
        (sum, check) => sum + check.weight,
        0,
      );
      expect(weight).toBeCloseTo(1, 5);
      for (const check of activity.workReward.checks) {
        expect(attributes.has(check.attribute)).toBe(true);
        expect(check.weight).toBeGreaterThan(0);
        for (const rank of Object.keys(check.multipliers ?? {})) {
          expect(ranks.has(rank)).toBe(true);
        }
      }
    }
  });

  it('validates work risk, outcome and chain event references', () => {
    for (const activity of ACTIVITIES) {
      if (!activity.workRisk) continue;
      const risk = activity.workRisk;
      if (risk.failureEventId) {
        const event = CONTENT_INDEX.events.get(risk.failureEventId);
        expect(event?.entry).toEqual({
          kind: 'workOutcome',
          activityId: activity.id,
          outcome: 'failure',
        });
        expect(
          CONTENT_INDEX.globalEvents.some(
            (entry) => entry.id === risk.failureEventId,
          ),
        ).toBe(false);
      }
      if (risk.successEventId) {
        const event = CONTENT_INDEX.events.get(risk.successEventId);
        expect(event?.entry).toEqual({
          kind: 'workOutcome',
          activityId: activity.id,
          outcome: 'success',
        });
        expect(
          CONTENT_INDEX.globalEvents.some(
            (entry) => entry.id === risk.successEventId,
          ),
        ).toBe(false);
      }
    }

    for (const event of EVENTS) {
      const nextIds = [
        event.nextEventId,
        ...event.choices.map((choice) => choice.nextEventId),
      ].filter(Boolean) as string[];
      for (const nextId of nextIds) {
        const next = CONTENT_INDEX.events.get(nextId);
        expect(next, `${event.id} -> ${nextId}`).toBeTruthy();
        expect(next?.entry?.kind).toBe('chain');
        expect(
          CONTENT_INDEX.globalEvents.some((entry) => entry.id === nextId),
        ).toBe(false);
      }
    }
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

  it('has 31 events and 3 endings', () => {
    expect(EVENTS).toHaveLength(31);
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
    expect(CONTENT_INDEX.eventsByNpcId.get('hazuki')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'evt.hazuki_nap' }),
      ]),
    );
    expect(CONTENT_INDEX.eventsByIdolId.get('mano')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'evt.mano_soft_voice' }),
      ]),
    );
    expect(CONTENT_INDEX.eventsByIdolId.get('hiori')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'evt.hiori_extra_step' }),
      ]),
    );
    expect(
      CONTENT_INDEX.globalEvents.some((event) => event.id === 'evt.hazuki_nap'),
    ).toBe(false);
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
