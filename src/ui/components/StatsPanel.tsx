import { CONTENT_INDEX } from '../../core/contentIndex';
import { getActiveIdol } from '../../core/sim';
import { STAT_LABELS, STAT_MAX } from '../../core/labels';
import { formatClock, getDay } from '../../core/time';
import type { GameState, IdolStatKey, SharedStatKey } from '../../core/types';

const SHARED_ORDER: SharedStatKey[] = ['stamina', 'stress'];
const IDOL_ORDER: IdolStatKey[] = ['vocal', 'dance', 'expression', 'trust'];

function StatRow({
  statKey,
  value,
}: {
  statKey: SharedStatKey | IdolStatKey;
  value: number;
}) {
  const max = STAT_MAX[statKey];
  const percent = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div className={`stat-row stat-${statKey}`}>
      <div className="stat-line">
        <span className="stat-name">{STAT_LABELS[statKey]}</span>
        <span className="stat-value">
          {Math.round(value)}
          {statKey === 'trust' ? <small> / {max}</small> : null}
        </span>
      </div>
      <div className="bar">
        <div className="bar-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export function StatsPanel({
  state,
  onOpenRoster,
}: {
  state: GameState;
  onOpenRoster: () => void;
}) {
  const day = getDay(state.clock.absoluteMinutes);
  const idol = getActiveIdol(state);
  const idolDef = CONTENT_INDEX.idols.get(state.activeIdolId);

  return (
    <aside className="panel stats-panel">
      <div className="panel-head">
        <h2>状态</h2>
        <span className="panel-note">
          第 {day} 天 · {formatClock(state.clock.absoluteMinutes)}
        </span>
      </div>

      <p className="stat-group-label">共享状态</p>
      <div className="stat-list">
        {SHARED_ORDER.map((key) => (
          <StatRow key={key} statKey={key} value={state.shared[key]} />
        ))}
      </div>

      <div className="idol-summary">
        <span className="idol-summary-name">{idolDef?.name ?? state.activeIdolId}</span>
        <span className="idol-summary-unit">{idolDef?.unit ?? ''}</span>
      </div>
      <div className="stat-list">
        {IDOL_ORDER.map((key) => (
          <StatRow key={key} statKey={key} value={idol.stats[key]} />
        ))}
      </div>

      <button
        type="button"
        className="roster-button"
        onClick={onOpenRoster}
      >
        <span>偶像名册</span>
        <span aria-hidden="true">→</span>
      </button>

      {state.flags.forced_rest ? (
        <p className="status-alert">她需要休息。</p>
      ) : null}
    </aside>
  );
}
