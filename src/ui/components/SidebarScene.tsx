import { CONTENT_INDEX } from '../../core/contentIndex';
import { formatClock, getDay } from '../../core/time';
import type { GameState, HeroView } from '../../core/types';
import { GameIcon } from './GameIcon';
import { HeroBackdrop } from './SceneHero';

type SidebarSceneProps = {
  state: GameState;
  hero?: HeroView;
};

export function SidebarScene({ state, hero }: SidebarSceneProps) {
  const locationId = hero?.locationId ?? state.locationId;
  const locationName =
    hero?.locationName ??
    CONTENT_INDEX.locations.get(locationId)?.name ??
    locationId;
  const day = getDay(state.clock.absoluteMinutes);

  return (
    <section
      className="sidebar-scene-block"
      aria-label={`${locationName}场景`}
    >
      <div className="sidebar-scene">
        <HeroBackdrop locationId={locationId} />
        <div className="sidebar-scene-shade" />
        <div className="sidebar-scene-content">
          <h2>{locationName}</h2>
        </div>
      </div>
      <div className="sidebar-scene-meta">
        <span className="sidebar-scene-date">
          <GameIcon name="calendar" size={11} />第 {day} 天
        </span>
        <span className="sidebar-scene-time">
          <GameIcon name="clock" size={11} />
          {formatClock(state.clock.absoluteMinutes)}
        </span>
        <span className="sidebar-scene-money">
          <GameIcon name="coin" size={11} />¥
          {state.money.toLocaleString('zh-CN')}
        </span>
      </div>
    </section>
  );
}
