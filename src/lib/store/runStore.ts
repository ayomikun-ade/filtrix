import { create } from "zustand";

// A tiny signal store: bumping `token` asks the results panel to run the query,
// so the command palette / keyboard shortcut can trigger Run from anywhere.
interface RunState {
  token: number;
  requestRun: () => void;
}

export const useRunStore = create<RunState>((set) => ({
  token: 0,
  requestRun: () => set((s) => ({ token: s.token + 1 })),
}));
