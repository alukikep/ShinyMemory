import { useEffect, useState } from 'react';
import { CONTENT_INDEX } from '../../core/contentIndex';
import { WALK_EDGES, neighborsOf } from '../../core/content/map';
import type { GameState } from '../../core/types';
import { useDialogFocus } from '../hooks/useDialogFocus';
import { GameIcon, getIconPaths } from './GameIcon';

const LOCATION_ICONS: Record<string, string> = {
  home: 'home',
  station: 'train',
  office: 'building',
  practice_room: 'music',
  studio: 'mic',
  park: 'tree',
  shopping_street: 'bag',
};

type CityMapProps = {
  state: GameState;
  onMove: (locationId: string) => void;
  onTransit: (routeId: string) => void;
};

export function CityMap({ state, onMove, onTransit }: CityMapProps) {
  const [transitKind, setTransitKind] = useState<'bus' | 'taxi' | null>(null);
  const transitDialogRef = useDialogFocus<HTMLElement>(transitKind !== null);
  const current = state.locationId;
  const adjacent = new Map(
    neighborsOf(current).map((edge) => [
      edge.from === current ? edge.to : edge.from,
      edge.minutes,
    ]),
  );
  const locations = [...CONTENT_INDEX.locations.values()];
  const currentLocation = CONTENT_INDEX.locations.get(current);
  const routesHere = CONTENT_INDEX.transitRoutesByLocation.get(current) ?? [];
  const busRoutes = routesHere.filter((route) => route.kind === 'bus');
  const taxiRoutes = routesHere.filter((route) => route.kind === 'taxi');
  const activeRoutes =
    transitKind === 'bus'
      ? busRoutes
      : transitKind === 'taxi'
        ? taxiRoutes
        : [];
  const transitLabel = transitKind === 'taxi' ? '出租车' : '公交';

  useEffect(() => {
    if (!transitKind) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setTransitKind(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [transitKind]);

  if (state.phase !== 'plan') return null;

  const moveTo = (locationId: string) => {
    if (!adjacent.has(locationId)) return;
    onMove(locationId);
  };

  const ride = (routeId: string) => {
    const route = activeRoutes.find((entry) => entry.id === routeId);
    if (!route || state.money < route.fare) return;
    onTransit(routeId);
    setTransitKind(null);
  };

  return (
    <section className="panel map-panel city-map-panel" id="city-map">
      <div className="map-head">
        <div>
          <p className="eyebrow">CITY MAP</p>
          <h2>城市地图</h2>
          <p className="map-current">
            当前：{currentLocation?.name ?? current}
          </p>
        </div>
        <div className="map-transit-actions">
          {busRoutes.length > 0 ? (
            <button
              type="button"
              className="map-transit-trigger"
              onClick={() => setTransitKind('bus')}
            >
              <GameIcon name="bus" size={14} />
              公交
              <small>{`${busRoutes.length} 条线路`}</small>
            </button>
          ) : null}
          {taxiRoutes.length > 0 ? (
            <button
              type="button"
              className="map-transit-trigger taxi"
              onClick={() => setTransitKind('taxi')}
            >
              <GameIcon name="taxi" size={14} />
              出租车
              <small>{`${taxiRoutes.length} 个目的地`}</small>
            </button>
          ) : null}
        </div>
      </div>

      <div className="map-canvas">
        <svg
          viewBox="0 25 500 320"
          className="map-svg"
          role="img"
          aria-label="地点与步行路线"
        >
          <defs>
            <pattern
              id="map-dot-grid"
              width="18"
              height="18"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r="1" fill="#c9dfea" opacity=".72" />
            </pattern>
          </defs>
          <rect x="0" y="25" width="500" height="320" fill="#f7fbfe" />
          <rect
            x="0"
            y="25"
            width="500"
            height="320"
            fill="url(#map-dot-grid)"
          />
          <g className="map-blocks">
            <rect x="28" y="46" width="70" height="30" rx="4" />
            <rect x="334" y="46" width="78" height="30" rx="4" />
            <rect x="30" y="210" width="58" height="25" rx="4" />
            <rect x="326" y="215" width="84" height="20" rx="4" />
            <rect x="330" y="300" width="90" height="26" rx="4" />
            <rect x="42" y="320" width="60" height="18" rx="4" />
          </g>
          <g className="map-parks">
            <ellipse cx="452" cy="76" rx="25" ry="18" />
            <ellipse cx="438" cy="216" rx="21" ry="14" />
            <ellipse cx="58" cy="116" rx="18" ry="13" />
            <ellipse cx="450" cy="330" rx="22" ry="12" />
          </g>
          <text x="26" y="340" className="map-area-label">
            283 PRODUCTION · ACTIVITY AREA
          </text>
          <text x="468" y="49" className="map-north-label">
            N ↑
          </text>

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
                <g
                  className="map-node-icon"
                  transform={`translate(${location.mapX - 41} ${location.mapY - 9}) scale(0.72)`}
                >
                  {getIconPaths(
                    LOCATION_ICONS[location.id] ?? 'compass',
                  ).map((path, index) => (
                    <path key={index} d={path} />
                  ))}
                </g>
                <text
                  x={location.mapX + 8}
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

      {transitKind ? (
        <div
          className="transit-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setTransitKind(null);
          }}
        >
          <section
            className="transit-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={transitLabel}
            ref={transitDialogRef}
            tabIndex={-1}
          >
            <header className="transit-dialog-head">
              <div>
                <p className="eyebrow">
                  {transitKind === 'taxi' ? 'TAXI' : 'BUS'}
                </p>
                <h2>{transitLabel}</h2>
                <p className="transit-dialog-note">
                  {transitKind === 'taxi'
                    ? '全城直达 · 固定车费'
                    : `从${currentLocation?.name ?? current}出发 · 固定车费`}
                </p>
              </div>
              <button
                type="button"
                className="transit-close"
                onClick={() => setTransitKind(null)}
                aria-label={`关闭${transitLabel}`}
              >
                关闭
              </button>
            </header>

            <div className="transit-list">
              {activeRoutes.map((route) => {
                const destination = CONTENT_INDEX.locations.get(route.to);
                const disabled = state.money < route.fare;
                return (
                  <button
                    key={route.id}
                    type="button"
                    className="transit-row"
                    disabled={disabled}
                    onClick={() => ride(route.id)}
                  >
                    <span className="transit-row-icon">
                      <GameIcon
                        name={transitKind === 'taxi' ? 'taxi' : 'bus'}
                        size={18}
                      />
                    </span>
                    <span className="transit-row-main">
                      <span className="transit-destination">
                        {destination?.name ?? route.label}
                      </span>
                      <span className="transit-row-meta">
                        {`¥${route.fare} · ${route.minutes} 分钟`}
                      </span>
                    </span>
                    <span className="transit-row-action">
                      {disabled ? '金钱不足' : '乘车 →'}
                    </span>
                  </button>
                );
              })}
            </div>

            <footer className="transit-dialog-foot">
              <span>
                <GameIcon name="coin" size={12} />现金 ¥
                {state.money.toLocaleString('zh-CN')}
              </span>
              <span>固定票价 · 不按距离计费</span>
            </footer>
          </section>
        </div>
      ) : null}
    </section>
  );
}
