/**
 * 找出"疑似整句日文"的文本。
 *
 * 规则来自 playbook §1.7：台词是中文改编，**整句日文一律翻**，
 * 只有口癖 / 拟声 / 方言词 / 专有名词可以留。
 *
 * 为什么用平假名而不是"假名"：
 *   - 片假名在中文里很常见（`放課後クライマックスガールズ`、`ちゃんぽん`），
 *     按假名占比算会把"中文 + 组合名"整句误伤；
 *   - 平假名是日语的语法标记（てにをは、です・ます、だ・ね），
 *     中文台词里几乎不会成串出现。
 *
 * 两层阈值：
 *   - 长句：平假名 ≥ 8 且占比 ≥ 30% —— 一整句日文；
 *   - 短句：平假名 ≥ 6 且占比 ≥ 55% —— `うん……ありがとう。` 这种。
 * 两层都够不着的不报：`ふふー`、`きゅっきゅ♪`、`なーちゃん` 重复两次都过不了阈值。
 *
 * 这只是**警告**（不阻塞通过）：判断"念出来玩家会不会卡住"仍然要人来做。
 */

export type JapaneseLine = {
  /** 在 payload 里的路径，例如 `nodes.3.text`、`choices[0].label`。 */
  path: string;
  text: string;
  hiragana: number;
  visible: number;
  ratio: number;
};

const HIRAGANA = /[\u3040-\u309f]/g;

const LONG_MIN_HIRAGANA = 8;
const LONG_MIN_RATIO = 0.3;
const SHORT_MIN_HIRAGANA = 6;
const SHORT_MIN_RATIO = 0.55;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function visibleLength(text: string): number {
  let count = 0;
  for (const char of text) {
    if (!/\s/.test(char)) count += 1;
  }
  return count;
}

export function countHiragana(text: string): number {
  return (text.match(HIRAGANA) ?? []).length;
}

/** 判断一行是不是"念出来会卡住"的日文。 */
export function looksJapanese(text: string): boolean {
  const visible = visibleLength(text);
  if (visible === 0) return false;
  const hiragana = countHiragana(text);
  const ratio = hiragana / visible;
  if (hiragana >= LONG_MIN_HIRAGANA && ratio >= LONG_MIN_RATIO) return true;
  return hiragana >= SHORT_MIN_HIRAGANA && ratio >= SHORT_MIN_RATIO;
}

function collect(value: unknown, base: string, out: JapaneseLine[]): void {
  if (typeof value === 'string') {
    if (!looksJapanese(value)) return;
    const visible = visibleLength(value);
    const hiragana = countHiragana(value);
    out.push({ path: base, text: value, hiragana, visible, ratio: hiragana / visible });
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collect(item, `${base}[${index}]`, out));
    return;
  }
  if (isRecord(value)) {
    for (const [key, item] of Object.entries(value)) {
      collect(item, base === '' ? key : `${base}.${key}`, out);
    }
  }
}

/** 扫一份 payload（事件/对话/工作/物品……都适用），返回可疑行。 */
export function findJapaneseLines(payload: unknown): JapaneseLine[] {
  const out: JapaneseLine[] = [];
  collect(payload, '', out);
  return out;
}

export function describeJapaneseLine(line: JapaneseLine): string {
  const percent = Math.round(line.ratio * 100);
  const sample = line.text.length > 24 ? `${line.text.slice(0, 24)}…` : line.text;
  return (
    `[警告] japanese-text: ${line.path} 平假名 ${line.hiragana}/${line.visible}（${percent}%）` +
    `疑似整句日文：「${sample}」——整句必须翻，口癖/拟声/专有名词可留（playbook §1.7）`
  );
}
