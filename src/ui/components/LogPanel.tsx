import type { GameState } from '../../core/types';

export function LogPanel({ state }: { state: GameState }) {
  const entries = state.log.slice(0, 14);

  return (
    <aside className="panel log-panel">
      <div className="panel-head">
        <h2>记录</h2>
        <span className="panel-note">{state.actionsTaken} 次行动</span>
      </div>

      {entries.length === 0 ? (
        <p className="log-empty">还没有记录。</p>
      ) : (
        <ol className="log-list">
          {entries.map((entry) => (
            <li className={`log-entry log-${entry.tone}`} key={entry.id}>
              <span className="log-meta">
                第 {entry.week} 周 · {entry.slot === 0 ? '平日' : '周末'}
              </span>
              <span className="log-text">{entry.text}</span>
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
}
