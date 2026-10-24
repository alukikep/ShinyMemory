import { describe, expect, it } from 'vitest';
import { ACTIVITIES, ENDINGS, EVENTS } from './content';
import { CONTENT_INDEX } from './contentIndex';
import type { ActivityKind } from './types';

const ACTIVITY_KINDS: ActivityKind[] = ['training', 'work', 'rest', 'bond'];

describe('content integrity', () => {
  it('has unique ids', () => {
    const activityIds = ACTIVITIES.map((activity) => activity.id);
    const eventIds = EVENTS.map((event) => event.id);
    const endingIds = ENDINGS.map((ending) => ending.id);
    expect(new Set(activityIds).size).toBe(activityIds.length);
    expect(new Set(eventIds).size).toBe(eventIds.length);
    expect(new Set(endingIds).size).toBe(endingIds.length);
  });

  it('has 20 events and 3 endings', () => {
    expect(EVENTS).toHaveLength(20);
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
      }
    }
  });

  it('builds the content index', () => {
    expect(CONTENT_INDEX.activities.size).toBe(ACTIVITIES.length);
    expect(CONTENT_INDEX.events.size).toBe(EVENTS.length);
    expect(CONTENT_INDEX.endings.size).toBe(ENDINGS.length);
    expect(CONTENT_INDEX.eventsByActivityId.get('vocal')).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 'evt.vocal_strain' })]),
    );
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
