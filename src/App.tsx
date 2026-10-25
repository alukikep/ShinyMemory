import { useState } from 'react';
import { buildScene } from './core/scene';
import { useGameStore } from './app/store';
import { DebugPanel } from './ui/components/DebugPanel';
import { CityMap } from './ui/components/CityMap';
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

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand-block">
          <p className="brand">ShinyMemory</p>
          <p className="tagline">开放时间原型</p>
        </div>
        <div className="topbar-meta">
          <button
            type="button"
            className="ghost-button"
            onClick={() => {
              if (window.confirm('重新开始这一局？')) restart();
            }}
          >
            重开
          </button>
        </div>
      </header>

      <main className="layout">
        <StatsPanel
          state={state}
          hero={scene.hero}
          onOpenRoster={() => setRosterOpen(true)}
        />
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
              onTransit={(routeId) => act({ type: 'transit', routeId })}
            />
          ) : null}
        </div>
        <LogPanel state={state} />
      </main>

      {rosterOpen ? (
        <IdolRoster state={state} onClose={() => setRosterOpen(false)} />
      ) : null}

      {debug ? (
        <DebugPanel
          state={state}
          onForceEvent={debugForceEvent}
          onJumpDay={debugJumpDay}
        />
      ) : null}

      <footer className="footer">
        数据驱动原型 · 活动、事件、结局都来自内容数据，UI 不写死任何节点
      </footer>
    </div>
  );
}
