import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * 看一眼一张卡里的所有 commu 段，**按游戏内顺序**排好。
 *
 * 为什么需要它：一个卡片文件夹里通常有 2–5 段，有些是前后篇、有些毫无关系。
 * 之前靠 `ls` 的结果读，漏了三个文件，还把第 4 段当成第 2 段。
 *
 * 顺序从 commu id 的**第 7–8 位**还原：`2003 005 [02] 0010`。
 * 序号跳跃（比如 04 → 11）说明可能换了类别，肉眼再确认一下。
 *
 * 用法：
 *   npm run content:card -- "data/story/八宮めぐる/【夏に恋するピチカート！】八宮めぐる"
 *   （路径相对 SCTranslationData，可以省略前缀）
 */

const corpusRoot = path.join(process.cwd(), '..', 'SCTranslationData');

function resolveFolder(input: string | undefined): string {
  if (!input) {
    console.error(
      '用法：npm run content:card -- "data/story/<偶像>/【卡片名】"',
    );
    process.exit(1);
  }
  const direct = path.isAbsolute(input)
    ? input
    : path.join(corpusRoot, input.replace(/^data\//, 'data/'));
  return direct;
}

type Segment = {
  file: string;
  seq: string;
  lines: number;
  firstLines: string[];
};

function readSegment(file: string): Segment {
  const raw = readFileSync(file, 'utf8');
  // 只取 id 与译文列，避免引号/逗号把简单解析搞坏。
  const rows = raw
    .split(/\r?\n/)
    .slice(1)
    .filter((line) => line.trim().length > 0);

  let seq = '??';
  const firstLines: string[] = [];
  for (const line of rows) {
    const cells = line.split(',');
    const id = cells[0] ?? '';
    if (seq === '??' && /^\d{13}$/.test(id) && id !== '0000000000000') {
      seq = id.slice(7, 9);
    }
    // 最后一列是译文（可能被引号包着），取不到就跳过。
    const tail = cells[cells.length - 1]?.replace(/^"|"$/g, '').trim();
    if (tail && firstLines.length < 2 && !tail.startsWith('"')) {
      firstLines.push(tail.replace(/\\n/g, ''));
    }
  }

  return { file: path.basename(file, '.csv'), seq, lines: rows.length, firstLines };
}

const folder = resolveFolder(process.argv[2]);
if (!existsSync(folder)) {
  console.error(`找不到文件夹：${folder}`);
  process.exit(1);
}

const segments = readdirSync(folder)
  .filter((name) => name.endsWith('.csv'))
  .map((name) => readSegment(path.join(folder, name)))
  .sort((a, b) => a.seq.localeCompare(b.seq));

console.log(`\n${path.basename(folder)}`);
console.log(`共 ${segments.length} 段（按 commu id 序号）\n`);

for (const segment of segments) {
  console.log(`[${segment.seq}] ${segment.file}  · ${segment.lines} 行`);
  for (const line of segment.firstLines) console.log(`      ${line}`);
}

console.log(
  '\n提示：序号跳跃（如 04 → 11）通常意味着换了类别；前后篇关系仍要靠内容确认。',
);
