import type { Page } from '@playwright/test';
import type { ActionCommand, GameState } from '../../src/core/types';

type Bridge = {
  getState: () => GameState;
  dispatch: (command: ActionCommand) => void;
  jumpTo: (
    day: number,
    minuteOfDay: number,
    locationId?: string,
  ) => void;
  reset: (seed?: number) => void;
};

declare global {
  interface Window {
    __SHINY_MEMORY__?: Bridge;
  }
}

export async function openGame(page: Page): Promise<void> {
  await page.goto('/?debug=1');
  await page.waitForFunction(() => Boolean(window.__SHINY_MEMORY__));
}

export async function getState(page: Page): Promise<GameState> {
  return page.evaluate(() => window.__SHINY_MEMORY__!.getState());
}

export async function jumpTo(
  page: Page,
  day: number,
  minuteOfDay: number,
  locationId?: string,
): Promise<void> {
  await page.evaluate(
    ([nextDay, nextMinute, nextLocation]) =>
      window.__SHINY_MEMORY__!.jumpTo(
        nextDay,
        nextMinute,
        nextLocation ?? undefined,
      ),
    [day, minuteOfDay, locationId] as const,
  );
}

export async function dispatch(
  page: Page,
  command: ActionCommand,
): Promise<void> {
  await page.evaluate(
    (nextCommand) => window.__SHINY_MEMORY__!.dispatch(nextCommand),
    command,
  );
}

export async function reset(page: Page, seed = 1): Promise<void> {
  await page.evaluate(
    (nextSeed) => window.__SHINY_MEMORY__!.reset(nextSeed),
    seed,
  );
}

export async function logTexts(page: Page): Promise<string[]> {
  const state = await getState(page);
  return state.log.map((entry) => entry.text);
}

export function watchConsole(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}
