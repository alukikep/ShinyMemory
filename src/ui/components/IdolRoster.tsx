import { useEffect } from 'react';
import type { CSSProperties } from 'react';
import { useDialogFocus } from '../hooks/useDialogFocus';
import { CONTENT_INDEX } from '../../core/contentIndex';
import { RANK_CURVE } from '../../core/growth';
import { getActorLocation } from '../../core/sim';
import { STAT_LABELS } from '../../core/labels';
import type {
  GameState,
  IdolAttribute,
  IdolStatKey,
} from '../../core/types';

const IDOL_STAT_ORDER: IdolStatKey[] = [
  'vocal',
  'dance',
  'expression',
  'trust',
];

function RankRow({
  statKey,
  attribute,
}: {
  statKey: IdolStatKey;
  attribute: IdolAttribute;
}) {
  const max = attribute.rank === attribute.maxRank;
  const needed = RANK_CURVE[attribute.rank];
  const percent = max
    ? 100
    : Math.max(0, Math.min(100, (attribute.exp / needed) * 100));

  return (
    <div className={`stat-row stat-${statKey}`}>
      <div className="stat-line">
        <span className="stat-name">{STAT_LABELS[statKey]}</span>
        <span className="stat-value">
          {attribute.rank}
          {max ? (
            <small> / MAX</small>
          ) : (
            <small> · {attribute.exp} / {needed}</small>
          )}
        </span>
      </div>
      <div className="bar">
        <div className="bar-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

type IdolRosterProps = {
  state: GameState;
  onClose: () => void;
};

export function IdolRoster({ state, onClose }: IdolRosterProps) {
  const dialogRef = useDialogFocus<HTMLElement>();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const idols = Object.values(state.idols).filter(
    (idol) => idol.status !== 'unknown',
  );

  return (
    <div
      className="roster-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="roster-panel"
        role="dialog"
        aria-modal="true"
        aria-label="偶像名册"
        ref={dialogRef}
        tabIndex={-1}
      >
        <header className="roster-head">
          <div>
            <p className="eyebrow">IDOL ROSTER</p>
            <h2>偶像名册</h2>
          </div>
          <button
            type="button"
            className="roster-close"
            onClick={onClose}
            aria-label="关闭偶像名册"
          >
            关闭
          </button>
        </header>

        <div className="roster-shared">
          <span>共享体力 {Math.round(state.shared.stamina)}</span>
          <span>共享压力 {Math.round(state.shared.stress)}</span>
        </div>

        <div className="roster-grid">
          {idols.map((idol) => {
            const def = CONTENT_INDEX.idols.get(idol.id);
            const recruited = idol.status === 'recruited';
            const active = recruited && idol.id === state.activeIdolId;
            const actor = recruited ? CONTENT_INDEX.actors.get(idol.id) : undefined;
            const actorState = state.actors[idol.id];
            const locationId = actor
              ? getActorLocation(
                  actor,
                  state.clock.absoluteMinutes,
                  actorState?.scheduleOverrides,
                )
              : undefined;
            const location = locationId
              ? CONTENT_INDEX.locations.get(locationId)
              : undefined;
            const here = locationId === state.locationId;
            const locationLabel = locationId
              ? location?.name ?? locationId
              : '自由活动';
            return (
              <article
                className={`roster-card ${active ? 'current' : ''} ${recruited ? '' : 'known'}`}
                key={idol.id}
                style={
                  {
                    '--idol-color': def?.color ?? 'var(--brand)',
                  } as CSSProperties
                }
              >
                <div className="roster-avatar">
                  {def?.avatar ? (
                    <img src={def.avatar} alt={`${def.name}Q版头像`} />
                  ) : (
                    <span>{def?.name.slice(0, 1) ?? '?'}</span>
                  )}
                </div>
                <div className="roster-card-main">
                  <div className="roster-card-head">
                    <div>
                      <h3>{def?.name ?? idol.id}</h3>
                      <p>{def?.unit ?? ''}</p>
                    </div>
                    {active ? <span className="roster-current">当前</span> : null}
                  </div>
                  {def?.profile ? (
                    <p className="roster-profile">{def.profile}</p>
                  ) : null}
                  {recruited ? (
                    <p className={`roster-location ${here ? 'here' : ''}`}>
                      {here ? '在这里' : `现在：${locationLabel}`}
                    </p>
                  ) : (
                    <p className="roster-location roster-unrecruited">
                      尚未招募
                    </p>
                  )}
                </div>
                {recruited ? (
                  <div className="roster-stats">
                    {IDOL_STAT_ORDER.map((key) => (
                      <RankRow
                        key={key}
                        statKey={key}
                        attribute={idol.stats[key]}
                      />
                    ))}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
