import { PRODUCTION_PACK } from '../src/core/productionPack';
import { walkPath, walkEdge } from '../src/core/content/map';
import type { LocationDef } from '../src/core/types';

/**
 * 写内容之前的"现场资料"：这一带有什么、谁会出现、怎么走。
 *
 * 用法：
 *   npm run content:where -- seaside
 *   npm run content:where -- pool
 *   npm run content:where -- --route office seaside
 *   npm run content:where -- --idol kiriko
 */

const pack = PRODUCTION_PACK;
const locations = pack.locations;
const byId = new Map(locations.map((location) => [location.id, location]));

function parentAreaOf(locationId: string): LocationDef | undefined {
  return locations.find((location) => location.members?.includes(locationId));
}

function pathMinutes(from: string, to: string): number | undefined {
  const path = walkPath(pack.walkEdges, from, to);
  if (path.length < 2) return undefined;
  let total = 0;
  for (let index = 0; index < path.length - 1; index += 1) {
    const edge = walkEdge(pack.walkEdges, path[index]!, path[index + 1]!);
    if (!edge) return undefined;
    total += edge.minutes;
  }
  return total;
}

function names(ids: string[]): string {
  return ids.map((id) => byId.get(id)?.name ?? id).join(' -> ');
}

function printLocation(locationId: string) {
  const location = byId.get(locationId);
  if (!location) return false;
  const parent = parentAreaOf(location.id);

  console.log(`\n${location.name}（${location.id}）${parent ? `· 位于${parent.name}` : ''}`);
  console.log(`  ${location.description}`);

  if (location.members?.length) {
    console.log('  里面：');
    for (const memberId of location.members) {
      const member = byId.get(memberId);
      console.log(`    · ${member?.name ?? memberId}（${memberId}）：${member?.description ?? ''}`);
    }
  }

  const activities = pack.activities.filter((activity) =>
    (activity.locations ?? []).includes(location.id),
  );
  if (activities.length) {
    console.log(`  可做：${activities.map((activity) => activity.name).join('、')}`);
  }
  const jobs = pack.jobs.filter((job) => job.locationId === location.id);
  if (jobs.length) console.log(`  工作：${jobs.map((job) => job.name).join('、')}`);
  const chains = pack.storyChains.flatMap((chain) =>
    chain.steps
      .filter((step) => step.locationId === location.id)
      .map((step) => `${chain.title}／${step.actionLabel}`),
  );
  if (chains.length) console.log(`  剧情：${chains.join('；')}`);
  const actors = pack.actors.filter((actor) =>
    actor.schedule.some((slot) => slot.locationId === location.id),
  );
  if (actors.length) {
    console.log(`  会经过：${actors.map((actor) => actor.name).join('、')}`);
  }

  for (const origin of ['office', 'home']) {
    if (origin === location.id) continue;
    const minutes = pathMinutes(origin, location.id);
    if (minutes !== undefined) {
      console.log(`  从${byId.get(origin)?.name}：步行 ${minutes} 分钟`);
    }
  }
  return true;
}

function printRoute(from: string, to: string) {
  const path = walkPath(pack.walkEdges, from, to);
  const minutes = pathMinutes(from, to);
  if (path.length < 2 || minutes === undefined) {
    console.log(`走不通：${from} → ${to}`);
    return;
  }
  console.log(`\n${names(path)}\n步行 ${minutes} 分钟（公共交通 5 分钟，¥100）`);
}

function printIdol(idolId: string) {
  const idol = pack.idols.find((entry) => entry.id === idolId);
  const actor = pack.actors.find((entry) => entry.id === idolId);
  if (!idol || !actor) {
    console.log(`没有这个偶像：${idolId}`);
    return;
  }
  console.log(`\n${idol.name}（${idol.id}）`);
  for (const slot of actor.schedule) {
    const place = slot.locationId
      ? (byId.get(slot.locationId)?.name ?? slot.locationId)
      : '自由活动';
    const parent = slot.locationId ? parentAreaOf(slot.locationId) : undefined;
    const from = String(Math.floor(slot.fromMinute / 60)).padStart(2, '0');
    const to = String(Math.floor(slot.toMinute / 60)).padStart(2, '0');
    console.log(
      `  ${from}:00–${to}:00  ${place}${parent ? `（${parent.name}）` : ''}  ${slot.label ?? ''}`,
    );
  }
  const bond = pack.activities.filter(
    (activity) => activity.kind === 'bond' && activity.idolIds?.includes(idol.id),
  );
  if (bond.length) {
    console.log(
      `  专属行动：${bond
        .map(
          (activity) =>
            `${activity.name}（${activity.locations?.map((id) => byId.get(id)?.name ?? id).join('/')}）`,
        )
        .join('、')}`,
    );
  }
}

const args = process.argv.slice(2);
if (args[0] === '--route' && args[1] && args[2]) {
  printRoute(args[1], args[2]);
} else if (args[0] === '--idol' && args[1]) {
  printIdol(args[1]);
} else if (args[0]) {
  const id = args[0];
  if (!printLocation(id)) {
    const parent = parentAreaOf(id);
    if (parent) {
      console.log(`\n${id} 在 ${parent.name}（${parent.id}）里面。`);
      printLocation(parent.id);
    } else {
      console.log(`没有这个地点：${id}`);
      console.log(
        `可选：${locations.map((location) => location.id).join('、')}`,
      );
    }
  }
} else {
  console.log('用法：content:where <地点> | --route <A> <B> | --idol <id>');
}
