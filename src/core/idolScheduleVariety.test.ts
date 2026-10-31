import { describe, expect, it } from 'vitest';
import { PRODUCTION_PACK } from './productionPack';
import { getSchedulesForDay } from './schedule';
import type { ActorDef } from './types';

/**
 * 日程表不该一周五天一个样。
 *
 * 起因：安提卡三人的作息原本是"平日全同、周末全同"，日程表打开像排班表，
 * 玩家每天可选的地点和时间窗口也完全一样。
 *
 * 规则（2026-11 起对安提卡成立，之后新角色照做；旧角色是技术债）：
 * 1. 两周里出现的地点至少 5 种；
 * 2. 练习室每周至少 3 天（训练课与课后事件挂在上面，不能被"灵活性"挤掉）；
 * 3. 周一到周五的日程至少 4 种不同；
 * 4. 第 1 周和第 2 周不完全一样（`weekParity` 的双周轮换真的生效）；
 * 5. 同一天里没有时间与地点都重复的时段。
 */

const LANTICA_UNIT = "L'Antica";

function signature(actor: ActorDef, day: number): string {
  return getSchedulesForDay(actor, day)
    .map(
      (slot) =>
        `${slot.fromMinute}-${slot.toMinute}@${slot.locationId ?? 'free'}`,
    )
    .sort()
    .join('|');
}

function daysOfTwoWeeks(): number[] {
  return Array.from({ length: 14 }, (_, index) => index + 1);
}

describe('idol schedule variety', () => {
  const actors = new Map(
    PRODUCTION_PACK.actors.map((actor) => [actor.id, actor]),
  );
  const lanticaIds = PRODUCTION_PACK.idols
    .filter((idol) => idol.unit === LANTICA_UNIT)
    .map((idol) => idol.id);

  it('has the whole unit in the pack', () => {
    expect(lanticaIds.length).toBeGreaterThanOrEqual(3);
  });

  for (const idolId of lanticaIds) {
    it(`${idolId} keeps a varied but trainable week`, () => {
      const actor = actors.get(idolId);
      expect(actor, `${idolId} 没有 ActorDef`).toBeTruthy();
      const days = daysOfTwoWeeks();

      const locations = new Set(
        days.flatMap((day) =>
          getSchedulesForDay(actor!, day).map((slot) => slot.locationId),
        ),
      );
      expect(
        locations.size,
        `${idolId} 两周里只去了 ${locations.size} 个地点，太单调`,
      ).toBeGreaterThanOrEqual(5);

      for (const week of [0, 1]) {
        const practiceDays = days
          .slice(week * 7, week * 7 + 7)
          .filter((day) =>
            getSchedulesForDay(actor!, day).some(
              (slot) => slot.locationId === 'practice_room',
            ),
          );
        expect(
          practiceDays.length,
          `${idolId} 第 ${week + 1} 周只有 ${practiceDays.length} 天能去练习室`,
        ).toBeGreaterThanOrEqual(3);
      }

      // day 1 是周一
      const weekdays = days.slice(0, 5);
      const weekdaySignatures = new Set(
        weekdays.map((day) => signature(actor!, day)),
      );
      expect(
        weekdaySignatures.size,
        `${idolId} 周一到周五只有 ${weekdaySignatures.size} 种安排`,
      ).toBeGreaterThanOrEqual(4);

      const rotated = [1, 2, 3, 4, 5, 6, 7].filter(
        (day) => signature(actor!, day) !== signature(actor!, day + 7),
      );
      expect(
        rotated.length,
        `${idolId} 第 2 周和第 1 周每天都一样（weekParity 没生效）`,
      ).toBeGreaterThan(0);

      for (const day of days) {
        const slots = getSchedulesForDay(actor!, day).map(
          (slot) =>
            `${slot.fromMinute}-${slot.toMinute}@${slot.locationId ?? 'free'}`,
        );
        expect(
          new Set(slots).size,
          `${idolId} 第 ${day} 天有重复时段：${slots.join(', ')}`,
        ).toBe(slots.length);

        // 同一天里时段不能重叠：重叠时"她到底在哪"说不清，日程表也会打出两格。
        const ordered = getSchedulesForDay(actor!, day).sort(
          (a, b) => a.fromMinute - b.fromMinute,
        );
        for (let index = 1; index < ordered.length; index += 1) {
          expect(
            ordered[index]!.fromMinute,
            `${idolId} 第 ${day} 天的时段重叠：${ordered[index - 1]!.fromMinute}–${ordered[index - 1]!.toMinute} 与 ${ordered[index]!.fromMinute}–${ordered[index]!.toMinute}`,
          ).toBeGreaterThanOrEqual(ordered[index - 1]!.toMinute);
        }
      }
    });
  }
});
