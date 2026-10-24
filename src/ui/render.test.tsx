import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import App from '../App';
import { newGame } from '../core/sim';
import { DebugPanel } from './components/DebugPanel';

describe('app shell', () => {
  it('renders the first week without crashing', () => {
    const html = renderToString(<App />);
    expect(html).toContain('ShinyMemory');
    expect(html).toContain('第 1 周');
    expect(html).toContain('事务所');
    expect(html).toContain('练习室');
    expect(html).toContain('休息');
    expect(html).not.toContain('声乐课');
  });

  it('renders the debug panel without crashing', () => {
    const html = renderToString(
      <DebugPanel
        state={newGame(1)}
        onForceEvent={() => {}}
        onJumpWeek={() => {}}
      />,
    );
    expect(html).toContain('调试');
    expect(html).toContain('声乐课');
    expect(html).toContain('嗓子的警告');
    expect(html).toContain('行动不匹配');
  });
});
