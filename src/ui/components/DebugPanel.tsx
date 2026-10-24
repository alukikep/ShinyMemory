import { useState } from 'react';
import { MAX_DAYS } from '../../core/config';
import { ACTIVITIES, LOCATIONS } from '../../core/content';
import { getActivity, getEvent, getTriggerReport, isLocationOpen } from '../../core/sim';
import { formatClock, getDay } from '../../core/time';
import type { GameState, TriggerReport } from '../../core/types';

type DebugPanelProps = {
  state: GameState;
  onForceEvent: (eventId: string) => void;
  onJumpDay: (day: number) => void;
};

const REASON_LABEL: Record<NonNullable<TriggerReport['reason']>, string> = {
  condition: '条件不满足',
  after: '行动不匹配',
  once: '已触发过',
  cooldown: '冷却中',
};

export function DebugPanel({
  state,
  onForceEvent,
  onJumpDay,
}: DebugPanelProps) {
  const [activityId, setActivityId] = useState('');
  const [dayInput, setDayInput] = useState(String(getDay(state.clock.absoluteMinutes)));

  const activity = activityId ? getActivity(activityId) : undefined;
  const context = activityId
    ? { lastActivityId: activityId, lastActivityKind: activity?.kind }
    : {};
  const locationName =
    LOCATIONS.find((location) => location.id === state.locationId)?.name ??
    state.locationId;
  const locationOpen = isLocationOpen(state, state.locationId);

  const reports = getTriggerReport(state, context);

  return (
    <section className="panel debug-panel">
      <div className="panel-head">
        <h2>调试</h2>
        <span className="panel-note">?debug=1</span>
      </div>

      <div className="debug-meta">
        第 {getDay(state.clock.absoluteMinutes)} 天 ·{' '}
        {formatClock(state.clock.absoluteMinutes)} · {state.phase} · 地点{' '}
        {locationName}（{locationOpen ? '开放' : '已关门'}） · 行动{' '}
        {state.actionsTaken} · ¥
        {state.money.toLocaleString('zh-CN')} · 冷却记录{' '}
        {Object.keys(state.eventCooldowns).length}
      </div>

      <div className="debug-controls">
        <label>
          行动上下文
          <select
            value={activityId}
            onChange={(event) => setActivityId(event.target.value)}
          >
            <option value="">（无）</option>
            {ACTIVITIES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          跳到第
          <input
            type="number"
            min={1}
            max={MAX_DAYS}
            value={dayInput}
            onChange={(event) => setDayInput(event.target.value)}
          />
          天
          <button
            type="button"
            className="ghost-button"
            onClick={() => {
              const day = Number(dayInput);
              if (Number.isFinite(day)) onJumpDay(day);
            }}
          >
            跳转
          </button>
        </label>
      </div>

      <div className="debug-table-wrap">
        <table className="debug-table">
          <thead>
            <tr>
              <th>事件</th>
              <th>状态</th>
              <th>概率</th>
              <th>优先</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => {
              const event = getEvent(report.eventId);
              return (
                <tr key={report.eventId}>
                  <td>{event?.title ?? report.eventId}</td>
                  <td
                    className={
                      report.eligible ? 'debug-eligible' : 'debug-blocked'
                    }
                  >
                    {report.eligible
                      ? '可触发'
                      : REASON_LABEL[report.reason ?? 'condition']}
                  </td>
                  <td>{Math.round((event?.chance ?? 1) * 100)}%</td>
                  <td>{report.priority ?? 0}</td>
                  <td>
                    <button
                      type="button"
                      className="debug-force"
                      onClick={() => onForceEvent(report.eventId)}
                    >
                      强制
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
