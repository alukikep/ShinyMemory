import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import App from '../App';
import { buildScene } from '../core/scene';
import { advanceTime, enterNpc, moveTo, newGame } from '../core/sim';
import { DebugPanel } from './components/DebugPanel';
import { ScenePanel } from './components/ScenePanel';

describe('app shell', () => {
  it('renders the first day without crashing', () => {
    const html = renderToString(<App />);
    expect(html).toContain('ShinyMemory');
    expect(html).toContain('第 1 天');
    expect(html).toContain('08:00');
    expect(html).toContain('事务所');
    expect(html).toContain('练习室');
    expect(html).not.toContain('录音棚');
    expect(html).toContain('休息');
    expect(html).toContain('自由时间');
    expect(html).toContain('环顾四周');
    expect(html).not.toContain('声乐课');
  });

  it('shows resource-blocked actions as disabled with a reason', () => {
    const state = moveTo(newGame(1), 'practice_room');
    state.money = 100;

    const html = renderToString(
      <ScenePanel scene={buildScene(state)} onAction={() => {}} />,
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
    expect(html).toContain('和七草叶月聊聊');
    expect(html).toContain('选择话题');
  });

  it('renders multiple actors at the office', () => {
    const state = advanceTime(newGame(1), 2 * 60);
    const html = renderToString(
      <ScenePanel scene={buildScene(state)} onAction={() => {}} />,
    );
    expect(html).toContain('七草叶月');
    expect(html).toContain('天井努');
    expect(html).toContain('社长');
    expect(html).toContain('和七草叶月聊聊');
    expect(html).toContain('和天井努聊聊');
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
