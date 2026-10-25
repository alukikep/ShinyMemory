import { CONTENT_INDEX } from '../../core/contentIndex';
import { WALK_EDGES, neighborsOf } from '../../core/content/map';
import type { GameState } from '../../core/types';

type CityMapProps = {
  state: GameState;
  onMove: (locationId: string) => void;
};

export function CityMap({ state, onMove }: CityMapProps) {
  const current = state.locationId;
  const adjacent = new Map(
    neighborsOf(current).map((edge) => [
      edge.from === current ? edge.to : edge.from,
      edge.minutes,
    ]),
  );
  const locations = [...CONTENT_INDEX.locations.values()];
  const currentLocation = CONTENT_INDEX.locations.get(current);

  const moveTo = (locationId: string) => {
    if (!adjacent.has(locationId)) return;
    onMove(locationId);
  };

  return (
    <section className="panel map-panel city-map-panel">
      <div className="map-head">
        <div>
          <p className="eyebrow">CITY MAP</p>
          <h2>城市地图</h2>
          <p className="map-current">
            当前：{currentLocation?.name ?? current}
          </p>
        </div>
      </div>

      <div className="map-canvas">
        <svg
          viewBox="0 40 500 200"
          className="map-svg"
          role="img"
          aria-label="地点与步行路线"
        >
          {WALK_EDGES.map((edge) => {
            const from = CONTENT_INDEX.locations.get(edge.from);
            const to = CONTENT_INDEX.locations.get(edge.to);
            if (
              from?.mapX === undefined ||
              from.mapY === undefined ||
              to?.mapX === undefined ||
              to.mapY === undefined
            ) {
              return null;
            }
            const active = edge.from === current || edge.to === current;
            return (
              <g key={`${edge.from}-${edge.to}`}>
                <line
                  x1={from.mapX}
                  y1={from.mapY}
                  x2={to.mapX}
                  y2={to.mapY}
                  className={active ? 'map-edge active' : 'map-edge'}
                />
                <text
                  x={(from.mapX + to.mapX) / 2}
                  y={(from.mapY + to.mapY) / 2 - 5}
                  className="map-edge-label"
                >
                  {edge.minutes} 分
                </text>
              </g>
            );
          })}

          {locations.map((location) => {
            if (
              location.mapX === undefined ||
              location.mapY === undefined
            ) {
              return null;
            }
            const isCurrent = location.id === current;
            const isAdjacent = adjacent.has(location.id);
            const className = [
              'map-node',
              isCurrent ? 'current' : isAdjacent ? 'adjacent' : 'locked',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <g
                key={location.id}
                className={className}
                role="button"
                tabIndex={isAdjacent ? 0 : -1}
                aria-label={
                  isAdjacent
                    ? `前往${location.name}，${adjacent.get(location.id)} 分钟`
                    : location.name
                }
                aria-disabled={!isAdjacent}
                onClick={() => moveTo(location.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    moveTo(location.id);
                  }
                }}
              >
                <rect
                  x={location.mapX - 50}
                  y={location.mapY - 21}
                  width={100}
                  height={42}
                  rx={10}
                />
                <text
                  x={location.mapX}
                  y={location.mapY + 4}
                  className="map-node-name"
                  textAnchor="middle"
                >
                  {location.name}
                </text>
                <title>
                  {location.name}
                  {isAdjacent
                    ? ` · 步行 ${adjacent.get(location.id)} 分钟`
                    : isCurrent
                      ? ' · 当前地点'
                      : ''}
                </title>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="map-legend">
        <span><i className="map-dot current" /> 当前</span>
        <span><i className="map-dot adjacent" /> 可步行</span>
        <span><i className="map-dot locked" /> 不相邻</span>
      </div>

      <div className="map-neighbors">
        {[...adjacent.entries()].map(([id, minutes]) => (
          <button
            key={id}
            type="button"
            className="map-neighbor"
            onClick={() => moveTo(id)}
          >
            <span>前往{CONTENT_INDEX.locations.get(id)?.name ?? id}</span>
            <small>{`${minutes} 分钟`}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
