import { PRODUCTION_PACK } from '../src/core/productionPack.js';
import { ODD_JOB_SCALE_BY_RANK, isOddJob, oddJobStatKey } from '../src/core/oddJob.js';

/**
 * 数值效率报告。
 *
 * 把每个行动的收益折算成「每点成本值多少」，用来发现：
 *   - 三份零工的兑换率是否一致（不该有"某个零工明显更划算"）
 *   - 零工 S 级是否还在 ¥100 以下（上限约定）
 *   - 训练的经验/体力是否偏差过大（允许差异，但要看见）
 *
 *   npm run content:balance
 */

const STRESS_WEIGHT = 1.5; // 1 压力 = 1.5 体力（休息 120 分 = +30 体力 / −20 压力）
const ODD_JOB_RATE = 4.5; // ¥ / 综合成本点
const RATE_TOLERANCE = 0.1; // ±10%
const S_CAP = 100;

const problems: string[] = [];

const moneyOf = (activity: (typeof PRODUCTION_PACK.activities)[number]) =>
  (activity.effects ?? []).find((effect) => effect.kind === 'money')?.[
    'delta' as never
  ] as number | undefined;

const stressOf = (activity: (typeof PRODUCTION_PACK.activities)[number]) =>
  ((activity.effects ?? []).find(
    (effect) => effect.kind === 'sharedStat' && effect.stat === 'stress',
  ) as { delta?: number } | undefined)?.delta ?? 0;

const expOf = (activity: (typeof PRODUCTION_PACK.activities)[number]) => {
  const gains = (activity.effects ?? []).filter((effect) => effect.kind === 'attributeExp') as {
    ref: { scope?: string };
    tier: number;
  }[];
  return gains
    .filter((gain) => gain.ref.scope !== 'producer')
    .reduce((sum, gain) => sum + gain.tier, 0);
};

console.log('\n=== 零工（制作人）');
console.log('名称            体力  压力  综合  报酬   ¥/成本   S级');
for (const activity of PRODUCTION_PACK.activities.filter(isOddJob)) {
  const stamina = activity.cost.stamina ?? 0;
  const stress = stressOf(activity);
  const money = moneyOf(activity) ?? 0;
  const cost = stamina + stress * STRESS_WEIGHT;
  const rate = money / cost;
  const sPay = Math.round(money * ODD_JOB_SCALE_BY_RANK.S.pay);
  const stat = oddJobStatKey(activity);
  console.log(
    `${activity.name.padEnd(14)}${String(stamina).padStart(4)}${String(stress).padStart(6)}` +
      `${cost.toFixed(1).padStart(6)}${String(money).padStart(6)}${rate.toFixed(2).padStart(8)}` +
      `${String(sPay).padStart(6)}   (${stat})`,
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

console.log('\n=== 训练（偶像）');
console.log('名称            体力  经验  经验/体力  压力');
for (const activity of PRODUCTION_PACK.activities) {
  if (activity.kind !== 'training') continue;
  const stamina = activity.cost.stamina ?? 0;
  const exp = expOf(activity);
  const stress = stressOf(activity);
  console.log(
    `${activity.name.padEnd(14)}${String(stamina).padStart(4)}${String(exp).padStart(6)}` +
      `${(exp / stamina).toFixed(3).padStart(10)}${String(stress).padStart(6)}`,
  );
}

console.log('\n=== 休息');
for (const activity of PRODUCTION_PACK.activities.filter((a) => a.kind === 'rest' || a.kind === 'bond')) {
  const stamina = activity.cost.stamina ?? 0;
  const stress = stressOf(activity);
  console.log(
    `${activity.name.padEnd(14)}${String(activity.durationMinutes).padStart(4)}分 体力${String(stamina).padStart(3)} 压力${String(stress).padStart(4)}`,
  );
}

console.log('\n=== 偶像工作（不受零工倍率影响）');
for (const job of PRODUCTION_PACK.jobs) {
  const stress = (job.effects ?? []).find(
    (effect) => effect.kind === 'sharedStat' && effect.stat === 'stress',
  ) as { delta?: number } | undefined;
  const minutes = job.toMinute - job.fromMinute;
  console.log(
    `${job.name.padEnd(12)}${String(minutes).padStart(4)}分 ¥${String(job.pay).padStart(5)} 压力+${stress?.delta ?? 0}` +
      `  = ¥${Math.round((job.pay / minutes) * 60)}/时`,
  );
}

const timeToMax = (500 / 3) * 30; // 500 经验 / 每次 3 经验 × 30 分
console.log(
  `\n参考：一条属性从 F 到 S 需 500 经验 ≈ ${Math.round(500 / 3)} 次训练 = ${Math.round(timeToMax / 60)} 小时`,
);

if (problems.length > 0) {
  console.log(`\n⚠ 数值问题 ${problems.length} 条：`);
  for (const problem of problems) console.log(`  · ${problem}`);
  process.exitCode = 1;
} else {
  console.log('\n数值检查：兑换率一致，S 级上限合规');
}
