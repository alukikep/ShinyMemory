import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * 批量收集角色资料：一次把 28 个偶像的
 * 基础资料、首张卡（含剧本编号）、WING 相遇剧本编号、头像与角色卡是否就绪
 * 收进 `.cache/shiny/materials/`，并生成 `docs/content/_materials/index.md`。
 *
 * 素材来源（只读）：
 * - API：https://api.shinycolors.moe/info/{idolList,idolInfo,pCardInfo}
 * - 角色资料：eidolon-sc 的 facts（--facts-dir 可改；读不到就跳过）
 *
 * 用法：
 *   npx tsx tools/collectIdolMaterials.ts
 *   npx tsx tools/collectIdolMaterials.ts --facts-dir "E:/path/to/facts"
 *
 * 注意：
 * - 原始 JSON 只落 .cache（已 gitignore），**不提交**。
 * - 生成的 index.md 只有编号/名字/组合/首卡标题这类事实数据，可以提交。
 * - 请求间隔 1.1 秒（志愿维护的服务），有缓存就不重复请求。
 */

const API = 'https://api.shinycolors.moe/info';
const CACHE = path.join(process.cwd(), '.cache', 'shiny', 'materials');
const DOCS = path.join(process.cwd(), 'docs', 'content', '_materials');
const DEFAULT_FACTS = path.join(
  'E:\\game dev\\eidolon-sc\\characters\\facts',
);

type IdolListEntry = { idolId: number; idolName: string; cv: string };

type IdolCard = {
  cardIndex: number;
  cardName: string;
  cardUuid: string;
  cardType: string;
  getMethod: string;
  releaseDate: string;
};

type IdolInfo = {
  idolId: number;
  idolName: string;
  idolFirstName: string;
  idolLastName: string;
  nickName: string;
  unitId: number;
  age: number;
  birthday: string;
  height: number;
  cv: string;
  hirameki: string;
  color1: string;
  color2: string;
  cardLists: IdolCard[];
  unit: { unitId: number; unitName: string; color1: string; color2: string };
};

type CardEvent = {
  eventId: number;
  eventTitle: string;
  eventCategory: string;
};

type CardInfo = {
  cardName: string;
  cardIdolEvents: CardEvent[];
};

type Row = {
  id: string;
  idolId: number;
  name: string;
  unit: string;
  unitColor: string;
  color: string;
  birthday: string;
  age: number;
  cv: string;
  hirameki: string;
  wing: string;
  cardTitle: string;
  segments: CardEvent[];
  avatar: boolean;
  facts: boolean;
  factsFile?: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function exists(file: string): Promise<boolean> {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function fetchJson<T>(url: string, cacheFile: string): Promise<T> {
  if (await exists(cacheFile)) {
    return JSON.parse(await readFile(cacheFile, 'utf8')) as T;
  }
  const response = await fetch(url, {
    headers: { 'User-Agent': 'shinymemory local material export' },
  });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  const text = await response.text();
  await writeFile(cacheFile, text, 'utf8');
  await sleep(1100);
  return JSON.parse(text) as T;
}

/** 卡面候选：正式的 P 卡（排除 IdolRoad / Default 之类特殊卡）。 */
function cardCandidates(info: IdolInfo): IdolCard[] {
  return info.cardLists
    .filter(
      (card) =>
        card.cardType.startsWith('P_') &&
        card.getMethod !== 'IdolRoad' &&
        card.getMethod !== 'Default',
    )
    .sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));
}

/** 找一张"有 2 段以上"的卡（commu + after story），实在没有就用第一张。 */
async function pickCard(info: IdolInfo): Promise<{
  card: IdolCard;
  info: CardInfo;
} | null> {
  const candidates = cardCandidates(info).slice(0, 3);
  let firstWithSegments: { card: IdolCard; info: CardInfo } | null = null;
  for (const card of candidates) {
    const file = path.join(CACHE, `card-${card.cardUuid}.json`);
    const details = await fetchJson<CardInfo>(
      `${API}/pCardInfo?cardId=${card.cardUuid}`,
      file,
    );
    const entry = { card, info: details };
    if (!firstWithSegments) firstWithSegments = entry;
    if ((details.cardIdolEvents?.length ?? 0) >= 2) return entry;
  }
  return firstWithSegments;
}

function wingScript(idolId: number): string {
  return `10${String(idolId).padStart(2, '0')}00101`;
}

/** 头像文件名的例外（API 的 nickName 和素材文件名不完全一致）。 */
const AVATAR_ALIASES: Record<string, string> = {
  toru: 'tooru',
};

async function avatarFor(id: string): Promise<boolean> {
  const file = AVATAR_ALIASES[id] ?? id;
  return exists(
    path.join(process.cwd(), 'public', 'assets', 'idols', 'q', `${file}.png`),
  );
}

function renderIndex(rows: Row[], factsCount: number): string {
  const lines: string[] = [];
  lines.push('# 角色资料包（批量收集）');
  lines.push('');
  lines.push(
    '> 由 `npx tsx tools/collectIdolMaterials.ts` 生成；原始 JSON 在 `.cache/shiny/materials/`（不提交）。',
  );
  lines.push(
    '> 角色资料参考：eidolon-sc `characters/facts/<id>.md`（有其 `.sources.md` 记出处）。',
  );
  lines.push(
    `> 共 ${rows.length} 人，头像就绪 ${rows.filter((row) => row.avatar).length}，facts 就绪 ${factsCount}。`,
  );
  lines.push('');
  lines.push('## 一览');
  lines.push('');
  lines.push(
    '| id | 名字 | 组合 | 生日 | 年龄 | CV | 头像 | facts | WING | 首张卡 | 段数 |',
  );
  lines.push('|---|---|---|---|---|---|---|---|---|---|---:|');
  for (const row of rows) {
    lines.push(
      `| \`${row.id}\` | ${row.name} | ${row.unit} | ${row.birthday} | ${row.age} | ${row.cv} | ${row.avatar ? '✓' : '—'} | ${row.facts ? '✓' : '—'} | \`${row.wing}\` | ${row.cardTitle} | ${row.segments.length} |`,
    );
  }
  lines.push('');
  lines.push('## 首卡剧本编号（2xxxxxxxx）');
  lines.push('');
  lines.push('| id | 卡名 | 章节 | 剧本编号 |');
  lines.push('|---|---|---|---|');
  for (const row of rows) {
    for (const event of row.segments) {
      lines.push(
        `| \`${row.id}\` | ${row.cardTitle} | ${event.eventTitle} | \`${event.eventId}\` |`,
      );
    }
  }
  lines.push('');
  lines.push('## 取数规则（别再靠猜）');
  lines.push('');
  lines.push('```text');
  lines.push('WING 首本   10{idolId:02}00101   （已用 4/5/10/20 验证）');
  lines.push('卡面段落    pCardInfo?cardId=<cardUuid> → cardIdolEvents[].eventId');
  lines.push('角色 id     idolInfo.nickName');
  lines.push('角色色      idolInfo.color1（组合色见 unit.color1）');
  lines.push('```');
  lines.push('');
  lines.push('## 抓取时已知的缺口');
  lines.push('');
  lines.push(
    '- 头像缺失的 2 人（羽那、はるき）在 `public/assets/idols/q/` 没有文件，名册会退回首字。',
  );
  lines.push(
    '- facts 缺的角色，写角色卡前要先读剧本；eidolon-sc 里有的，也要按 `sources.md` 回查剧本再引用。',
  );
  lines.push('');
  return lines.join('\n');
}

async function main() {
  const args = process.argv.slice(2);
  const factsDirIndex = args.indexOf('--facts-dir');
  const factsDir =
    factsDirIndex >= 0 ? args[factsDirIndex + 1]! : DEFAULT_FACTS;

  await mkdir(CACHE, { recursive: true });
  await mkdir(DOCS, { recursive: true });

  const list = await fetchJson<IdolListEntry[]>(
    `${API}/idolList`,
    path.join(CACHE, 'idolList.json'),
  );

  const rows: Row[] = [];
  for (const entry of list) {
    // 只收 1–28 的正式偶像（91 是事务员，801+ 是联动）。
    if (entry.idolId < 1 || entry.idolId > 28) continue;

    const info = await fetchJson<IdolInfo>(
      `${API}/idolInfo?idolId=${entry.idolId}`,
      path.join(CACHE, `idol-${entry.idolId}.json`),
    );

    const picked = await pickCard(info);
    const id = info.nickName;
    const factsFile = path.join(factsDir, `${id}.md`);
    const hasFacts = await exists(factsFile);

    rows.push({
      id,
      idolId: info.idolId,
      name: info.idolName,
      unit: info.unit.unitName,
      unitColor: info.unit.color1,
      color: info.color1,
      birthday: info.birthday,
      age: info.age,
      cv: info.cv,
      hirameki: info.hirameki,
      wing: wingScript(info.idolId),
      cardTitle: picked?.card.cardName ?? '（无 P 卡）',
      segments: picked?.info.cardIdolEvents ?? [],
      avatar: await avatarFor(id),
      facts: hasFacts,
      factsFile: hasFacts ? factsFile : undefined,
    });

    console.log(
      `${String(info.idolId).padStart(2, '0')} ${id.padEnd(9)} ${info.unit.unitName.padEnd(12)} ` +
        `${picked?.info.cardIdolEvents?.length ?? 0} 段  ${hasFacts ? 'facts ✓' : 'facts —'}`,
    );
  }

  await writeFile(
    path.join(CACHE, 'summary.json'),
    JSON.stringify(rows, null, 2),
    'utf8',
  );
  await writeFile(
    path.join(DOCS, 'index.md'),
    renderIndex(rows, rows.filter((row) => row.facts).length),
    'utf8',
  );

  console.log('');
  console.log(`已写出 ${path.relative(process.cwd(), path.join(DOCS, 'index.md'))}`);
  console.log(
    `头像 ${rows.filter((row) => row.avatar).length}/${rows.length}，` +
      `facts ${rows.filter((row) => row.facts).length}/${rows.length}`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
