import { formatClock } from '../../core/time';
import type { GameState } from '../../core/types';

export function LogPanel({ state }: { state: GameState }) {
  const entries = state.log.slice(0, 14);

  return (
    <aside className="panel log-panel">
      <div className="panel-head">
        <h2>记录</h2>
      </div>

      {entries.length === 0 ? (
        <p className="log-empty">还没有记录。</p>
      ) : (
        <ol className="log-list">
          {entries.map((entry) => (
            <li className={`log-entry log-${entry.tone}`} key={entry.id}>
              <span className="log-meta">
                第 {entry.day} 天 · {formatClock(entry.minuteOfDay)}
              </span>
              <span className="log-text">{entry.text}</span>
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
}
