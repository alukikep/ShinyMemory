import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import App from '../App';
import { buildScene } from '../core/scene';
import { advanceTime, enterNpc, handleCommand, moveTo, newGame, travelTo } from '../core/sim';
import { DebugPanel } from './components/DebugPanel';
import { DialogueOverlay } from './components/DialogueOverlay';
import { IdolRoster } from './components/IdolRoster';
import { IdolSchedule } from './components/IdolSchedule';
import { CityMap } from './components/CityMap';
import { ScenePanel } from './components/ScenePanel';
import { StatsPanel } from './components/StatsPanel';

describe('app shell', () => {
  it('renders the first day without crashing', () => {
    const html = renderToString(<App />);
    expect(html).toContain('ShinyMemory');
    expect(html).toContain('sidebar-nav');
    expect(html).toContain('当前安排');
    expect(html).toContain('偶像名册');
    expect(html).toContain('日程表');
    expect(html).toContain('地点地图');
    expect(html).toContain('2026年4月6日');
    expect(html).toContain('08:00');
    expect(html).toContain('事务所');
    expect(html).toContain('车站');
    expect(html).toContain('练习室');
    expect(html).toContain('录音棚');
    expect(html).toContain('休息');
    expect(html).toContain('自由时间');
    expect(html).toContain('环顾四周');
    expect(html).not.toContain('声乐课');
  });

  it('shows resource-blocked actions as disabled with a reason', () => {
    const state = travelTo(newGame(1), 'practice_room');
    state.money = 100;
    const idolPage = handleCommand(state, {
      type: 'enterIdol',
      idolId: 'mano',
    });

    const html = renderToString(
      <ScenePanel scene={buildScene(idolPage)} onAction={() => {}} />,
    );
    expect(html).toContain('金钱不足（需要 ¥500）');
    expect(html).toContain('disabled');
  });

  it('shows Hazuki at the office from 09:00', () => {
    const state = advanceTime(newGame(1), 60);
    const html = renderToString(
      <ScenePanel scene={buildScene(state)} onAction={() => {}} />,
    );
    expect(html).toContain('七草叶月');
    expect(html).toContain('事务员');
    expect(html).toContain('交谈');
  });

  it('renders multiple actors at the office', () => {
    const state = advanceTime(newGame(1), 2 * 60);
    const html = renderToString(
      <ScenePanel scene={buildScene(state)} onAction={() => {}} />,
    );
    expect(html).toContain('七草叶月');
    expect(html).toContain('天井努');
    expect(html).toContain('社长');
    expect(html).toContain('交谈');
  });

  it('renders the dedicated Hazuki interaction page', () => {
    const state = enterNpc(advanceTime(newGame(1), 60), 'hazuki');
    const html = renderToString(
      <ScenePanel scene={buildScene(state)} onAction={() => {}} />,
    );
    expect(html).toContain('七草叶月');
    expect(html).toContain('打招呼');
    expect(html).toContain('问时间安排');
    expect(html).toContain('离开');
  });

  it('renders Mano training page at the practice room', () => {
    const practice = travelTo(newGame(1), 'practice_room');
    const state = handleCommand(practice, {
      type: 'enterIdol',
      idolId: 'mano',
    });
    const html = renderToString(
      <ScenePanel scene={buildScene(state)} onAction={() => {}} />,
    );
    expect(html).toContain('樱木真乃');
    expect(html).toContain('illumination STARS');
    expect(html).toContain('声乐课');
    expect(html).toContain('舞蹈课');
    expect(html).toContain('表现课');
    expect(html).toContain('idol-page-avatar');
    expect(html).toContain('q/mano.png');
    expect(html).toContain('离开');
  });

  it('renders the idol work page at the studio', () => {
    const studio = travelTo(advanceTime(newGame(1), 7 * 60), 'studio');
    const state = handleCommand(studio, {
      type: 'enterIdol',
      idolId: 'mano',
    });
    const html = renderToString(
      <ScenePanel scene={buildScene(state)} onAction={() => {}} />,
    );
    expect(html).toContain('工作');
    expect(html).toContain('节目收录');
    expect(html).toContain('离开');
    expect(html).not.toContain('声乐课');
  });

  it('renders dialogue text and choices', () => {
    const state = newGame(1);
    state.pendingDialogueId = 'dialogue.hiori.first';
    state.dialogueChainId = 'hiori-encounter';
    state.dialogueNodeId = 'n03';
    state.dialogueTargetIdolId = 'hiori';
    const html = renderToString(
      <DialogueOverlay
        state={state}
        onAdvance={() => {}}
        onChoice={() => {}}
      />,
    );
    expect(html).toContain('风野灯织');
    expect(html).toContain('帮她捡起被风吹散的纸');
  });

  it('renders the Hiori encounter action at the park', () => {
    const state = newGame(1);
    state.clock.absoluteMinutes = 12 * 60;
    state.locationId = 'park';
    const html = renderToString(
      <ScenePanel scene={buildScene(state)} onAction={() => {}} />,
    );
    expect(html).toContain('在长椅旁停下');
  });

  it('renders only recognized idols in the roster', () => {
    const html = renderToString(
      <IdolRoster state={newGame(1)} onClose={() => {}} />,
    );
    expect(html).toContain('偶像名册');
    expect(html).toContain('樱木真乃');
    expect(html).not.toContain('风野灯织');
    expect(html).toContain('roster-avatar');
    expect(html).toContain('q/mano.png');
    expect(html).toContain('歌唱');
    expect(html).toContain('当前');
  });

  it('shows a known idol without stats or schedule', () => {
    const state = newGame(1);
    state.idols.hiori!.status = 'known';
    const html = renderToString(
      <IdolRoster state={state} onClose={() => {}} />,
    );
    expect(html).toContain('风野灯织');
    expect(html).toContain('尚未招募');
  });

  it('shows an idol at an off-map school in the roster', () => {
    const state = newGame(1);
    state.idols.hiori!.status = 'recruited';
    const html = renderToString(
      <IdolRoster state={advanceTime(state, 1500)} onClose={() => {}} />,
    );
    expect(html).toContain('现在：学校');
  });

  it('renders the weekly idol schedule only for recruited idols', () => {
    const state = newGame(1);
    state.idols.hiori!.status = 'recruited';
    const html = renderToString(
      <IdolSchedule state={state} onClose={() => {}} />,
    );
    expect(html).toContain('偶像日程表');
    expect(html).toContain('今天');
    expect(html).toContain('4月7日');
    expect(html).toContain('星期一');
    expect(html).toContain('星期日');
    expect(html).toContain('樱木真乃');
    expect(html).toContain('风野灯织');
    expect(html).toContain('练习');
    expect(html).toContain('自由活动');
  });

  it('hides known idols from the schedule', () => {
    const state = newGame(1);
    state.idols.hiori!.status = 'known';
    const html = renderToString(
      <IdolSchedule state={state} onClose={() => {}} />,
    );
    expect(html).toContain('樱木真乃');
    expect(html).not.toContain('风野灯织');
  });

  it('shows a temporary work override in the date window', () => {
    const state = newGame(1);
    state.actors.mano.scheduleOverrides = [
      {
        id: 'job-1',
        day: 1,
        fromMinute: 10 * 60,
        toMinute: 16 * 60,
        locationId: 'studio',
        label: '收录',
        visibility: 'public',
        mode: 'replace-day',
      },
    ];
    const html = renderToString(
      <IdolSchedule state={state} onClose={() => {}} />,
    );
    expect(html).toContain('临时');
    expect(html).toMatch(/10:00.*16:00/);
  });

  it('shows the bus entry on the station map', () => {
    const state = moveTo(newGame(1), 'station');
    const html = renderToString(
      <CityMap
        state={state}
        onMove={() => {}}
        onTransit={() => {}}
      />,
    );
    expect(html).toContain('公交');
    expect(html).toContain('6 条线路');
    expect(html).toContain('出租车');
    expect(html).toContain('6 个目的地');
  });

  it('renders the city map with adjacent destinations', () => {
    const html = renderToString(
      <CityMap
        state={newGame(1)}
        onMove={() => {}}
        onTransit={() => {}}
      />,
    );
    expect(html).toContain('城市地图');
    expect(html).toContain('map-dot-grid');
    expect(html).toContain('map-node-icon');
    expect(html).toContain('283 PRODUCTION · ACTIVITY AREA');
    expect(html).toContain('事务所');
    expect(html).toContain('车站');
    expect(html).toContain('5 分钟');
  });

  it('renders the location scene in the sidebar', () => {
    const state = travelTo(advanceTime(newGame(1), 2 * 60), 'practice_room');
    const html = renderToString(
      <StatsPanel
        state={state}
        hero={buildScene(state).hero}
      />,
    );
    expect(html).toContain('sidebar-scene');
    expect(html).toContain('练习室');
    expect(html).toContain('2026年4月6日 · 星期一');
    expect(html).toMatch(/¥.*3,000/);
  });

  it('hides the city map outside the location menu', () => {
    const state = newGame(1);
    state.phase = 'idol';
    const html = renderToString(
      <CityMap
        state={state}
        onMove={() => {}}
        onTransit={() => {}}
      />,
    );
    expect(html).toBe('');
  });

  it('shows both recruited idols at the practice room at 10:00', () => {
    const state = travelTo(advanceTime(newGame(1), 2 * 60), 'practice_room');
    state.idols.hiori!.status = 'recruited';
    const html = renderToString(
      <ScenePanel scene={buildScene(state)} onAction={() => {}} />,
    );
    expect(html).toContain('樱木真乃');
    expect(html).toContain('风野灯织');
    expect(html).toContain('训练');
  });

  it('shows the current idol avatar in the sidebar', () => {
    const html = renderToString(
      <StatsPanel
        state={newGame(1)}
      />,
    );
    expect(html).toContain('樱木真乃');
    expect(html).toContain('idol-summary-avatar');
    expect(html).toContain('q/mano.png');
  });

  it('renders the debug panel without crashing', () => {
    const html = renderToString(
      <DebugPanel
        state={newGame(1)}
        onForceEvent={() => {}}
        onJumpDay={() => {}}
      />,
    );
    expect(html).toContain('调试');
    expect(html).toContain('声乐课');
    expect(html).toContain('嗓子的警告');
    expect(html).toContain('行动不匹配');
  });
});
