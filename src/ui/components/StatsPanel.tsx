import { MAX_DAYS } from '../../core/config';
import { STAT_LABELS, STAT_MAX } from '../../core/labels';
import { formatClock, getDay } from '../../core/time';
import type { GameState, StatKey } from '../../core/types';

const STAT_ORDER: StatKey[] = [
  'vocal',
  'dance',
  'expression',
  'stamina',
  'stress',
  'trust',
];

export function StatsPanel({ state }: { state: GameState }) {
  const day = getDay(state.clock.absoluteMinutes);

  return (
    <aside className="panel stats-panel">
      <div className="panel-head">
        <h2>状态</h2>
        <span className="panel-note">
          第 {Math.min(day, MAX_DAYS)} 天 · {formatClock(state.clock.absoluteMinutes)}
        </span>
      </div>

      <div className="stat-list">
        {STAT_ORDER.map((key) => {
          const value = state.stats[key];
          const max = STAT_MAX[key];
          const percent = Math.max(0, Math.min(100, (value / max) * 100));
          return (
            <div className={`stat-row stat-${key}`} key={key}>
              <div className="stat-line">
                <span className="stat-name">{STAT_LABELS[key]}</span>
                <span className="stat-value">
                  {Math.round(value)}
                  {key === 'trust' ? <small> / {max}</small> : null}
                </span>
              </div>
              <div className="bar">
                <div className="bar-fill" style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="week-track" aria-label="天进度">
        {Array.from({ length: MAX_DAYS }, (_, index) => (
          <span
            key={index}
            className={`week-dot ${index < day ? 'done' : ''} ${index === day - 1 ? 'current' : ''}`}
            title={`第 ${index + 1} 天`}
          />
        ))}
      </div>

      {state.flags.forced_rest ? (
        <p className="status-alert">她需要休息。</p>
      ) : null}
    </aside>
  );
}
