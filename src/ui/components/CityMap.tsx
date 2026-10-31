import { useEffect, useState } from 'react';
import { CONTENT_INDEX } from '../../core/contentIndex';
import { neighborsOf } from '../../core/content/map';
import { parentAreaId, visibleLocations } from '../../core/areas';
import { locationHints } from '../../core/storyHints';
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
  ekimae: 'train',
  studio_district: 'music',
  seaside: 'tree',
  university: 'book',
};

type CityMapProps = {
  state: GameState;
  onMove: (locationId: string) => void;
  onTransit: (routeId: string) => void;
};

export function CityMap({ state, onMove, onTransit }: CityMapProps) {
  const [transitKind, setTransitKind] = useState<'bus' | null>(null);
  const transitDialogRef = useDialogFocus<HTMLElement>(transitKind !== null);
  const current = state.locationId;
  // 地图画的是入口与独立地点；站在楼里时，以它所属的入口为"当前"。
  const currentAreaId = parentAreaId(current) ?? current;
  const adjacent = new Map(
    neighborsOf(CONTENT_INDEX.walkEdges, currentAreaId)
      .filter((edge) => edge.minutes > 0)
      .map((edge) => [
        edge.from === currentAreaId ? edge.to : edge.from,
        edge.minutes,
      ]),
  );
  const locations = visibleLocations();
  // 还没遇见的卡面章：一个地点一个标记（不列标题、不剧透）
  const hints = new Map(
    locationHints(state).map((hint) => [
      parentAreaId(hint.locationId) ?? hint.locationId,
      hint,
    ]),
  );
  const currentLocation = CONTENT_INDEX.locations.get(currentAreaId);
  const routesHere = CONTENT_INDEX.transitRoutesByLocation.get(current) ?? [];
  const busRoutes = routesHere.filter((route) => route.kind === 'bus');
  const activeRoutes = transitKind === 'bus' ? busRoutes : [];
  const transitLabel = '公共交通';

  useEffect(() => {
    if (!transitKind) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setTransitKind(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [transitKind]);

  if (state.phase !== 'plan') return null;
  // 站在楼里（入口的成员）时隐藏地图：地图只能点入口，留着容易让人以为点了没反应。
  if (parentAreaId(current)) return null;

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
              公共交通
              <small>{`${busRoutes.length} 个目的地`}</small>
            </button>
          ) : null}
        </div>
      </div>

      <div className="map-canvas">
        <svg
          viewBox="0 10 560 250"
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
          <rect x="0" y="10" width="560" height="250" fill="#f7fbfe" />
          <rect
            x="0"
            y="10"
            width="560"
            height="250"
            fill="url(#map-dot-grid)"
          />
          <g className="map-blocks">
            <rect x="128" y="18" width="28" height="14" rx="3" />
            <rect x="356" y="18" width="30" height="14" rx="3" />
            <rect x="128" y="150" width="30" height="14" rx="3" />
            <rect x="356" y="150" width="30" height="14" rx="3" />
            <rect x="430" y="200" width="26" height="14" rx="3" />
          </g>
          <g className="map-parks">
            <ellipse cx="470" cy="32" rx="16" ry="10" />
            <ellipse cx="520" cy="190" rx="18" ry="11" />
          </g>
          <text x="22" y="252" className="map-area-label">
            283 PRODUCTION · ACTIVITY AREA
          </text>
          <text x="530" y="27" className="map-north-label">
            N ↑
          </text>

          {CONTENT_INDEX.walkEdges.map((edge) => {
            const from = CONTENT_INDEX.locations.get(edge.from);
            const to = CONTENT_INDEX.locations.get(edge.to);
            // 只画地图上画得出的节点之间的边（进楼边不画）。
            if (!locations.some((entry) => entry.id === edge.from) ||
                !locations.some((entry) => entry.id === edge.to)) {
              return null;
            }
            if (
              from?.mapX === undefined ||
              from.mapY === undefined ||
              to?.mapX === undefined ||
              to.mapY === undefined
            ) {
              return null;
            }
            const active =
              edge.from === currentAreaId || edge.to === currentAreaId;
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
            const isCurrent = location.id === currentAreaId;
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
                {hints.has(location.id) ? (
                  <g
                    className={
                      hints.get(location.id)!.inWindowCount > 0
                        ? 'map-node-hint on'
                        : 'map-node-hint off'
                    }
                    pointerEvents="none"
                  >
                    <circle
                      cx={location.mapX + 38}
                      cy={location.mapY - 12}
                      r={8}
                    />
                    <text
                      x={location.mapX + 38}
                      y={location.mapY - 9}
                      textAnchor="middle"
                    >
                      {hints.get(location.id)!.count}
                    </text>
                  </g>
                ) : null}
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
                  {hints.has(location.id)
                    ? ` · 有 ${hints.get(location.id)!.count} 段还没遇见的剧情`
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
                <p className="eyebrow">TRANSIT</p>
                <h2>{transitLabel}</h2>
                <p className="transit-dialog-note">
                  {`从${currentLocation?.name ?? current}出发 · 5 分钟 · 固定车费`}
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
                      <GameIcon name="bus" size={18} />
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
