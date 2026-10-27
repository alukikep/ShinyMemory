import { useState } from 'react';
import { CONTENT_INDEX } from '../../core/contentIndex';
import { getScheduleWindow } from '../../core/schedule';
import { getActor } from '../../core/sim';
import { formatClock, getDay } from '../../core/time';
import type { GameState } from '../../core/types';
import { useDialogFocus } from '../hooks/useDialogFocus';

type IdolScheduleProps = {
  state: GameState;
  onClose: () => void;
};

function slotKind(
  label: string | undefined,
  locationId: string | undefined,
  visibility: 'public' | 'private' | undefined,
): string {
  if (
    visibility === 'private' ||
    !locationId ||
    locationId === 'home' ||
    label === '自由活动'
  ) {
    return 'free';
  }
  if (label === '休息') return 'rest';
  if (label === '收录' || locationId === 'studio') return 'recording';
  if (locationId === 'office') return 'office';
  return 'practice';
}

export function IdolSchedule({ state, onClose }: IdolScheduleProps) {
  const dialogRef = useDialogFocus<HTMLElement>();
  const recruitedIds = Object.keys(state.idols).filter(
    (id) => state.idols[id]?.status === 'recruited',
  );
  const [idolId, setIdolId] = useState(
    recruitedIds.includes(state.activeIdolId)
      ? state.activeIdolId
      : (recruitedIds[0] ?? state.activeIdolId),
  );
  const idol = recruitedIds.includes(idolId)
    ? CONTENT_INDEX.idols.get(idolId)
    : undefined;
  const actor = recruitedIds.includes(idolId) ? getActor(idolId) : undefined;
  const actorState = state.actors[idolId];
  const days = actor
    ? getScheduleWindow(
        actor,
        getDay(state.clock.absoluteMinutes),
        7,
        actorState?.scheduleOverrides,
      )
    : [];

  return (
    <div
      className="schedule-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="schedule-panel"
        role="dialog"
        aria-modal="true"
        aria-label="偶像日程表"
        ref={dialogRef}
        tabIndex={-1}
      >
        <header className="schedule-head">
          <div>
            <p className="eyebrow">IDOL SCHEDULE</p>
            <h2>偶像日程表</h2>
            <p className="schedule-note">
              今天起七天；只显示工作/事务所安排，未列出或私人时间为自由活动。
            </p>
          </div>
          <button
            type="button"
            className="roster-close"
            onClick={onClose}
            aria-label="关闭日程表"
          >
            关闭
          </button>
        </header>

        <div className="schedule-tabs" role="tablist" aria-label="选择偶像">
          {recruitedIds.map((id) => {
            const def = CONTENT_INDEX.idols.get(id);
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={id === idolId}
                className={`schedule-tab ${id === idolId ? 'active' : ''}`}
                onClick={() => setIdolId(id)}
              >
                {def?.name ?? id}
              </button>
            );
          })}
        </div>

        {idol ? (
          <div className="schedule-grid-wrap">
            <div className="schedule-grid">
              {days.map((day) => (
                <section
                  className={`schedule-day ${day.isToday ? 'today' : ''}`}
                  key={day.day}
                >
                  <h3>
                    {day.isToday
                      ? '今天'
                      : `${day.date.month}月${day.date.day}日`}
                  </h3>
                  <p className="schedule-weekday">
                    {day.isToday
                      ? `${day.date.month}月${day.date.day}日 · `
                      : ''}
                    {day.weekdayLabel}
                    {day.hasOverride ? (
                      <span className="schedule-temp">临时</span>
                    ) : null}
                  </p>
                  {day.slots.length === 0 ? (
                    <p className="schedule-empty">—</p>
                  ) : (
                    day.slots.map((slot, index) => {
                      const location = slot.locationId
                        ? CONTENT_INDEX.locations.get(slot.locationId)
                        : undefined;
                      const hidden =
                        slot.visibility === 'private' || !slot.locationId;
                      const name = hidden
                        ? '自由活动'
                        : location?.name ?? slot.locationId ?? '自由活动';
                      const label = hidden
                        ? '自由活动'
                        : slot.label;
                      return (
                        <div
                          className={`schedule-slot kind-${slotKind(
                            label,
                            slot.locationId,
                            slot.visibility,
                          )}`}
                          key={`${day.day}-${index}`}
                        >
                          <span className="schedule-time">
                            {formatClock(slot.fromMinute)}–
                            {slot.toMinute === 24 * 60
                              ? '24:00'
                              : formatClock(slot.toMinute)}
                          </span>
                          <strong>{name}</strong>
                          {label ? <small>{label}</small> : null}
                        </div>
                      );
                    })
                  )}
                </section>
              ))}
            </div>
            <p className="schedule-scroll-hint">左右滑动查看未来七天</p>
          </div>
        ) : (
          <p className="schedule-empty">没有可显示的日程。</p>
        )}
      </section>
    </div>
  );
}
