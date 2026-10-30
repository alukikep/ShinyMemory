import { describe, expect, it } from 'vitest';
import { APPROVED_CONTENT } from './content/approved.generated';
import { BASE_PACK, PRODUCTION_PACK } from './productionPack';

/**
 * 守一件事：审查台通过的内容必须真的出现在游戏加载的包里。
 *
 * 曾经手写合并漏了 `topics`——通过的话题进不了游戏，
 * 但所有单测（跑夹具）都是绿的。所以这里按「每种内容都对一遍」。
 */
describe('production pack', () => {
  it('contains every approved entry of every kind', () => {
    expect(PRODUCTION_PACK.activities).toHaveLength(
      BASE_PACK.activities.length + APPROVED_CONTENT.activities.length,
    );
    expect(PRODUCTION_PACK.events).toHaveLength(
      BASE_PACK.events.length + APPROVED_CONTENT.events.length,
    );
    expect(PRODUCTION_PACK.jobs).toHaveLength(
      BASE_PACK.jobs.length + APPROVED_CONTENT.jobs.length,
    );
    expect(PRODUCTION_PACK.items).toHaveLength(
      BASE_PACK.items.length + APPROVED_CONTENT.items.length,
    );
    expect(PRODUCTION_PACK.shops).toHaveLength(
      BASE_PACK.shops.length + APPROVED_CONTENT.shops.length,
    );
    expect(PRODUCTION_PACK.dialogues).toHaveLength(
      BASE_PACK.dialogues.length + APPROVED_CONTENT.dialogues.length,
    );
    expect(PRODUCTION_PACK.storyChains).toHaveLength(
      BASE_PACK.storyChains.length + APPROVED_CONTENT.storyChains.length,
    );
  });

  it('attaches approved topics to their actors', () => {
    for (const topic of APPROVED_CONTENT.topics) {
      const actor = PRODUCTION_PACK.actors.find(
        (entry) => entry.id === topic.actorId,
      );
      expect(actor, `缺少角色 ${topic.actorId}`).toBeDefined();
      expect(
        actor?.topics.some((entry) => entry.id === topic.id),
        `话题 ${topic.id} 没并进 ${topic.actorId}`,
      ).toBe(true);
    }
  });
});
