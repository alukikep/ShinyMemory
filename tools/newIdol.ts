import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * 新角色脚手架：一次生成"骨架四处 + 角色卡空壳"，防止接入时漏掉静默项。
 *
 * 为什么要有它：事故 #30（日程里没有练习室 → 事件永远不触发）、
 * #31（只写了 IdolDef，名册/日程表看不到）、#32（旧档里没有条目）
 * 的共同点是"少写一处不会报错"。脚手架把四处一次写齐，
 * 空日程会让 `productionRoster.test` 直接红，逼你填。
 *
 * 用法：
 *   npx tsx tools/newIdol.ts \
 *     --id kogane --name 月冈恋钟 --unit "L'Antica" --color "#f2a0b5" \
 *     --profile "L'Antica 的成员。……" --birthday 03/03 --cv "礒部花凜"
 *
 * 可选：--status unknown|known（默认 unknown）、--portrait、--avatar、--quote、--dry-run
 *
 * 它**不写**：招募链、章节、任何草稿内容——那些要先读剧本再写。
 */

type Options = {
  id: string;
  name: string;
  unit: string;
  profile: string;
  color?: string;
  status: 'unknown' | 'known';
  birthday?: string;
  cv?: string;
  quote?: string;
  portrait?: string;
  avatar?: string;
  dryRun: boolean;
  force: boolean;
};

const CONTENT = path.join(process.cwd(), 'src', 'core', 'content');
const IDOLS_DIR = path.join(CONTENT, 'idols');
const ACTORS_DIR = path.join(CONTENT, 'actors');

function parseArgs(argv: string[]): Options {
  const values = new Map<string, string>();
  let dryRun = false;
  let force = false;
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]!;
    if (token === '--dry-run') {
      dryRun = true;
      continue;
    }
    if (token === '--force') {
      force = true;
      continue;
    }
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      throw new Error(`参数 --${key} 缺值`);
    }
    values.set(key, next);
    index += 1;
  }

  const required = (key: string): string => {
    const value = values.get(key);
    if (!value) throw new Error(`缺少必填参数 --${key}`);
    return value;
  };

  const status = values.get('status') ?? 'unknown';
  if (status !== 'unknown' && status !== 'known') {
    throw new Error(`--status 只能是 unknown / known，收到 ${status}`);
  }

  return {
    id: required('id'),
    name: required('name'),
    unit: required('unit'),
    profile: required('profile'),
    color: values.get('color'),
    status,
    birthday: values.get('birthday'),
    cv: values.get('cv'),
    quote: values.get('quote'),
    portrait: values.get('portrait'),
    avatar: values.get('avatar') ?? `./assets/idols/q/${required('id')}.png`,
    dryRun,
    force,
  };
}

function idolSource(options: Options): string {
  const lines = [
    "import type { IdolDef } from '../../types';",
    '',
    'const idol: IdolDef = {',
    `  id: '${options.id}',`,
    `  name: '${options.name}',`,
    `  unit: ${JSON.stringify(options.unit)},`,
    `  color: '${options.color ?? '#b79bd1'}',`,
    `  profile: ${JSON.stringify(options.profile)},`,
  ];
  if (options.portrait) {
    lines.push(`  portrait: '${options.portrait}',`);
  }
  lines.push(`  avatar: '${options.avatar}',`);
  if (options.quote) {
    lines.push(`  quote: ${JSON.stringify(options.quote)},`);
  }
  lines.push(
    '  // TODO 成长曲线按角色定位改（vocal/dance/expression 各有擅长与短板）。',
    '  growth: {',
    "    vocal: { initial: 'E', max: 'A' },",
    "    dance: { initial: 'E', max: 'A' },",
    "    expression: { initial: 'E', max: 'A' },",
    "    trust: { initial: 'F', max: 'S' },",
    '  },',
    '};',
    '',
    'export default idol;',
    '',
  );
  return lines.join('\n');
}

function actorSource(options: Options): string {
  const lines = [
    "import type { ActorDef } from '../../types';",
    '',
    '/**',
    ` * ${options.name} 的作息。`,
    ' *',
    ' * 依据：TODO 从剧本里摘（相遇那本的台词行 id）。',
    ' * **日程决定她能不能做某件事**：训练/专属行动/事件都挂在她在场的地点。',
    ' * 特别要检查：练习室（训练课）、以及训练后事件要触发的那个地点。',
    ' */',
    'const actor: ActorDef = {',
    `  id: '${options.id}',`,
    `  name: '${options.name}',`,
    "  role: 'idol',",
    options.profile
      ? `  description: ${JSON.stringify(options.profile)},`
      : '  description: "",',
    '  // TODO 空日程会让 productionRoster.test 变红——按剧本填完再跑测试。',
    '  schedule: [],',
    '  // TODO 话题在审查台写（<id>.chat.*），这里保持空数组。',
    '  topics: [],',
    '};',
    '',
    'export default actor;',
    '',
  ];
  return lines.join('\n');
}

function characterCard(options: Options): string {
  const meta = [
    options.birthday ? `生日 ${options.birthday}` : '',
    options.cv ? `CV：${options.cv}` : '',
  ]
    .filter(Boolean)
    .join(' · ');

  return `# ${options.name}（${options.id}）

> 精简版角色卡。只保留"写的时候真的会用到的判断"。
> 素材：游戏原始剧本（\`.cache/shiny\`），编号见 §8。
${meta ? `> ${meta}\n` : ''}
---

## 1. 一句话

TODO 用一句话说清她**怎么保护自己**。

## 2. 相遇与招募（事实）

TODO 从剧本抄事实，**每条 "- " 行后面必须跟 13 位行 id**（如 \`[1005001010030]\`），否则 content:guard 会红。

## 3. 语言习惯（有据）

| 特征 | 例（原文） | 说明 |
|---|---|---|
| | | |

## 4. 三种语域

| 场景 | 说法 |
|---|---|
| 日常 | |
| 情绪高 / 被戳中 | |
| 低落 / 认真 | |

## 5. 关系

| 对象 | 关系 | 写法 |
|---|---|---|
| 制作人 | | |
| 同组合 | | |

## 6. OOC 对照

| ❌ 不要写 | ✅ 应该写 |
|---|---|
| | |

## 7. 写作时三个判断

1. 
2. 
3. 

## 8. 剧本编号

\`\`\`text
TODO 至少三个：W.I.N.G.（1xxxxxxxx）+ 卡面（2xxxxxxxx）
\`\`\`

## 9. 回查记录

| 内容 | 结论 |
|---|---|
| | |
`;
}

/** 在 import 区按字母序插入一行；找不到锚点就报错，不静默跳过。 */
function insertImport(source: string, line: string, moduleName: string): string {
  if (source.includes(line)) return source;
  const lines = source.split('\n');
  const existingImports = lines
    .map((text, index) => ({ text, index }))
    .filter(({ text }) => text.startsWith('import '));
  if (existingImports.length === 0) {
    throw new Error(`找不到 import 区，无法登记 ${moduleName}`);
  }
  const afterTypeImport = existingImports.filter(({ text }) =>
    text.startsWith('import type '),
  ).length;
  let insertAt = existingImports[afterTypeImport]?.index ?? existingImports[0]!.index;
  for (const entry of existingImports.slice(afterTypeImport)) {
    const match = entry.text.match(/from '\.\/([^']+)'/);
    if (match && match[1]! > moduleName) {
      insertAt = entry.index;
      break;
    }
    insertAt = entry.index + 1;
  }
  lines.splice(insertAt, 0, line);
  return lines.join('\n');
}

/** 在导出数组里追加一项（已有就跳过）。 */
function insertArrayEntry(
  source: string,
  arrayName: string,
  moduleName: string,
): string {
  const pattern = new RegExp(
    `export const ${arrayName}[^=]*= \\[([^\\]]*)\\];`,
  );
  const match = source.match(pattern);
  if (!match) throw new Error(`找不到 ${arrayName} 数组`);
  const items = match[1]!.split(',').map((item) => item.trim()).filter(Boolean);
  if (items.includes(moduleName)) return source;
  const next = [...items, moduleName].join(', ');
  return source.replace(pattern, `export const ${arrayName}: ${arrayType(arrayName)} = [${next}];`);
}

function arrayType(arrayName: string): string {
  return arrayName === 'IDOLS' ? 'IdolDef[]' : 'ActorDef[]';
}

/** 在 starting.ts 的 idolStatus 里插一条（已有就跳过）。 */
function insertStartingStatus(
  source: string,
  id: string,
  status: 'unknown' | 'known',
): string {
  if (new RegExp(`\\n\\s*${id}: '`).test(source)) return source;
  const anchor = /\n\s*\} as Record<string, IdolStatus>/;
  if (!anchor.test(source)) throw new Error('starting.ts 里找不到 idolStatus 的结束锚点');
  return source.replace(anchor, `\n    ${id}: '${status}',\n  } as Record<string, IdolStatus>`);
}

async function exists(file: string): Promise<boolean> {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!/^[a-z][a-z0-9]*$/.test(options.id)) {
    throw new Error(`--id 只能用小写字母/数字（收到 ${options.id}）`);
  }

  const idolFile = path.join(IDOLS_DIR, `${options.id}.ts`);
  const actorFile = path.join(ACTORS_DIR, `${options.id}.ts`);
  const cardFile = path.join(process.cwd(), 'docs', 'content', options.id, 'character.md');

  if (!options.force) {
    for (const file of [idolFile, actorFile, cardFile]) {
      if (await exists(file)) {
        throw new Error(`${path.relative(process.cwd(), file)} 已存在（要覆盖加 --force）`);
      }
    }
  }

  const avatarFile = path.join(
    process.cwd(),
    'public',
    options.avatar.replace(/^\.\//, ''),
  );
  const avatarReady = await exists(avatarFile);

  if (options.dryRun) {
    console.log(`[dry-run] 会创建：`);
    console.log(`  ${path.relative(process.cwd(), idolFile)}`);
    console.log(`  ${path.relative(process.cwd(), actorFile)}`);
    console.log(`  ${path.relative(process.cwd(), cardFile)}`);
    console.log(`[dry-run] 会登记：idols/index.ts、actors/index.ts、starting.ts`);
    console.log(`[dry-run] 头像 ${options.avatar} ${avatarReady ? '存在' : '不存在（名册会退回首字）'}`);
    return;
  }

  const idolsIndex = path.join(IDOLS_DIR, 'index.ts');
  const actorsIndex = path.join(ACTORS_DIR, 'index.ts');
  const startingFile = path.join(CONTENT, 'starting.ts');

  const [idolsIndexSource, actorsIndexSource, startingSource] = await Promise.all([
    readFile(idolsIndex, 'utf8'),
    readFile(actorsIndex, 'utf8'),
    readFile(startingFile, 'utf8'),
  ]);

  const nextIdolsIndex = insertArrayEntry(
    insertImport(
      idolsIndexSource,
      `import ${options.id} from './${options.id}';`,
      options.id,
    ),
    'IDOLS',
    options.id,
  );
  const nextActorsIndex = insertArrayEntry(
    insertImport(
      actorsIndexSource,
      `import ${options.id} from './${options.id}';`,
      options.id,
    ),
    'ACTORS',
    options.id,
  );
  const nextStarting = insertStartingStatus(
    startingSource,
    options.id,
    options.status,
  );

  await mkdir(path.dirname(cardFile), { recursive: true });
  await Promise.all([
    writeFile(idolFile, idolSource(options), 'utf8'),
    writeFile(actorFile, actorSource(options), 'utf8'),
    writeFile(cardFile, characterCard(options), 'utf8'),
    writeFile(idolsIndex, nextIdolsIndex, 'utf8'),
    writeFile(actorsIndex, nextActorsIndex, 'utf8'),
    writeFile(startingFile, nextStarting, 'utf8'),
  ]);

  // 写完回读确认——插入用的正则匹配不上时必须炸，不能静默少登记。
  const [checkIdols, checkActors, checkStarting] = await Promise.all([
    readFile(idolsIndex, 'utf8'),
    readFile(actorsIndex, 'utf8'),
    readFile(startingFile, 'utf8'),
  ]);
  if (!checkIdols.includes(`${options.id},`) && !checkIdols.includes(`${options.id}]`)) {
    throw new Error('idols/index.ts 登记失败');
  }
  if (!checkActors.includes(`${options.id},`) && !checkActors.includes(`${options.id}]`)) {
    throw new Error('actors/index.ts 登记失败');
  }
  if (!checkStarting.includes(`${options.id}: '${options.status}'`)) {
    throw new Error('starting.ts 登记失败');
  }

  console.log(`已创建 ${options.name}（${options.id}）：`);
  console.log(`  ${path.relative(process.cwd(), idolFile)}`);
  console.log(`  ${path.relative(process.cwd(), actorFile)}`);
  console.log(`  ${path.relative(process.cwd(), cardFile)}`);
  console.log(`  已登记 idols/index.ts、actors/index.ts、starting.ts（${options.status}）`);
  if (!avatarReady) {
    console.log(`  ⚠ 头像缺失：${options.avatar}（名册会退回首字）`);
  }
  console.log('');
  console.log('接下来必须做的（缺一项都会被红：content:guard / productionRoster.test）：');
  console.log('  1. 读剧本、填角色卡（每行事实带 13 位行 id）');
  console.log('  2. 填 actors/<id>.ts 的日程（空日程 = 名册/日程表/事件全都不可用）');
  console.log('  3. 写招募链（2 步）+ 对话草稿，送审查台');
  console.log('  4. 按 new-idol.md §2 做内容批次与首张卡');
  console.log('  5. 跑 npm run content:drafts → build → coverage → 序章 E2E');
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
