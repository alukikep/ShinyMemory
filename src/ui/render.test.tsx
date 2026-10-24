import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import App from '../App';
import { buildScene } from '../core/scene';
import { moveTo, newGame } from '../core/sim';
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
