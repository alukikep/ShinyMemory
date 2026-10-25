import { useState } from 'react';
import { buildScene } from './core/scene';
import { GAME_VERSION } from './save/version';
import { useGameStore } from './app/store';
import { DebugPanel } from './ui/components/DebugPanel';
import { CityMap } from './ui/components/CityMap';
import { GameIcon } from './ui/components/GameIcon';
import { IdolRoster } from './ui/components/IdolRoster';
import { LogPanel } from './ui/components/LogPanel';
import { ScenePanel } from './ui/components/ScenePanel';
import { StatsPanel } from './ui/components/StatsPanel';

export default function App() {
  const state = useGameStore((store) => store.state);
  const act = useGameStore((store) => store.act);
  const restart = useGameStore((store) => store.restart);
  const debugForceEvent = useGameStore((store) => store.debugForceEvent);
  const debugJumpDay = useGameStore((store) => store.debugJumpDay);
  const [rosterOpen, setRosterOpen] = useState(false);
  const debug =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('debug');
  const scene = buildScene(state);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const requestRestart = () => {
    if (window.confirm('重新开始这一局？')) restart();
  };

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <div>
            <p className="brand">ShinyMemory</p>
            <p className="tagline">开放时间原型</p>
          </div>
          <button
            type="button"
            className="mobile-restart"
            onClick={requestRestart}
          >
            重开
          </button>
        </div>

        <div className="sidebar-scroll">
          <StatsPanel state={state} hero={scene.hero} />
        </div>

        <nav className="sidebar-nav" aria-label="主导航">
          <button
            type="button"
            className={`sidebar-nav-item ${scene.phase === 'plan' ? 'active' : ''}`}
            onClick={() => scrollTo('scene-panel')}
          >
            <GameIcon name="home" size={17} />
            <span>当前安排</span>
          </button>
          <button
            type="button"
            className="sidebar-nav-item"
            onClick={() => setRosterOpen(true)}
          >
            <GameIcon name="people" size={17} />
            <span>偶像名册</span>
          </button>
          {scene.phase === 'plan' ? (
            <button
              type="button"
              className="sidebar-nav-item"
              onClick={() => scrollTo('city-map')}
            >
              <GameIcon name="map" size={17} />
              <span>地点地图</span>
            </button>
          ) : null}
        </nav>

        <div className="sidebar-footer">
          <span>同人原型 · 非官方</span>
          <span>v{GAME_VERSION}</span>
        </div>
      </aside>

      <div className="workspace">
        <div className="workspace-inner">
          <header className="topbar">
            <div className="breadcrumb">
              <span>{scene.locationName ?? '283 Production'}</span>
              <GameIcon name="chevron" size={11} />
              <strong>{scene.phaseLabel}</strong>
            </div>
            <button
              type="button"
              className="ghost-button"
              onClick={requestRestart}
            >
              重开
            </button>
          </header>

          <main className="layout">
            <div className="center-column">
              <ScenePanel
                scene={scene}
                onAction={act}
                onMove={(locationId) => act({ type: 'move', locationId })}
              />
              {scene.phase === 'plan' ? (
                <CityMap
                  state={state}
                  onMove={(locationId) => act({ type: 'move', locationId })}
                  onTransit={(routeId) =>
                    act({ type: 'transit', routeId })
                  }
                />
              ) : null}
            </div>
            <LogPanel state={state} />
          </main>

          {debug ? (
            <DebugPanel
              state={state}
              onForceEvent={debugForceEvent}
              onJumpDay={debugJumpDay}
            />
          ) : null}
        </div>
      </div>

      {rosterOpen ? (
        <IdolRoster state={state} onClose={() => setRosterOpen(false)} />
      ) : null}
    </div>
  );
}
