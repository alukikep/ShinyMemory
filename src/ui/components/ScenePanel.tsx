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
          {scene.locations.map((location) => (
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
