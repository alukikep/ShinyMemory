import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

/**
 * 文档路由的体检：`docs/tasks.md` 必须能覆盖所有"活跃文档"，且里面的链接都真实存在。
 *
 * 为什么需要它：这页是开工入口，但它最容易烂——有人新建/移动一篇文档，
 * 忘了登记，下一个人就找不到；或者链接指向已经挪走的文件。
 * 这两类问题都不会报错，只会让人少读一篇、然后写错。
 *
 * 规则：
 *   1. `docs/tasks.md` 里的相对链接必须解析得到（目录链接要求目录存在）。
 *   2. `docs/current/`、`docs/systems/`、`docs/content/`（顶层）、`docs/README.md`、
 *      `AGENTS.md`、根 `README.md` 都必须在这页里出现过（直接链接，或链接了它的目录）。
 *      —— 没出现就是"悄悄消失"，要么登记，要么说明为什么不登记。
 *   3. `docs/content/<偶像>/character.md` 必须存在（路由里写的是占位符，查不到就白指）。
 */

const ROOT = process.cwd();
const TASKS_FILE = path.join(ROOT, 'docs', 'tasks.md');
const LINK = /\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

type Problem = { kind: 'broken' | 'unlisted'; message: string };

const problems: Problem[] = [];
const referenced = new Set<string>();
const referencedDirs = new Set<string>();

function normalize(target: string): string {
  const clean = decodeURIComponent(target.split('#')[0] ?? '');
  return path.resolve(path.dirname(TASKS_FILE), clean);
}

async function exists(target: string): Promise<boolean> {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

const tasks = await readFile(TASKS_FILE, 'utf8');

for (const match of tasks.matchAll(LINK)) {
  const target = match[1];
  if (!target || /^(https?:|mailto:|#)/.test(target)) continue;
  const abs = normalize(target);
  if (target.endsWith('/')) {
    referencedDirs.add(abs);
    if (!(await exists(abs))) problems.push({ kind: 'broken', message: `目录不存在：${target}` });
    continue;
  }
  referenced.add(abs);
  if (!(await exists(abs))) problems.push({ kind: 'broken', message: `链接指向的文件不存在：${target}` });
}

// 活跃文档：必须被这页提到
const activeDirs = ['docs/current', 'docs/systems', 'docs/content'];
for (const dir of activeDirs) {
  const entries = await readdir(path.join(ROOT, dir), { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(ROOT, dir, entry.name);
    if (entry.isFile() && entry.name.endsWith('.md')) {
      if (!referenced.has(full)) {
        problems.push({
          kind: 'unlisted',
          message: `${path.relative(ROOT, full)} 没有出现在 docs/tasks.md 里（登记它，或写进"未纳入路线"）`,
        });
      }
    }
  }
}

for (const extra of ['AGENTS.md', 'README.md', 'docs/README.md']) {
  const full = path.join(ROOT, extra);
  if (!referenced.has(full)) {
    problems.push({ kind: 'unlisted', message: `${extra} 没有出现在 docs/tasks.md 里` });
  }
}

// 每个偶像目录都得有角色卡（路由里只写了占位符）
const contentDir = path.join(ROOT, 'docs', 'content');
for (const entry of await readdir(contentDir, { withFileTypes: true })) {
  if (!entry.isDirectory() || entry.name.startsWith('_')) continue;
  const card = path.join(contentDir, entry.name, 'character.md');
  if (!(await exists(card))) {
    problems.push({
      kind: 'unlisted',
      message: `docs/content/${entry.name}/character.md 不存在（路由指向它）`,
    });
  }
}

const broken = problems.filter((problem) => problem.kind === 'broken');
const unlisted = problems.filter((problem) => problem.kind === 'unlisted');

if (problems.length === 0) {
  console.log(`文档路由检查通过：${referenced.size} 个链接、${referencedDirs.size} 个目录指向都有效。`);
} else {
  if (broken.length > 0) {
    console.log(`断链 ${broken.length} 条：`);
    for (const problem of broken) console.log(`  × ${problem.message}`);
  }
  if (unlisted.length > 0) {
    console.log(`未登记 ${unlisted.length} 条：`);
    for (const problem of unlisted) console.log(`  ! ${problem.message}`);
  }
  console.log('\n修法：在 docs/tasks.md 里补一行（必读 / 可能需要 / 未纳入路线 之一）。');
  process.exitCode = 1;
}
