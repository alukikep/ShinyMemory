import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

/**
 * 导出一段游戏原始剧本，还原它的**真实结构**。
 *
 * 为什么要它：SCTranslationData 的 CSV 是"屏幕上出现过的行按顺序平铺"，
 * 分支和合流全丢了（见 playbook §4.9）。游戏自己的剧本 JSON 里有
 * `select.nextLabel`（选项跳到哪个 label）、`label`（分支起点）、
 * `nextLabel: 'end'`（分支结束、跳到合流点）——结构是完整的。
 *
 * 用法：
 *   npx tsx tools/scriptExport.ts 200300501 200300502
 *
 * 产物（都在 .cache/shiny/，已被 gitignore）：
 *   200300501.json        原始剧本缓存
 *   200300501.md          可读剧本（日文 + 中文）
 *   200300501.structure.json  只有 id 和结构，没有正文
 *
 * 合规：原始日文只在本地缓存，不提交；仓库里只放我们自己的中文改编，
 * 以及不含正文的结构表（见 eidolon-sc 的 ADR-0003）。
 */

const VIEWER = 'https://viewer.shinycolors.moe/json';
const CACHE = path.join(process.cwd(), '.cache', 'shiny');
const CORPUS = path.join(process.cwd(), '..', 'SCTranslationData', 'data', 'story');

type Entry = {
  id?: number;
  speaker?: string;
  text?: string;
  select?: string;
  nextLabel?: string;
  label?: string;
  [key: string]: unknown;
};

type Node = {
  kind: 'line' | 'choice' | 'jump';
  index: number;
  id?: number;
  speaker?: string;
  text?: string;
  options?: { text: string; label: string }[];
  jump?: string;
  branch?: string;
};

mkdirSync(CACHE, { recursive: true });

async function fetchScript(script: string): Promise<Entry[]> {
  const file = path.join(CACHE, `${script}.json`);
  if (existsSync(file)) {
    return JSON.parse(readFileSync(file, 'utf8')) as Entry[];
  }
  const url = `${VIEWER}/produce_events/${script}.json`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'shinymemory local export (one request)' },
  });
  if (!response.ok) throw new Error(`${script}: HTTP ${response.status}`);
  const text = await response.text();
  writeFileSync(file, text, 'utf8');
  return JSON.parse(text) as Entry[];
}

/** 把平铺的剧本还原成：主干 → 选项 → 各分支 → 合流。 */
function parseScript(entries: Entry[]) {
  const labelIndex = new Map<string, number>();
  entries.forEach((entry, index) => {
    if (entry.label) labelIndex.set(entry.label, index);
  });

  const nextOf = (index: number): number | undefined => {
    const entry = entries[index]!;
    if (entry.select) return undefined;
    if (entry.nextLabel) {
      const target = labelIndex.get(entry.nextLabel);
      return target;
    }
    return index + 1 < entries.length ? index + 1 : undefined;
  };

  const line = (index: number, branch?: string): Node => {
    const entry = entries[index]!;
    return {
      kind: 'line',
      index,
      id: entry.id,
      speaker: entry.speaker,
      text: entry.text,
      branch,
    };
  };

  const toNode = (index: number, branch?: string): Node => {
    const entry = entries[index]!;
    if (entry.select) {
      // 收集紧跟其后的 select 行作为同一组选项
      const options: { text: string; label: string }[] = [];
      let cursor = index;
      while (cursor < entries.length && entries[cursor]!.select) {
        const current = entries[cursor]!;
        options.push({ text: current.select!, label: current.nextLabel ?? '?' });
        cursor += 1;
      }
      return { kind: 'choice', index, options, branch };
    }
    if (entry.nextLabel && !entry.text) {
      return { kind: 'jump', index, jump: entry.nextLabel, branch };
    }
    return line(index, branch);
  };

  const walk = (from: number, stopAtLabels: Set<string>, branch?: string): Node[] => {
    const nodes: Node[] = [];
    let cursor: number | undefined = from;
    const seen = new Set<number>();
    while (cursor !== undefined && !seen.has(cursor)) {
      seen.add(cursor);
      const entry = entries[cursor]!;
      if (entry.nextLabel && stopAtLabels.has(entry.nextLabel)) break;
      // 跳过没有正文的演出指令（wait/effect 之类），只留台词和选项
      if (entry.select || (entry.text && entry.text.trim())) {
        nodes.push(toNode(cursor, branch));
      }
      if (entry.select) break;
      cursor = nextOf(cursor);
    }
    return nodes;
  };

  const main: Node[] = [];
  const branches: { label: string; nodes: Node[] }[] = [];
  let cursor: number | undefined = 0;
  const seen = new Set<number>();

  while (cursor !== undefined && !seen.has(cursor)) {
    seen.add(cursor);
    const entry = entries[cursor]!;
    if (entry.select) {
      const choice = toNode(cursor);
      main.push(choice);
      const labels = (choice.options ?? []).map((option) => option.label);
      for (const label of labels) {
        const start = labelIndex.get(label);
        if (start === undefined) continue;
        branches.push({ label, nodes: walk(start, new Set(['end']), label) });
      }
      const end = labelIndex.get('end');
      if (end !== undefined) {
        main.push(...walk(end, new Set(), undefined));
      }
      break;
    }
    const entry = entries[cursor]!;
    if (entry.select || (entry.text && entry.text.trim())) {
      main.push(toNode(cursor));
    }
    cursor = nextOf(cursor);
  }

  return { main, branches };
}

/** 从汉化 CSV 里按 id 取中文。 */
function loadChinese(): Map<number, string> {
  const map = new Map<number, string>();
  const stack = [CORPUS];
  const files: string[] = [];
  while (stack.length > 0) {
    const dir = stack.pop()!;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.name.endsWith('.csv')) files.push(full);
    }
  }
  for (const file of files) {
    const rows = readFileSync(file, 'utf8').split(/\r?\n/).slice(1);
    for (const row of rows) {
      const cells = row.split(',');
      const id = Number(cells[0]);
      if (!Number.isFinite(id) || id === 0) continue;
      const trans = (cells[cells.length - 1] ?? '').replace(/^"|"$/g, '');
      if (trans.trim()) map.set(id, trans.replace(/\\n/g, ''));
    }
  }
  return map;
}

const scripts = process.argv.slice(2);
if (scripts.length === 0) {
  console.error('用法：npx tsx tools/scriptExport.ts <剧本编号> [更多编号…]');
  process.exit(1);
}

const chinese = loadChinese();

for (const script of scripts) {
  const entries = await fetchScript(script);
  const { main, branches } = parseScript(entries);

  const render = (node: Node): string => {
    if (node.kind === 'choice') {
      return (node.options ?? [])
        .map((option, index) => `【选项 ${index + 1}】${option.text} → 分支 ${option.label}`)
        .join('\n');
    }
    const zh = node.id ? chinese.get(node.id) : undefined;
    const who = node.speaker ?? '旁白';
    const jp = node.text ?? '';
    return `${who}：${zh ?? '（无中文）'}\n      日：${jp.replace(/\r?\n/g, '')}`;
  };

  const lines: string[] = [`# ${script}`, ''];
  lines.push('## 主干');
  for (const node of main) lines.push(render(node), '');
  for (const branch of branches) {
    lines.push(`## 分支 ${branch.label}`);
    for (const node of branch.nodes) lines.push(render(node), '');
  }

  writeFileSync(path.join(CACHE, `${script}.md`), `${lines.join('\n')}\n`, 'utf8');

  // 只有 id 和结构，没有正文——这个可以进仓库
  const structure = {
    script,
    main: main.map((node) => ({
      kind: node.kind,
      id: node.id,
      speaker: node.speaker,
      ...(node.options ? { options: node.options.map((o) => o.label) } : {}),
    })),
    branches: branches.map((branch) => ({
      label: branch.label,
      ids: branch.nodes.filter((node) => node.id).map((node) => node.id),
      count: branch.nodes.length,
    })),
  };
  writeFileSync(
    path.join(CACHE, `${script}.structure.json`),
    `${JSON.stringify(structure, null, 2)}\n`,
    'utf8',
  );

  console.log(
    `${script}：主干 ${main.length} 段，分支 ${branches.map((b) => `${b.label}(${b.nodes.length})`).join(' ')}`,
  );
}
