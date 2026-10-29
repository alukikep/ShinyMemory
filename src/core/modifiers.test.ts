import { describe, expect, it } from 'vitest';
import { combineModifiers } from './modifiers';
import type { Modifier } from './types';

function source(label: string, ...modifiers: Modifier[]) {
  return { label, modifiers };
}

describe('combineModifiers', () => {
  it('returns 1 when nothing applies', () => {
    expect(combineModifiers([], 'staminaCost').total).toBe(1);
    expect(combineModifiers([source('空', { key: 'duration', value: 0.5 })], 'staminaCost').total).toBe(1);
  });

  it('multiplies mul entries', () => {
    const result = combineModifiers(
      [
        source('怀表', { key: 'staminaCost', value: 0.9 }),
        source('护符', { key: 'staminaCost', value: 0.9 }),
      ],
      'staminaCost',
    );

    expect(result.total).toBeCloseTo(0.81);
    expect(result.parts).toEqual([
      { label: '怀表', value: 0.9 },
      { label: '护符', value: 0.9 },
    ]);
  });

  it('sums add entries', () => {
    const result = combineModifiers(
      [
        source('A', { key: 'staminaCost', op: 'add', value: -0.1 }),
        source('B', { key: 'staminaCost', op: 'add', value: -0.1 }),
      ],
      'staminaCost',
    );

    expect(result.total).toBeCloseTo(0.8);
  });

  it('combines add and mul as product × (1 + sum)', () => {
    const result = combineModifiers(
      [
        source('A', { key: 'trainingExp', value: 1.2 }),
        source('B', { key: 'trainingExp', op: 'add', value: 0.2 }),
      ],
      'trainingExp',
    );

    expect(result.total).toBeCloseTo(1.44);
  });

  it('ignores keys the caller did not ask for', () => {
    const result = combineModifiers(
      [
        source('A', { key: 'trainingExp', value: 2 }),
        source('B', { key: 'duration', value: 0.5 }),
      ],
      'duration',
    );

    expect(result.total).toBeCloseTo(0.5);
  });

  it('lets the caller filter entries', () => {
    const result = combineModifiers(
      [
        source('A', { key: 'duration', value: 0.5 }),
        source('B', { key: 'duration', value: 0.5 }),
      ],
      'duration',
      (modifier) => modifier.value === 0.5,
    );

    expect(result.total).toBeCloseTo(0.25);
  });
});
