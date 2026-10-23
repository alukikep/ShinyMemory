import { create } from 'zustand';
import { handleAction, newGame } from '../core/sim';
import type { GameState } from '../core/types';

type GameStore = {
  state: GameState;
  act: (actionId: string) => void;
  restart: () => void;
};

function makeSeed(): number {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return buffer[0]!;
}

export const useGameStore = create<GameStore>((set) => ({
  state: newGame(makeSeed()),
  act: (actionId) =>
    set((previous) => {
      if (actionId === 'restart') {
        return { state: newGame(makeSeed()) };
      }
      return { state: handleAction(previous.state, actionId) };
    }),
  restart: () => set({ state: newGame(makeSeed()) }),
}));
