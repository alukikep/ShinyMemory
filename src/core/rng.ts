/**
 * Deterministic RNG.
 * Only `seed` and `counter` are stored in GameState, so a save can be reproduced
 * by rebuilding the cursor from those two numbers.
 */
export class Rng {
  private state: number;
  counter: number;

  constructor(seed: number, counter = 0) {
    this.counter = counter;
    this.state = (seed + Math.imul(counter, 0x9e3779b9)) >>> 0;
  }

  next(): number {
    this.counter += 1;
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  int(maxExclusive: number): number {
    return Math.floor(this.next() * maxExclusive);
  }

  pick<T>(items: readonly T[]): T {
    return items[this.int(items.length)]!;
  }

  chance(p: number): boolean {
    return this.next() < p;
  }
}
