import { useState } from 'react';
import { MAX_WEEKS } from '../../core/config';
import { ACTIVITIES, LOCATIONS } from '../../core/content';
import { getActivity, getEvent, getTriggerReport } from '../../core/sim';
import type { GameState, TriggerReport } from '../../core/types';

type DebugPanelProps = {
  state: GameState;
  onForceEvent: (eventId: string) => void;
  onJumpWeek: (week: number) => void;
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
  onJumpWeek,
}: DebugPanelProps) {
  const [activityId, setActivityId] = useState('');
  const [weekInput, setWeekInput] = useState(String(state.week));

  const activity = activityId ? getActivity(activityId) : undefined;
  const context = activityId
    ? { lastActivityId: activityId, lastActivityKind: activity?.kind }
    : {};
  const locationName =
    LOCATIONS.find((location) => location.id === state.locationId)?.name ??
    state.locationId;

  const reports = getTriggerReport(state, context);

  return (
    <section className="panel debug-panel">
      <div className="panel-head">
        <h2>调试</h2>
        <span className="panel-note">?debug=1</span>
      </div>

      <div className="debug-meta">
        第 {state.week} 周 · {state.slot === 0 ? '平日' : '周末'} ·{' '}
        {state.phase} · 地点 {locationName} · 行动 {state.actionsTaken} · ¥
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
            max={MAX_WEEKS}
            value={weekInput}
            onChange={(event) => setWeekInput(event.target.value)}
          />
          周
          <button
            type="button"
            className="ghost-button"
            onClick={() => {
              const week = Number(weekInput);
              if (Number.isFinite(week)) onJumpWeek(week);
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
