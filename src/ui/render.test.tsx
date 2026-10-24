import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import App from '../App';
import { newGame } from '../core/sim';
import { DebugPanel } from './components/DebugPanel';

describe('app shell', () => {
  it('renders the first day without crashing', () => {
    const html = renderToString(<App />);
    expect(html).toContain('ShinyMemory');
    expect(html).toContain('第 1 天');
    expect(html).toContain('08:00');
    expect(html).toContain('事务所');
    expect(html).toContain('练习室');
    expect(html).toContain('休息');
    expect(html).toContain('自由时间');
    expect(html).toContain('环顾四周');
    expect(html).not.toContain('声乐课');
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
