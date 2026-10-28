import { CONTENT_INDEX } from '../core/contentIndex';
import { getDay, getMinuteOfDay } from '../core/time';
import type { SaveEnvelope } from '../core/types';

export type SaveSlotSummary = {
  day: number;
  minuteOfDay: number;
  locationId: string;
  locationName?: string;
  idolName?: string;
  money: number;
};

export type SaveSlotMeta = {
  id: string;
  label: string;
  createdAt: string;
  schemaVersion: number;
  gameVersion: string;
  contentEpoch: number;
  summary: SaveSlotSummary;
};

export function buildSlotMeta(
  id: string,
  label: string,
  envelope: SaveEnvelope,
): SaveSlotMeta {
  const state = envelope.state;
  const idolId = state.selectedIdolId;
  return {
    id,
    label,
    createdAt: envelope.createdAt,
    schemaVersion: envelope.schemaVersion,
    gameVersion: envelope.gameVersion,
    contentEpoch: envelope.contentEpoch,
    summary: {
      day: getDay(state.clock.absoluteMinutes),
      minuteOfDay: getMinuteOfDay(state.clock.absoluteMinutes),
      locationId: state.locationId,
      locationName: CONTENT_INDEX.locations.get(state.locationId)?.name,
      idolName: idolId ? CONTENT_INDEX.idols.get(idolId)?.name : undefined,
      money: state.money,
    },
  };
}

export function formatSlotTime(createdAt: string): string {
  return new Date(createdAt).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatSlotClock(minuteOfDay: number): string {
  const hour = Math.floor(minuteOfDay / 60);
  const minute = minuteOfDay % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}
