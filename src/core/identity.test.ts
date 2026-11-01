import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PRODUCTION_PACK } from './productionPack';
import type { IdolDef, SchoolStage } from './types';

/**
 * 身份门禁：idol 的 `age` / `school` 必须和 `docs/content/_materials/facts/<id>.md` 对得上。
 *
 * 事故（2026-11-02）：把 19 岁的冬優子写成"社会人"——facts 第一行明明写着"专门学校一年级"。
 * 年龄推不出身份，而身份直接决定日程（专门学校平日上午是 protected）。
 * 所以身份不是"写在哪都行"的备注，是一条会被机器核对的声明。
 */

type FactsStage = Exclude<SchoolStage, 'none'>;

/** facts 里认这些说法；认不出就必须写 schoolNote。 */
const STAGE_TOKENS: Array<[RegExp, FactsStage]> = [
  [/小学/, 'elementary'],
  [/初中|中学[一二三0-9]?年|中学生/, 'junior'],
  [/高中|高校[一二三0-9]?年|高校生/, 'high'],
  [/专门学校|専門学校/, 'specialised'],
  [/大学[一二三0-9]?年|大学生/, 'university'],
];

function factsPath(id: string): string {
  return `docs/content/_materials/facts/${id}.md`;
}

function readFactsHead(id: string): string {
  // 基本信息在前几行：取前 8 行足够，不扫全文，避免"角色台词里提到大学"这种误判。
  return readFileSync(factsPath(id), 'utf8')
    .split('\n')
    .slice(0, 8)
    .join('\n');
}

/**
 * 只看写着年龄的那一句——facts 后面的段落里会出现"小时候""小学生的时候"这类回忆，
 * 拿整段去匹配会把"16 岁高中生"判成小学。
 */
function detectStage(head: string): FactsStage | undefined {
  const sentence = head.split('\n').find((line) => /\d{1,2}\s*岁/.test(line));
  if (!sentence) return undefined;
  // 「高中时被发掘，高中毕业后上京」这种：写了学段，但同句说已经毕业——不在学籍。
  // 目前只有羽那命中；命中时仍要求写 schoolNote（不能靠默认）。
  if (/毕业|卒業/.test(sentence)) return undefined;
  for (const [pattern, stage] of STAGE_TOKENS) {
    if (pattern.test(sentence)) return stage;
  }
  return undefined;
}

function detectAge(head: string): number | undefined {
  const match = head.match(/(\d{1,2})\s*岁/);
  return match ? Number(match[1]) : undefined;
}

/** 年龄能接受的学段；超出就是填错了。 */
const AGE_RANGES: Array<[FactsStage, [number, number]]> = [
  ['elementary', [6, 12]],
  ['junior', [12, 15]],
  ['high', [15, 19]],
  ['university', [17, 26]],
  ['specialised', [17, 26]],
];

describe('idol identity', () => {
  const idols = PRODUCTION_PACK.idols;

  it('every idol declares age and school', () => {
    for (const idol of idols) {
      expect(idol.age, `${idol.id} 没有 age`).toBeTypeOf('number');
      expect(idol.school, `${idol.id} 没有 school`).toBeDefined();
    }
  });

  it('declared age matches the facts sheet', () => {
    const mismatches: string[] = [];
    for (const idol of idols) {
      const expected = detectAge(readFactsHead(idol.id));
      if (expected === undefined) continue; // facts 没写年龄的角色，靠人审
      if (idol.age !== expected) {
        mismatches.push(`${idol.id}: 声明 ${idol.age} / facts ${expected}`);
      }
    }
    expect(mismatches).toEqual([]);
  });

  it('declared school stage matches the facts sheet', () => {
    const problems: string[] = [];
    for (const idol of idols) {
      const head = readFactsHead(idol.id);
      const detected = detectStage(head);
      if (!detected) {
        if (!idol.schoolNote) {
          problems.push(
            `${idol.id}: facts 没写学段，也没写 schoolNote（必须有说明，不能靠默认）`,
          );
        }
        continue;
      }
      if (idol.school !== detected) {
        problems.push(
          `${idol.id}: 声明 '${idol.school}'，但 facts 写的是 ${detected}`,
        );
      }
    }
    expect(problems).toEqual([]);
  });

  it('age is plausible for the declared stage', () => {
    const problems: string[] = [];
    for (const idol of idols) {
      if (!idol.age || !idol.school || idol.school === 'none') continue;
      const range = AGE_RANGES.find(([stage]) => stage === idol.school);
      if (!range) continue;
      const [min, max] = range[1];
      if (idol.age < min || idol.age > max) {
        problems.push(
          `${idol.id}: ${idol.age} 岁不该是 ${idol.school}（应在 ${min}–${max}）`,
        );
      }
    }
    expect(problems).toEqual([]);
  });
});

export type { IdolDef };
