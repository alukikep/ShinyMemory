import { RANK_ORDER } from '../src/core/growth.js';
import { ODD_JOB_SCALE_BY_RANK, isOddJob, oddJobStatKey } from '../src/core/oddJob.js';
import {
  STAMINA_CAP_BY_RANK,
  STAMINA_COST_MULTIPLIER_BY_RANK,
} from '../src/core/producer.js';
import { PRODUCTION_PACK } from '../src/core/productionPack.js';
import type { ActivityDef, Effect, JobDef } from '../src/core/types.js';

/**
 * 数值效率报告。
 *
 * 旧版只看基础训练和旧休息，设施升级之后已经失真。
 * 现在按「基础 + 设施等级」展开，并把沙发、工作上限、体力/信赖曲线一起打出来。
 *
 *   npm run content:balance
 */

const STRESS_WEIGHT = 1.5; // 旧零工基准：1 压力 = 1.5 体力（来自旧休息 30/20）
const ODD_JOB_RATE = 4.5; // ¥ / 综合成本点
const RATE_TOLERANCE = 0.1;
const S_CAP = 100;
const MAX_EXP = 500;

const problems: string[] = [];

const pad = (value: string | number, width: number) =>
  String(value).padStart(width);

function effectsOf(activity: ActivityDef, level?: ActivityDef['levels'][number]): Effect[] {
  return level?.effects ?? activity.effects ?? [];
}

function staminaOf(effects: Effect[]): number {
  return (
    (effects.find(
      (effect) => effect.kind === 'sharedStat' && effect.stat === 'stamina',
    ) as { delta?: number } | undefined)?.delta ?? 0
  );
}

function stressOf(effects: Effect[]): number {
  return (
    (effects.find(
      (effect) => effect.kind === 'sharedStat' && effect.stat === 'stress',
    ) as { delta?: number } | undefined)?.delta ?? 0
  );
}

function moneyOf(effects: Effect[]): number {
  return (
    (effects.find((effect) => effect.kind === 'money') as { delta?: number } | undefined)
      ?.delta ?? 0
  );
}

function expOf(effects: Effect[]): number {
  return effects
    .filter((effect) => effect.kind === 'attributeExp')
    .filter((effect) => {
      const ref = effect.ref;
      return typeof ref === 'string' || ref.scope !== 'producer';
    })
    .reduce((sum, effect) => sum + (effect.kind === 'attributeExp' ? effect.tier : 0), 0);
}

function activityAt(
  activity: ActivityDef,
  level?: ActivityDef['levels'][number],
): ActivityDef {
  return {
    ...activity,
    ...(level ?? {}),
    cost: level?.cost ?? activity.cost,
    effects: level?.effects ?? activity.effects,
    durationMinutes: level?.durationMinutes ?? activity.durationMinutes,
  };
}

function trainingRows(activity: ActivityDef) {
  return [
    { level: 0, label: 'Lv0 基础', data: activity },
    ...(activity.levels ?? []).map((level) => ({
      level: level.level,
      label: `Lv${level.level}`,
      data: activityAt(activity, level),
    })),
  ];
}

// ---- 零工：保留旧的横向兑换率检查 ----
console.log('\n=== 零工（旧兑换基准）');
console.log('名称            体力  压力  综合  报酬   ¥/成本   S级');
for (const activity of PRODUCTION_PACK.activities.filter(isOddJob)) {
  const stamina = activity.cost.stamina ?? 0;
  const stress = stressOf(effectsOf(activity));
  const money = moneyOf(effectsOf(activity));
  const cost = stamina + stress * STRESS_WEIGHT;
  const rate = money / cost;
  const sPay = Math.round(money * ODD_JOB_SCALE_BY_RANK.S.pay);
  const stat = oddJobStatKey(activity);
  console.log(
    `${activity.name.padEnd(14)}${pad(stamina, 4)}${pad(stress, 6)}` +
      `${pad(cost.toFixed(1), 6)}${pad(money, 6)}${pad(rate.toFixed(2), 8)}` +
      `${pad(sPay, 6)}   (${stat})`,
  );

  if (Math.abs(rate - ODD_JOB_RATE) / ODD_JOB_RATE > RATE_TOLERANCE) {
    problems.push(
      `${activity.name}：¥${rate.toFixed(2)}/成本点，偏离基准 ¥${ODD_JOB_RATE} 超过 ${RATE_TOLERANCE * 100}%`,
    );
  }
  if (sPay > S_CAP) {
    problems.push(`${activity.name}：S 级 ¥${sPay}，超过上限 ¥${S_CAP}`);
  }
}

// ---- 训练：基础 + 设施等级 ----
console.log('\n=== 训练（按设施等级）');
console.log('名称                时间  体力   金钱   EXP  EXP/时  金钱/EXP');
for (const activity of PRODUCTION_PACK.activities) {
  if (activity.kind !== 'training') continue;
  const rows = trainingRows(activity);
  let previous: { duration: number; exp: number } | undefined;
  for (const row of rows) {
    const effects = effectsOf(activity, row.level === 0 ? undefined : row.data);
    const stamina = row.data.cost.stamina ?? 0;
    const money = row.data.cost.money ?? 0;
    const exp = expOf(effects);
    const duration = row.data.durationMinutes;
    console.log(
      `${`${activity.name}·${row.label}`.padEnd(18)}${pad(duration, 4)}${pad(stamina, 6)}${pad(money, 7)}` +
        `${pad(exp, 6)}${pad((exp / (duration / 60)).toFixed(2), 8)}${pad((money / exp).toFixed(1), 10)}`,
    );
    if (previous) {
      if (exp <= previous.exp) {
        problems.push(`${activity.name}/${row.label}：EXP 没有随等级上升`);
      }
      if (duration >= previous.duration) {
        problems.push(`${activity.name}/${row.label}：时间没有随等级下降`);
      }
    }
    previous = { duration, exp };
  }
}

// ---- 沙发 ----
const sofa = PRODUCTION_PACK.facilities?.find((facility) => facility.id === 'sofa');
const rest = PRODUCTION_PACK.activities.find((activity) => activity.id === 'rest');
const trainingStamina =
  PRODUCTION_PACK.activities.find((activity) => activity.id === 'vocal')?.cost
    .stamina ?? 15;

console.log('\n=== 沙发（固定 2 小时）');
console.log('等级        费用   体力  压力  约合训练次数');
const expectedSofa = [
  { stamina: 15, stress: -4 },
  { stamina: 20, stress: -6 },
  { stamina: 25, stress: -8 },
  { stamina: 30, stress: -10 },
];
if (!sofa || !rest) {
  problems.push('缺少 sofa 设施或 rest 行动');
} else {
  const costs = sofa.levels.map((level) => level.cost);
  if (costs.join(',') !== '3000,6000,9000') {
    problems.push(`沙发费用应为 3000/6000/9000，实际 ${costs.join('/')}`);
  }
  for (let level = 0; level <= 3; level += 1) {
    const levelDef = rest.levels?.find((entry) => entry.level === level);
    const effects = levelDef?.effects ?? rest.effects ?? [];
    const stamina = staminaOf(effects);
    const stress = stressOf(effects);
    const expected = expectedSofa[level]!;
    if (stamina !== expected.stamina || stress !== expected.stress) {
      problems.push(
        `沙发 Lv${level} 应为 +${expected.stamina}/−${Math.abs(expected.stress)}，实际 +${stamina}/${stress}`,
      );
    }
    console.log(
      `${`Lv${level}`.padEnd(10)}${pad(levelDef ? `¥${sofa.levels[level - 1]?.cost ?? 0}` : '—', 8)}` +
        `${pad(`+${stamina}`, 6)}${pad(stress, 6)}${pad((stamina / trainingStamina).toFixed(2), 12)}`,
    );
  }
  if (rest.durationMinutes !== 120) {
    problems.push(`休息时长应为 120 分钟，实际 ${rest.durationMinutes}`);
  }
}

// ---- 工作上限 ----
const office = PRODUCTION_PACK.facilities?.find((facility) => facility.id === 'office_jobs');
const jobDaily: Array<{ job: JobDef; daily: number }> = [...PRODUCTION_PACK.jobs]
  .map((job) => ({
    job,
    daily: job.pay / Math.max(1, job.cooldownDays ?? 0),
  }))
  .sort((a, b) => b.daily - a.daily);
const maxSlots = (office?.levels.length ?? 3) + 1;

console.log('\n=== 工作上限（按冷却折算日收入）');
if (!office) {
  problems.push('缺少 office_jobs 设施');
} else {
  const costs = office.levels.map((level) => level.cost);
  if (costs.join(',') !== '5000,15000,30000') {
    problems.push(`工作区费用应为 5000/15000/30000，实际 ${costs.join('/')}`);
  }
  for (let cap = 1; cap <= maxSlots; cap += 1) {
    const income = jobDaily
      .slice(0, cap)
      .reduce((sum, entry) => sum + entry.daily, 0);
    console.log(`${cap} 份上限：约 ¥${Math.round(income)}/天`);
  }
  console.log(
    `可派工作：${jobDaily.map((entry) => `${entry.job.name} ¥${Math.round(entry.daily)}/天`).join(' · ')}`,
  );
}

// ---- 体力与信赖 ----
console.log('\n=== 体力上限 / 消耗倍率');
console.log('Rank  上限   倍率   有效体力   +14 信赖   +28 信赖');
for (const rank of RANK_ORDER) {
  const cap = STAMINA_CAP_BY_RANK[rank];
  const multiplier = STAMINA_COST_MULTIPLIER_BY_RANK[rank];
  const effective = cap / multiplier;
  const half = (cap + 28) / multiplier;
  const full = (cap + 56) / multiplier;
  console.log(
    `${rank.padEnd(5)}${pad(cap, 5)}${pad(multiplier.toFixed(2), 7)}` +
      `${pad(effective.toFixed(1), 10)}${pad(half.toFixed(1), 10)}${pad(full.toFixed(1), 10)}`,
  );
}
if (STAMINA_CAP_BY_RANK.F !== 100 || STAMINA_CAP_BY_RANK.S !== 160) {
  problems.push('体力上限应为 F100 / S160');
}
if (STAMINA_COST_MULTIPLIER_BY_RANK.S !== 0.9) {
  problems.push('S 级体力消耗倍率应为 0.90');
}
if (STAMINA_COST_MULTIPLIER_BY_RANK.F !== 1) {
  problems.push('F 级体力消耗倍率应为 1.00');
}

// ---- 满级成本 ----
console.log('\n=== 一条属性 F→S（500 EXP）');
for (const activity of PRODUCTION_PACK.activities.filter(
  (entry) => entry.kind === 'training',
)) {
  const maxLevel = activity.levels?.at(-1);
  const maxData = activityAt(activity, maxLevel);
  const baseData = activity;
  const exp = expOf(effectsOf(activity, maxLevel));
  if (exp <= 0) continue;
  const sessions = Math.ceil(MAX_EXP / exp);
  console.log(
    `${activity.name}：满级 ${sessions} 次 / ${(sessions * maxData.durationMinutes / 60).toFixed(0)} 小时 / ¥${sessions * (maxData.cost.money ?? 0)}` +
      `（初级 ${Math.ceil(MAX_EXP / expOf(effectsOf(baseData)))} 次）`,
  );
}

if (problems.length > 0) {
  console.log(`\n⚠ 数值问题 ${problems.length} 条：`);
  for (const problem of problems) console.log(`  · ${problem}`);
  process.exitCode = 1;
} else {
  console.log('\n数值检查：训练/沙发/工作上限/体力曲线一致');
}
