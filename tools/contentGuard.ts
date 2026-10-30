import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { BASE_PACK } from '../src/core/content/basePack.js';
import { packApprovedFiles } from '../src/core/content/approvedPacking.js';
import { buildContentIndex } from '../src/core/contentIndexCore.js';
import { mergeApprovedContent } from '../src/review/approval.js';
import { readApprovedDrafts } from './approvedFiles.js';

/**
 * 角色资料门禁。
 *
 * **为什么有这个东西**：PLAYBOOK 里写着「不许编造人设，先读语料」，
 * 但那条只是文字约定——灯织的第一版就是没读语料写的（相遇写成公园长椅），
 * 真乃的卡也错写过「公园唱歌是本作改编」。人（和模型）都会跳步骤。
 *
 * 所以这里把"读过资料"变成**可检查的产物**：
 *   1. 每个偶像必须有一张角色卡 `docs/content/<id>/character.md`
 *   2. 卡里必须有「语料索引」，并且至少指向一个**真实存在**的语料文件
 *   3. 卡里必须有「回查记录」
 *
 * 读没读是主观的，但**卡里写不出语料路径**这件事是客观的。
 *
 * 用法：npm run content:guard（已接进 content:validate）
 */

type Problem = { idol: string; message: string };

const corpusRoot = path.join(process.cwd(), '..', 'SCTranslationData');
const corpusAvailable = existsSync(path.join(corpusRoot, 'data', 'story'));

const approved = await readApprovedDrafts();
const merged = mergeApprovedContent(
  BASE_PACK,
  packApprovedFiles(
    Object.fromEntries(approved.map(({ file, draft }) => [file, draft])),
  ),
);
const index = buildContentIndex(merged.pack);

/** 卡里引用语料路径时，可能是日文目录名，按「文件是否存在」判断。 */
function resolveCorpusPaths(card: string): string[] {
  const matches = card.match(/data\/story\/[^\s`'"，、）)]+\.csv/g) ?? [];
  return [...new Set(matches)];
}

function findCorpusFile(relative: string): boolean {
  const full = path.join(corpusRoot, relative.replace(/\//g, path.sep));
  return existsSync(full);
}

const problems: Problem[] = [];

for (const idol of [...index.idols.values()]) {
  const cardPath = path.join(
    process.cwd(),
    'docs',
    'content',
    idol.id,
    'character.md',
  );

  if (!existsSync(cardPath)) {
    problems.push({
      idol: idol.id,
      message: `缺少角色卡 docs/content/${idol.id}/character.md`,
    });
    continue;
  }

  const card = readFileSync(cardPath, 'utf8');

  if (!card.includes('语料')) {
    problems.push({
      idol: idol.id,
      message: '角色卡里没有「语料」相关内容——先读语料再写卡',
    });
  }

  const paths = resolveCorpusPaths(card);
  if (paths.length === 0) {
    problems.push({
      idol: idol.id,
      message:
        '角色卡没有引用任何语料文件路径（形如 data/story/<角色>/W.I.N.G.編/xxx.csv）',
    });
  } else if (corpusAvailable) {
    const resolved = paths.filter(findCorpusFile);
    if (resolved.length === 0) {
      problems.push({
        idol: idol.id,
        message: `角色卡引用的语料文件一个都不存在：${paths.slice(0, 3).join('、')}`,
      });
    }
  }

  if (!card.includes('回查')) {
    problems.push({
      idol: idol.id,
      message: '角色卡里没有「回查记录」——写完全部内容后要对着语料回查一次',
    });
  }
}

if (!corpusAvailable) {
  console.warn(
    '提示：没找到 ../SCTranslationData，只检查了卡的结构，没校验语料路径。',
  );
}

if (problems.length === 0) {
  const count = [...index.idols.values()].length;
  console.log(`角色资料门禁通过：${count} 个偶像都有可追溯的角色卡。`);
} else {
  console.error('角色资料门禁未通过：\n');
  for (const problem of problems) console.error(`  [${problem.idol}] ${problem.message}`);
  console.error(
    '\n按 docs/content/character-card-template.md 补齐。没有语料就先别写内容。',
  );
  process.exitCode = 1;
}
