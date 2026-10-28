import type { SaveEnvelope } from '../core/types';
import { migrateSave } from './save';
import { CONTENT_EPOCH, SAVE_VERSION } from './version';

export type ImportResult =
  | { ok: true; envelope: SaveEnvelope }
  | { ok: false; reason: string };

export function exportSaveText(envelope: SaveEnvelope): string {
  return JSON.stringify(envelope, null, 2);
}

export function parseSaveText(text: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, reason: '不是有效的 JSON 文件。' };
  }
  if (!parsed || typeof parsed !== 'object') {
    return { ok: false, reason: '文件内容不是存档对象。' };
  }

  const envelope = parsed as Partial<SaveEnvelope>;
  if (typeof envelope.schemaVersion !== 'number') {
    return { ok: false, reason: '缺少存档版本号。' };
  }
  if (envelope.schemaVersion > SAVE_VERSION) {
    return { ok: false, reason: '存档来自更新的游戏版本。' };
  }
  if (envelope.contentEpoch !== CONTENT_EPOCH) {
    return { ok: false, reason: '存档内容纪元不匹配。' };
  }
  if (!envelope.state || typeof envelope.state !== 'object') {
    return { ok: false, reason: '存档缺少状态数据。' };
  }

  return { ok: true, envelope: migrateSave(envelope as SaveEnvelope) };
}
