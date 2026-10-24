import { buildScene } from './core/scene';
import { MAX_WEEKS, TOTAL_ACTIONS } from './core/config';
import { useGameStore } from './app/store';
import { DebugPanel } from './ui/components/DebugPanel';
import { LogPanel } from './ui/components/LogPanel';
import { ScenePanel } from './ui/components/ScenePanel';
import { StatsPanel } from './ui/components/StatsPanel';

export default function App() {
  const state = useGameStore((store) => store.state);
  const act = useGameStore((store) => store.act);
  const restart = useGameStore((store) => store.restart);
  const debugForceEvent = useGameStore((store) => store.debugForceEvent);
  const debugJumpWeek = useGameStore((store) => store.debugJumpWeek);
  const debug =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('debug');
  const scene = buildScene(state);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand-block">
          <p className="brand">ShinyMemory</p>
          <p className="tagline">12 周养成原型</p>
        </div>
        <div className="topbar-meta">
          <div className="meta-item">
            <span>周</span>
            <strong>{Math.min(state.week, MAX_WEEKS)} / {MAX_WEEKS}</strong>
          </div>
          <div className="meta-item">
            <span>金钱</span>
            <strong>¥{state.money.toLocaleString('zh-CN')}</strong>
          </div>
          <div className="meta-item">
            <span>行动</span>
            <strong>{state.actionsTaken} / {TOTAL_ACTIONS}</strong>
          </div>
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
        <StatsPanel state={state} />
        <ScenePanel
          scene={scene}
          onAction={act}
          onMove={(locationId) => act(`move:${locationId}`)}
        />
        <LogPanel state={state} />
      </main>

      {debug ? (
        <DebugPanel
          state={state}
          onForceEvent={debugForceEvent}
          onJumpWeek={debugJumpWeek}
        />
      ) : null}

      <footer className="footer">
        数据驱动原型 · 活动、事件、结局都来自内容数据，UI 不写死任何节点
      </footer>
    </div>
  );
}
