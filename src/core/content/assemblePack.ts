import type { ContentPack } from '../contentIndexCore';
import { PENDING_CHAPTERS } from './chapters';
import { attachRegisteredChapters } from '../contentAssembly';

/**
 * 把卡面/长线的结构拼到内容包上。
 *
 * 这些链的对话是审查台通过的内容，不能放进 `BASE_PACK`；
 * 但只拼“对话已经批过”的链，避免批到一半时引用不存在的对话。
 *
 * 游戏加载、内容体检、构建校验都必须走这一个函数——
 * 曾经各写各的，导致 `content:audit` 误报 `job.first_live` 的解锁 flag 不存在。
 */
export function attachPendingChapters(pack: ContentPack): ContentPack {
  return attachRegisteredChapters(pack, PENDING_CHAPTERS).pack;
}
