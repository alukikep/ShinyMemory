/**
 * 卡面改编的锚点校验（纯函数，不碰文件系统）。
 *
 * 改编允许压缩台词，但每章必须保留 ≥3 句**原文逐字**的台词作为锚点。
 * 锚点同时校验两头：
 *   1. 它真的出现在语料源文件里（不是凭印象写的）
 *   2. 它真的活到了游戏内容里（改编时没被删掉）
 *
 * 这样「压缩」和「走样」就能被机器区分开。
 */

export type ChapterSource = {
  /** 章节 id，建议和剧情链 id 一致。 */
  chapterId: string;
  /** 语料文件路径，相对 SCTranslationData（如 data/story/.../xxx.csv）。 */
  source: string;
  /**
   * 这张卡里的第几节。index/total 由 content:anchors 按 commu 序号核对，
   * 手填错会直接报红——顺序靠猜会出事（见 playbook §4.9）。
   */
  card?: { title: string; index: number; total: number };
  /**
   * 锚点：原作里必须覆盖到的**原句 id**（如 2003005010410）。
   *
   * 以前是"中文逐字引文"，现在改为 id——因为中文是我们自己写的，
   * 没有可比的权威译本；而 id 能对着游戏剧本（私有缓存）校验。
   */
  anchors: string[];
  /** 游戏剧本编号，如 200300501。用于找到原始剧本核对锚点。 */
  script?: string;
};

export type AnchorProblem = {
  chapterId: string;
  message: string;
};

/** 按 commu id 的第 7–8 位排序后，某一段在卡里的位置。 */
export type CardOrder = { index: number; total: number };

export type AnchorValidatorOptions = {
  /** 给一个章节源文件，返回它在卡里的顺序（拿不到就不校验）。 */
  readCardOrder?: (source: string) => CardOrder | undefined;
  /**
   * 拿到某个剧本里出现过的**行 id**（读私有缓存；拿不到就不校验）。
   * 中文是我们自己写的，锚点用 id 而不是译文——见 playbook §4.8。
   */
  readScriptIds?: (script: string) => Set<string> | undefined;
  /** 剧本全文（用于"日文原句"式锚点；旧格式剧本没有行 id）。 */
  readScriptText?: (script: string) => string | undefined;
};

const MIN_ANCHORS = 3;

export function validateChapterAnchors(
  chapters: ChapterSource[],
  options: AnchorValidatorOptions,
): AnchorProblem[] {
  const problems: AnchorProblem[] = [];

  for (const chapter of chapters) {
    if (chapter.anchors.length < MIN_ANCHORS) {
      problems.push({
        chapterId: chapter.chapterId,
        message: `锚点不足 ${MIN_ANCHORS} 句（现在 ${chapter.anchors.length} 句）`,
      });
    }

    if (chapter.card && options.readCardOrder) {
      const order = options.readCardOrder(chapter.source);
      if (order && (order.index !== chapter.card.index || order.total !== chapter.card.total)) {
        problems.push({
          chapterId: chapter.chapterId,
          message: `卡内序号与语料不一致：写的是第 ${chapter.card.index}/${chapter.card.total} 节，实际是第 ${order.index}/${order.total} 节`,
        });
      }
    }

    const ids = chapter.script
      ? options.readScriptIds?.(chapter.script)
      : undefined;
    const text = chapter.script
      ? options.readScriptText?.(chapter.script)
      : undefined;

    for (const anchor of chapter.anchors) {
      if (/^\d{13}$/.test(anchor)) {
        if (ids && !ids.has(anchor)) {
          problems.push({
            chapterId: chapter.chapterId,
            message: `锚点 id 在剧本里不存在：${anchor}`,
          });
        }
      } else if (text) {
        const strip = (value: string) => value.replace(/\s+/g, '');
        if (!strip(text).includes(strip(anchor))) {
          problems.push({
            chapterId: chapter.chapterId,
            message: `锚点原句在剧本里找不到：${anchor}`,
          });
        }
      }
    }
  }

  return problems;
}

/**
 * 章节结构的机器校验。
 *
 * 章节是**结构**（TS），进不了审查台——所以由这里代替人审：
 * 链存不存在、每一步的对话/地点/时间窗有没有真的接上。
 *
 * 锚点管"像不像原作"，这里管"能不能跑起来"。
 */

export type ChapterStructureProbe = {
  /** 剧情链 id → 步骤（只有校验需要的字段）。 */
  chains: Map<
    string,
    {
      idolId: string;
      stepCount: number;
      steps: { dialogueId: string; locationId: string }[];
    }
  >;
  dialogueIds: Set<string>;
  locationIds: Set<string>;
};


/**
 * 触发配置的连锁校验。
 *
 * 规则来自真实事故：第一章的 `when` 里写了它自己才设置的完成 flag，
 * 结果这一章永远不会出现（要先完成它才能触发它）。
 */
export type ChapterTrigger = {
  chapterId: string;
  /** 每个偶像各自一条序列，互不承接。 */
  idolId: string;
  /** 同一条链才承接：一个偶像的两张卡互不相关。 */
  chainId?: string;
  /** 第一步要求的 flag */
  needsFlags: string[];
  /** 第一步设置（effects）的 flag */
  setsFlags: string[];
  day?: number;
  locationId?: string;
  fromMinute?: number;
  toMinute?: number;
};

export function validateChapterTriggers(
  chapters: ChapterTrigger[],
): ChapterStructureProblem[] {
  const problems: ChapterStructureProblem[] = [];

  const previousByIdol = new Map<string, ChapterTrigger>();

  for (const chapter of chapters) {
    // 自引用：要求自己设置的 flag
    for (const flag of chapter.needsFlags) {
      if (chapter.setsFlags.includes(flag)) {
        problems.push({
          chapterId: chapter.chapterId,
          message: `要求自己设置的 flag「${flag}」——这一章永远不会出现`,
        });
      }
    }

    if (!chapter.locationId) {
      problems.push({ chapterId: chapter.chapterId, message: '没有触发地点' });
    }
    if (
      chapter.fromMinute !== undefined &&
      chapter.toMinute !== undefined &&
      !(chapter.fromMinute < chapter.toMinute)
    ) {
      problems.push({ chapterId: chapter.chapterId, message: '时间窗不合法' });
    }

    const key = `${chapter.idolId}::${chapter.chainId ?? ''}`;
    const previous = previousByIdol.get(key);
    if (previous) {
      const chained = previous.setsFlags.some((flag) =>
        chapter.needsFlags.includes(flag),
      );
      if (!chained) {
        problems.push({
          chapterId: chapter.chapterId,
          message: `没有承接上一章（${previous.chapterId}）的完成 flag`,
        });
      }
      if (
        chapter.day !== undefined &&
        previous.day !== undefined &&
        chapter.day <= previous.day
      ) {
        problems.push({
          chapterId: chapter.chapterId,
          message: `最早天数 ${chapter.day} 没有晚于上一章的 ${previous.day}`,
        });
      }
    }
    previousByIdol.set(key, chapter);
  }

  return problems;
}

export type ChapterStructureProblem = {
  chapterId: string;
  message: string;
};


/**
 * 卡面章的"形状"规则。
 *
 * 这些是从真实错误里长出来的，不是理论：
 *   · 一章拆成几步 → 选项只影响那一步，后面照旧（视觉小说里不成立）
 *   · 选项后面只写一句就合流 → 选项等于没做（原作分支占半章）
 *   · 一章塞两三个选择点 → 原作每章 0 或 1 个
 */

export type ChapterShapeInput = {
  chapterId: string;
  stepCount: number;
  /**
   * 原作这一段选项后面有没有分支正文。
   * 有 → 分支必须够厚；没有（选完立即合流）→ 不要求。
   */
  expectBranch?: boolean;
  /** 原作这一章有几个分支（来自剧本结构）。拿得到就必须一致。 */
  expectedBranches?: number;
  dialogue?: {
    startNodeId: string;
    nodes: Record<
      string,
      { id?: string; nextNodeId?: string; choices?: { label: string; nextNodeId: string }[] }
    >;
  };
};

/** 分支最短要求：少于这个节点数，选项就只是换了一句话。 */
const MIN_BRANCH_NODES = 2;

export function validateChapterShape(
  inputs: ChapterShapeInput[],
): ChapterStructureProblem[] {
  const problems: ChapterStructureProblem[] = [];

  for (const input of inputs) {
    if (input.stepCount !== 1) {
      problems.push({
        chapterId: input.chapterId,
        message: `卡面章应该是 1 步（一次坐下读完），现在是 ${input.stepCount} 步`,
      });
    }
    if (!input.dialogue) {
      problems.push({
        chapterId: input.chapterId,
        message: '找不到这一章的对话（对话是否已送审？）',
      });
      continue;
    }

    const { nodes } = input.dialogue;
    const choiceNodes = Object.values(nodes).filter(
      (node) => Array.isArray(node.choices) && node.choices.length > 0,
    );

    if (
      input.expectedBranches !== undefined &&
      choiceNodes.length > 0 &&
      (choiceNodes[0]!.choices?.length ?? 0) !== input.expectedBranches
    ) {
      problems.push({
        chapterId: input.chapterId,
        message: `分支数与原作不一致：原作 ${input.expectedBranches} 支，这里 ${choiceNodes[0]!.choices?.length ?? 0} 支`,
      });
    }

    if (choiceNodes.length > 1) {
      problems.push({
        chapterId: input.chapterId,
        message: `一章只能有 0 或 1 个选择点，现在是 ${choiceNodes.length} 个`,
      });
    }

    for (const node of choiceNodes) {
      const choices = node.choices ?? [];
      if (choices.length < 2) {
        problems.push({
          chapterId: input.chapterId,
          message: '选择点至少要 2 个选项',
        });
      }

      const starts = choices.map((choice) => choice.nextNodeId);
      const reachable = (start: string): Set<string> => {
        const seen = new Set<string>();
        const queue = [start];
        while (queue.length > 0) {
          const id = queue.shift()!;
          if (seen.has(id) || !nodes[id]) continue;
          seen.add(id);
          const next = nodes[id]!.nextNodeId;
          if (next) queue.push(next);
          for (const choice of nodes[id]!.choices ?? []) queue.push(choice.nextNodeId);
        }
        return seen;
      };
      const sets = starts.map(reachable);
      const common = sets.every((set) => set.size > 0)
        ? [...sets[0]!].filter((id) => sets.every((set) => set.has(id)))
        : [];
      const merge = common[0];

      for (const [index, start] of starts.entries()) {
        let count = 0;
        let current: string | undefined = start;
        while (current && current !== merge && count < 100) {
          if (!nodes[current]) break;
          count += 1;
          current = nodes[current]!.nextNodeId;
        }
        if (input.expectBranch !== false && count < MIN_BRANCH_NODES) {
          problems.push({
            chapterId: input.chapterId,
            message: `第 ${index + 1} 个选项的分支只有 ${count} 个节点（至少 ${MIN_BRANCH_NODES} 个）——选项会变成"只换一句话"`,
          });
        }
      }

      // 不要求合流：卡面剧本里三条分支常常各自演到章末（实测 501/503/504 都是），
      // 强行要求"回到主线"会把原作结构改掉。
    }
  }

  // 可达性：写了但没接上的节点等于白写。
  for (const input of inputs) {
    if (!input.dialogue) continue;
    const { nodes, startNodeId } = input.dialogue;
    const seen = new Set<string>();
    const queue = [startNodeId];
    while (queue.length > 0) {
      const id = queue.shift()!;
      if (seen.has(id) || !nodes[id]) continue;
      seen.add(id);
      const node = nodes[id]!;
      if (node.nextNodeId) queue.push(node.nextNodeId);
      for (const choice of node.choices ?? []) queue.push(choice.nextNodeId);
    }
    const orphans = Object.keys(nodes).filter((id) => !seen.has(id));
    if (orphans.length > 0) {
      problems.push({
        chapterId: input.chapterId,
        message: `有 ${orphans.length} 个节点接不上（从开头走不到）：${orphans.slice(0, 3).join(', ')}`,
      });
    }
  }

  return problems;
}

export function validateChapterStructure(
  chapters: ChapterSource[],
  probe: ChapterStructureProbe,
): ChapterStructureProblem[] {
  const problems: ChapterStructureProblem[] = [];
  const registered = new Set(chapters.map((chapter) => chapter.chapterId));

  for (const chapter of chapters) {
    const chain = probe.chains.get(chapter.chapterId);
    if (!chain) {
      problems.push({
        chapterId: chapter.chapterId,
        message: '找不到同名剧情链（chapterId 和链 id 必须一致）',
      });
      continue;
    }

    for (const [index, step] of chain.steps.entries()) {
      if (!probe.dialogueIds.has(step.dialogueId)) {
        problems.push({
          chapterId: chapter.chapterId,
          message: `第 ${index + 1} 步的对话不存在：${step.dialogueId}`,
        });
      }
      if (!probe.locationIds.has(step.locationId)) {
        problems.push({
          chapterId: chapter.chapterId,
          message: `第 ${index + 1} 步的地点不存在：${step.locationId}`,
        });
      }
    }
  }

  // 反过来：设了 cadenceDays 的链必须是登记过的卡面章，避免"偷偷做了一章没登记"。
  for (const [chainId, chain] of probe.chains) {
    if (!chainId.includes('chapter')) continue;
    if (!registered.has(chainId)) {
      problems.push({
        chapterId: chainId,
        message: `链 id 看起来像卡面章（${chain.idolId}），但没在 chapterSources 登记（缺锚点）`,
      });
    }
  }

  return problems;
}
