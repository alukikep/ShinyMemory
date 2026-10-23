import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import App from '../App';

describe('app shell', () => {
  it('renders the first week without crashing', () => {
    const html = renderToString(<App />);
    expect(html).toContain('ShinyMemory');
    expect(html).toContain('第 1 周');
    expect(html).toContain('声乐课');
    expect(html).toContain('休息');
  });
});
