import type { SceneView } from '../../core/types';

type ScenePanelProps = {
  scene: SceneView;
  onAction: (actionId: string) => void;
  onMove?: (locationId: string) => void;
};

export function ScenePanel({ scene, onAction, onMove }: ScenePanelProps) {
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
          {scene.locations
            .filter((location) => location.current || location.open)
            .map((location) => (
            <button
              key={location.id}
              type="button"
              className={`location-tab ${location.current ? 'current' : ''}`}
              disabled={location.current}
              onClick={() => onMove?.(location.id)}
            >
              {location.name}
            </button>
          ))}
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
            <section className="actor-card" key={actor.id}>
              <div className="actor-head">
                <span className="actor-name">{actor.name}</span>
                <span className="actor-role">
                  {actor.role === 'staff'
                    ? '事务员'
                    : actor.role === 'idol'
                      ? '偶像'
                      : '对手'}
                </span>
                <span className="actor-affinity">好感 {actor.affinity} / 20</span>
              </div>
              <p className="actor-description">{actor.description}</p>
              <div className="actor-topics">
                <button
                  type="button"
                  className="actor-topic"
                  onClick={() => onAction(actor.enterActionId)}
                >
                  交谈
                </button>
              </div>
            </section>
          ))}
        </div>
      ) : null}

      {scene.npc ? (
        <section className="actor-card npc-page">
          <div className="actor-head">
            <span className="actor-name">{scene.npc.name}</span>
            <span className="actor-role">
              {scene.npc.role === 'staff'
                ? '事务员'
                : scene.npc.role === 'idol'
                  ? '偶像'
                  : '对手'}
            </span>
            <span className="actor-affinity">
              好感 {scene.npc.affinity} / 20
            </span>
          </div>
          <p className="actor-description">{scene.npc.description}</p>
          <div className="actor-topics">
            {scene.npc.topics.map((topic) => (
              <button
                key={topic.id}
                type="button"
                className="actor-topic"
                disabled={topic.disabled}
                onClick={() => onAction(topic.id)}
              >
                <span>{topic.label}</span>
                {topic.disabled && topic.disabledReason ? (
                  <small>{topic.disabledReason}</small>
                ) : null}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="actor-leave"
            onClick={() => onAction(scene.npc!.leaveActionId)}
          >
            离开
          </button>
        </section>
      ) : null}

      <div className={`actions actions-${scene.layout}`}>
        {scene.actions.map((action) => (
          <button
            key={action.id}
            type="button"
            className={`action tone-${action.tone ?? 'secondary'}`}
            disabled={action.disabled}
            onClick={() => onAction(action.id)}
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
