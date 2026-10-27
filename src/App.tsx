import { useEffect, useState } from 'react';
import { buildScene } from './core/scene';
import { CONTENT_INDEX } from './core/contentIndex';
import { GAME_VERSION } from './save/version';
import { useGameStore } from './app/store';
import type { ActionCommand } from './core/types';
import { DebugPanel } from './ui/components/DebugPanel';
import { CityMap } from './ui/components/CityMap';
import { BackpackModal } from './ui/components/BackpackModal';
import { DialogueOverlay } from './ui/components/DialogueOverlay';
import { GameIcon } from './ui/components/GameIcon';
import { IdolRoster } from './ui/components/IdolRoster';
import { IdolSchedule } from './ui/components/IdolSchedule';
import { LogPanel } from './ui/components/LogPanel';
import { ScenePanel } from './ui/components/ScenePanel';
import { ShopModal } from './ui/components/ShopModal';
import { StatsPanel } from './ui/components/StatsPanel';

type AcceptanceBridge = {
  getState: () => ReturnType<typeof useGameStore.getState>['state'];
  dispatch: (command: ActionCommand) => void;
  jumpTo: (
    day: number,
    minuteOfDay: number,
    locationId?: string,
  ) => void;
  reset: (seed?: number) => void;
};

function formatSaveTime(value: string): string {
  return new Date(value).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function App() {
  const state = useGameStore((store) => store.state);
  const act = useGameStore((store) => store.act);
  const restart = useGameStore((store) => store.restart);
  const manualSavedAt = useGameStore((store) => store.manualSavedAt);
  const manualSave = useGameStore((store) => store.manualSave);
  const manualLoad = useGameStore((store) => store.manualLoad);
  const debugForceEvent = useGameStore((store) => store.debugForceEvent);
  const debugJumpDay = useGameStore((store) => store.debugJumpDay);
  const [rosterOpen, setRosterOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [backpackOpen, setBackpackOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | undefined>();
  const debug =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('debug');
  const scene = buildScene(state);
  const localShops = CONTENT_INDEX.shopsByLocation.get(state.locationId) ?? [];
  const shop = localShops[0];
  const sceneShop =
    shop && scene.phase === 'plan'
      ? {
          name: shop.name,
          description: shop.description,
          onOpen: () => setShopOpen(true),
        }
      : undefined;

  useEffect(() => {
    if (!debug) return;

    const bridge: AcceptanceBridge = {
      getState: () => useGameStore.getState().state,
      dispatch: (command) => useGameStore.getState().act(command),
      jumpTo: (day, minuteOfDay, locationId) =>
        useGameStore.getState().debugJumpTo(day, minuteOfDay, locationId),
      reset: (seed) => useGameStore.getState().debugReset(seed),
    };

    (window as Window & { __SHINY_MEMORY__?: AcceptanceBridge })
      .__SHINY_MEMORY__ = bridge;

    return () => {
      delete (window as Window & { __SHINY_MEMORY__?: AcceptanceBridge })
        .__SHINY_MEMORY__;
    };
  }, [debug]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const requestRestart = () => {
    if (window.confirm('重新开始这一局？')) restart();
  };

  const handleManualSave = () => {
    const savedAt = manualSave();
    setSaveNotice(`已存档 · ${formatSaveTime(savedAt)}`);
  };

  const handleManualLoad = () => {
    if (!manualSavedAt) {
      setSaveNotice('还没有手动存档。');
      return;
    }
    if (!window.confirm('读取手动存档？当前未保存的进度会被覆盖。')) {
      return;
    }
    if (manualLoad()) {
      setRosterOpen(false);
      setScheduleOpen(false);
      setBackpackOpen(false);
      setShopOpen(false);
      setSaveNotice('已读取手动存档。');
    } else {
      setSaveNotice('手动存档不可用或版本不兼容。');
    }
  };

  return (
    <div className="app-shell">
      <aside className="app-sidebar" aria-label="游戏侧边栏">
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
            aria-current={scene.phase === 'plan' ? 'page' : undefined}
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
          <button
            type="button"
            className="sidebar-nav-item"
            onClick={() => setScheduleOpen(true)}
          >
            <GameIcon name="calendar" size={17} />
            <span>日程表</span>
          </button>
          <button
            type="button"
            className="sidebar-nav-item"
            onClick={() => setBackpackOpen(true)}
          >
            <GameIcon name="bag" size={17} />
            <span>背包</span>
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

        <section className="sidebar-saves" aria-label="手动存档">
          <div className="sidebar-saves-head">
            <span>手动存档</span>
            <small>
              {manualSavedAt ? formatSaveTime(manualSavedAt) : '暂无'}
            </small>
          </div>
          <div className="sidebar-saves-actions">
            <button
              type="button"
              className="sidebar-save-button"
              onClick={handleManualSave}
            >
              <GameIcon name="save" size={15} />
              <span>存档</span>
            </button>
            <button
              type="button"
              className="sidebar-save-button"
              onClick={handleManualLoad}
              disabled={!manualSavedAt}
            >
              <GameIcon name="load" size={15} />
              <span>读档</span>
            </button>
          </div>
          {saveNotice ? (
            <p className="sidebar-save-notice" role="status">
              {saveNotice}
            </p>
          ) : null}
        </section>

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
                shopEntry={sceneShop}
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

      {state.pendingDialogueId ? (
        <DialogueOverlay
          state={state}
          onAdvance={() => act({ type: 'dialogueAdvance' })}
          onChoice={(index) => act({ type: 'dialogueChoice', index })}
        />
      ) : null}

      {rosterOpen ? (
        <IdolRoster state={state} onClose={() => setRosterOpen(false)} />
      ) : null}

      {scheduleOpen ? (
        <IdolSchedule
          state={state}
          onClose={() => setScheduleOpen(false)}
        />
      ) : null}

      {backpackOpen ? (
        <BackpackModal
          state={state}
          onClose={() => setBackpackOpen(false)}
          onGift={(itemId, idolId) =>
            act({ type: 'giveGift', itemId, idolId })
          }
        />
      ) : null}

      {shopOpen && shop ? (
        <ShopModal
          state={state}
          shopId={shop.id}
          onClose={() => setShopOpen(false)}
          onBuy={(itemId) => act({ type: 'buyItem', itemId })}
        />
      ) : null}
    </div>
  );
}
