import type { CSSProperties } from 'react';
import { CONTENT_INDEX } from '../../core/contentIndex';
import { getSelectedIdol, isSelectedIdolRecruited, maxStamina } from '../../core/sim';
import { STAT_LABELS, STAT_MAX } from '../../core/labels';
import type {
  GameState,
  HeroView,
  IdolAttribute,
  IdolStatKey,
  SharedStatKey,
} from '../../core/types';
import { GameIcon } from './GameIcon';
import { SidebarScene } from './SidebarScene';

const SHARED_ORDER: SharedStatKey[] = ['stamina', 'stress'];
const IDOL_ORDER: IdolStatKey[] = ['vocal', 'dance', 'expression', 'trust'];
const SHARED_ICONS: Record<SharedStatKey, string> = {
  stamina: 'bolt',
  stress: 'heart',
};
const IDOL_ICONS: Record<IdolStatKey, string> = {
  vocal: 'mic',
  dance: 'music',
  expression: 'sparkle',
  trust: 'heart',
};

function StatRow({
  statKey,
  value,
  max,
}: {
  statKey: SharedStatKey;
  value: number;
  max: number;
}) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div className={`stat-row stat-${statKey}`}>
      <div className="stat-line">
        <span className="stat-name">
          <GameIcon name={SHARED_ICONS[statKey]} size={12} />
          {STAT_LABELS[statKey]}
        </span>
        <span className="stat-value">
          {Math.round(value)}
          <small> / {max}</small>
        </span>
      </div>
      <div className="bar">
        <div className="bar-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function RankChip({
  statKey,
  attribute,
}: {
  statKey: IdolStatKey;
  attribute: IdolAttribute;
}) {
  const max = attribute.rank === attribute.maxRank;
  const label = STAT_LABELS[statKey];

  return (
    <div
      className={`rank-chip stat-${statKey}`}
      title={`${label} ${attribute.rank}${max ? ' MAX' : ` · ${attribute.exp}`}`}
    >
      <span className="stat-name rank-chip-name">
        <GameIcon name={IDOL_ICONS[statKey]} size={11} />
        {label}
      </span>
      <strong>
        {attribute.rank}
        {max ? <small>MAX</small> : null}
      </strong>
    </div>
  );
}

export function StatsPanel({
  state,
  hero,
}: {
  state: GameState;
  hero?: HeroView;
}) {
  const recruited = isSelectedIdolRecruited(state);
  const idol = recruited ? getSelectedIdol(state) : undefined;
  const idolDef = recruited
    ? CONTENT_INDEX.idols.get(state.selectedIdolId)
    : undefined;

  return (
    <div className="panel stats-panel">
      <SidebarScene state={state} hero={hero} />

      <div className="panel-head">
        <h2>状态</h2>
      </div>

      <p className="stat-group-label">共享状态</p>
      <div className="stat-list shared-stat-list">
        {SHARED_ORDER.map((key) => (
          <StatRow
            key={key}
            statKey={key}
            value={state.shared[key]}
            max={key === 'stamina' ? maxStamina(state) : STAT_MAX[key]}
          />
        ))}
      </div>

      {recruited && idol ? (
        <>
          <div
            className="idol-summary"
            style={
              {
                '--idol-color': idolDef?.color ?? 'var(--brand)',
              } as CSSProperties
            }
          >
            <div className="idol-summary-avatar">
              {idolDef?.avatar ? (
                <img src={idolDef.avatar} alt={`${idolDef.name}Q版头像`} />
              ) : (
                <span>{idolDef?.name.slice(0, 1) ?? '?'}</span>
              )}
            </div>
            <div className="idol-summary-copy">
              <span className="idol-summary-name">
                {idolDef?.name ?? state.selectedIdolId}
              </span>
              <span className="idol-summary-unit">{idolDef?.unit ?? ''}</span>
            </div>
          </div>
          <div className="idol-rank-chips">
            {IDOL_ORDER.map((key) => (
              <RankChip key={key} statKey={key} attribute={idol.stats[key]} />
            ))}
          </div>
        </>
      ) : (
        <div className="idol-empty">
          <p>还没有正式出道的偶像。</p>
        </div>
      )}

      {state.flags.forced_rest ? (
        <p className="status-alert">她需要休息。</p>
      ) : null}
    </div>
  );
}
