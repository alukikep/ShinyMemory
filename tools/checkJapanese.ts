import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { findJapaneseLines } from '../src/review/japaneseText.js';
import type { ReviewDraft } from '../src/review/types.js';

/**
 * 报告"还没翻的整句日文"。
 *
 * 规则来自 playbook §1.7：整句日文一律翻，口癖/拟声/专有名词可留。
 * 判定逻辑和审查台共用 `findJapaneseLines`（`src/review/japaneseText.ts`），
 * 所以这里报出来的，和人点「通过」时看到的是同一套。
 *
 * 两种模式：
 *   npm run content:japanese             # 报告模式：approved + drafts + revisions，永远退出 0
 *   npm run content:japanese -- --strict  # 门禁模式：**只看 approved**，还有未翻译就退出 1
 *
 * 门禁只看 approved 是有意的：草稿没批之前不该让构建变红，
 * 否则写一半的内容会把整个仓库卡住。
 *
 * 白名单：`content-review/japanese-allowlist.json`，登记"就是要留日文"的行
 * （和歌引用、必须保留的原句）。每条都要写 reason，按正文精确匹配——
 * 改了句子就不再豁免，得重新登记。过期条目会提示，但不阻塞。
 */

const ROOT = path.join(process.cwd(), 'content-review');
const ALLOWLIST = path.join(ROOT, 'japanese-allowlist.json');
const strict = process.argv.includes('--strict');
const DIRS = strict ? (['approved'] as const) : (['approved', 'drafts', 'revisions'] as const);

type AllowEntry = { text: string; reason: string; file?: string };
type Hit = {
  dir: string;
  file: string;
  draftId: string;
  path: string;
  text: string;
  hiragana: number;
  visible: number;
};

async function loadAllowlist(): Promise<AllowEntry[]> {
  try {
    const raw = JSON.parse(await readFile(ALLOWLIST, 'utf8')) as { entries?: AllowEntry[] };
    return Array.isArray(raw.entries) ? raw.entries : [];
  } catch (error) {
    if ((error as { code?: string }).code === 'ENOENT') return [];
    throw new Error(
      `japanese-allowlist.json 解析失败：${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

async function scan(): Promise<Hit[]> {
  const hits: Hit[] = [];
  for (const dir of DIRS) {
    const directory = path.join(ROOT, dir);
    let names: string[] = [];
    try {
      names = await readdir(directory);
    } catch {
      continue;
    }
    for (const name of names.filter((entry) => entry.endsWith('.json')).sort()) {
      let draft: ReviewDraft;
      try {
        draft = JSON.parse(await readFile(path.join(directory, name), 'utf8')) as ReviewDraft;
      } catch {
        continue;
      }
      for (const line of findJapaneseLines(draft.payload)) {
        hits.push({
          dir,
          file: name,
          draftId: draft.id ?? name,
          path: line.path,
          text: line.text,
          hiragana: line.hiragana,
          visible: line.visible,
        });
      }
    }
  }
  return hits;
}

const allow = (await loadAllowlist()).filter(
  (entry) => typeof entry.text === 'string' && entry.text !== '',
);
const allHits = await scan();
const hits = allHits.filter(
  (hit) =>
    !allow.some((entry) => entry.text === hit.text && (!entry.file || entry.file === hit.file)),
);
const exempted = allHits.filter((hit) => !hits.includes(hit));
const exemptKeys = new Set(exempted.map((hit) => `${hit.file}\u0000${hit.text}`));
const stale = allow.filter(
  (entry) => ![...exemptKeys].some((key) => key.endsWith(`\u0000${entry.text}`)),
);

if (hits.length === 0) {
  const extra = allow.length > 0 ? `（${allow.length} 条白名单生效）` : '';
  console.log(`没有发现未翻译的整句日文${extra}。`);
  if (stale.length > 0) {
    console.log(`白名单里有 ${stale.length} 条没匹配到任何内容，可能改过了：`);
    for (const entry of stale) console.log(`  - ${entry.text.slice(0, 30)}（${entry.reason}）`);
  }
} else {
  const byDir = new Map<string, Hit[]>();
  for (const hit of hits) {
    const list = byDir.get(hit.dir) ?? [];
    list.push(hit);
    byDir.set(hit.dir, list);
  }
  console.log(`发现 ${hits.length} 行疑似整句日文（${[...byDir.keys()].join(' / ')}）：`);
  for (const [dir, list] of byDir) {
    console.log(
      `\n[${dir}] ${list.length} 行，涉及 ${new Set(list.map((hit) => hit.file)).size} 个文件`,
    );
    for (const hit of list) {
      const percent = Math.round((hit.hiragana / hit.visible) * 100);
      const sample = hit.text.length > 40 ? `${hit.text.slice(0, 40)}…` : hit.text;
      console.log(`  ${hit.file} ${hit.path}（${percent}%）:: ${sample}`);
    }
  }
  console.log(
    '\n规则见 playbook §1.7：整句必须翻；口癖（ばい/たい/んふふー）、拟声、专有名词可留。' +
      '\n确实要保留的，登记到 content-review/japanese-allowlist.json（必须写 reason）。',
  );
  if (strict) process.exitCode = 1;
}
