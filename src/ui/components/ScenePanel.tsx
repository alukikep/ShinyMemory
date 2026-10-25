import type {
  ActionCommand,
  ActorRole,
  IdolStatKey,
  SceneView,
} from '../../core/types';
import { STAT_LABELS } from '../../core/labels';

const ACTOR_ROLE_LABEL: Record<ActorRole, string> = {
  staff: '事务员',
  president: '社长',
  idol: '偶像',
  rival: '对手',
};

const IDOL_STAT_ORDER: IdolStatKey[] = [
  'vocal',
  'dance',
  'expression',
  'trust',
];

type ScenePanelProps = {
  scene: SceneView;
  onAction: (command: ActionCommand) => void;
  onMove?: (locationId: string) => void;
  onTransit?: (routeId: string) => void;
};

export function ScenePanel({
  scene,
  onAction,
  onMove,
  onTransit,
}: ScenePanelProps) {
  return (
    <section className="panel scene-panel">
      <div className="scene-head">
        <p className="eyebrow">
          {scene.phaseLabel}
          {scene.locationName ? ` · ${scene.locationName}` : ''}
        </p>
        <h1>{scene.title}</h1>
        {scene.subtitle ? <p className="scene-subtitle">{scene.subtitle}</p> : null}
      </div>

      {scene.locations && scene.locations.length > 0 ? (
        <div className="location-tabs">
          {scene.locations.map((location) => (
            <button
              key={location.id}
              type="button"
              className={`location-tab ${location.current ? 'current' : ''}`}
              disabled={location.current}
              onClick={() => onMove?.(location.id)}
            >
              {location.name}
              {!location.current ? <small>{location.minutes} 分</small> : null}
            </button>
          ))}
        </div>
      ) : null}

      {scene.transit ? (
        <div className="transit-block">
          <div className="transit-head">
            <span>{scene.transit.label}</span>
            <small>固定车费 · 固定时间</small>
          </div>
          <div className="transit-routes">
            {scene.transit.routes.map((route) => (
              <button
                key={route.id}
                type="button"
                className="transit-route"
                disabled={route.disabled}
                title={route.disabledReason}
                onClick={() => onTransit?.(route.id)}
              >
                <span className="transit-destination">{route.toName}</span>
                <span className="transit-meta">
                  {`¥${route.fare} · ${route.minutes} 分钟`}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="blocks">
        {scene.blocks.map((block, index) => (
          <p className={`block block-${block.kind}`} key={`${scene.id}-block-${index}`}>
            {block.text}
          </p>
        ))}
      </div>

      {scene.actors && scene.actors.length > 0 ? (
        <div className="actors">
          {scene.actors.map((actor) => (
            <button
              type="button"
              className="actor-entry"
              key={actor.id}
              aria-label={`和${actor.name}${actor.entryLabel}`}
              style={
                actor.color
                  ? { borderLeft: `3px solid ${actor.color}` }
                  : undefined
              }
              onClick={() => onAction(actor.enterCommand)}
            >
              <span className="actor-entry-main">
                <span className="actor-name">{actor.name}</span>
                <span className="actor-role">
                  {ACTOR_ROLE_LABEL[actor.role]}
                </span>
              </span>
              <span className="actor-affinity">
                {actor.relationshipLabel} {actor.affinity}
              </span>
              <span className="actor-entry-action">{actor.entryLabel}</span>
              <span className="actor-entry-arrow" aria-hidden="true">
                →
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {scene.idol ? (
        <section className="actor-card npc-page">
          <div className="actor-head">
            <span className="actor-name">{scene.idol.name}</span>
            <span className="actor-role">偶像</span>
            <span className="actor-affinity">{scene.idol.unit}</span>
          </div>
          <p className="actor-description">{scene.idol.description}</p>
          <div className="idol-stat-strip">
            {IDOL_STAT_ORDER.map((key) => (
              <span className={`idol-stat idol-stat-${key}`} key={key}>
                <span>{STAT_LABELS[key]}</span>
                <strong>{scene.idol!.stats[key].rank}</strong>
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {scene.npc ? (
        <section className="actor-card npc-page">
          <div className="actor-head">
            <span className="actor-name">{scene.npc.name}</span>
            <span className="actor-role">
              {ACTOR_ROLE_LABEL[scene.npc.role]}
            </span>
            <span className="actor-affinity">
              好感 {scene.npc.affinity} / 20
            </span>
          </div>
          <p className="actor-description">{scene.npc.description}</p>
        </section>
      ) : null}

      <div className={`actions actions-${scene.layout}`}>
        {scene.actions.map((action) => (
          <button
            key={action.id}
            type="button"
            className={`action tone-${action.tone ?? 'secondary'}`}
            disabled={action.disabled}
            onClick={() => onAction(action.command)}
          >
            <span className="action-label">{action.label}</span>
            {action.hint ? <span className="action-hint">{action.hint}</span> : null}
            {action.disabled && action.disabledReason ? (
              <span className="action-reason">{action.disabledReason}</span>
            ) : null}
          </button>
        ))}
      </div>
    </section>
  );
}
