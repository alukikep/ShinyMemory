import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import App from '../App';
import { buildScene } from '../core/scene';
import { advanceTime, enterNpc, handleCommand, newGame, travelTo } from '../core/sim';
import { DebugPanel } from './components/DebugPanel';
import { IdolRoster } from './components/IdolRoster';
import { CityMap } from './components/CityMap';
import { ScenePanel } from './components/ScenePanel';
import { StatsPanel } from './components/StatsPanel';

describe('app shell', () => {
  it('renders the first day without crashing', () => {
    const html = renderToString(<App />);
    expect(html).toContain('ShinyMemory');
    expect(html).toContain('第 1 天');
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

  it('renders the idol roster overlay', () => {
    const html = renderToString(
      <IdolRoster state={newGame(1)} onClose={() => {}} />,
    );
    expect(html).toContain('偶像名册');
    expect(html).toContain('樱木真乃');
    expect(html).toContain('风野灯织');
    expect(html).toContain('歌唱');
    expect(html).toContain('当前');
  });

  it('renders the city map with adjacent destinations', () => {
    const html = renderToString(
      <CityMap state={newGame(1)} onMove={() => {}} />,
    );
    expect(html).toContain('城市地图');
    expect(html).toContain('事务所');
    expect(html).toContain('车站');
    expect(html).toContain('5 分钟');
  });

  it('shows both idols at the practice room at 10:00', () => {
    const state = travelTo(advanceTime(newGame(1), 2 * 60), 'practice_room');
    const html = renderToString(
      <ScenePanel scene={buildScene(state)} onAction={() => {}} />,
    );
    expect(html).toContain('樱木真乃');
    expect(html).toContain('风野灯织');
    expect(html).toContain('训练');
  });

  it('shows the roster button in the sidebar', () => {
    const html = renderToString(
      <StatsPanel
        state={newGame(1)}
        onOpenRoster={() => {}}
      />,
    );
    expect(html).toContain('偶像名册');
    expect(html).toContain('樱木真乃');
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
