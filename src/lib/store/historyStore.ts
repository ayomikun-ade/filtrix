import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

import type { QueryTree } from "@/lib/query/types";
import { useQueryStore } from "@/lib/store/queryStore";

const LIMIT = 100;
const COALESCE_MS = 350; // rapid edits (e.g. typing a value) collapse into one step

interface HistoryState {
  past: QueryTree[];
  future: QueryTree[];
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  clear: () => void;
}

// Guards re-entrancy: changes applied by undo/redo must not be recorded.
let applying = false;
let lastEditAt = 0;

const snapshot = (): QueryTree => {
  const { rootId, nodes } = useQueryStore.getState();
  return { rootId, nodes };
};

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],
  canUndo: false,
  canRedo: false,

  undo: () => {
    const { past, future } = get();
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const current = snapshot();
    applying = true;
    useQueryStore.getState().loadTree(previous);
    applying = false;
    const nextPast = past.slice(0, -1);
    set({
      past: nextPast,
      future: [...future, current],
      canUndo: nextPast.length > 0,
      canRedo: true,
    });
  },

  redo: () => {
    const { past, future } = get();
    if (future.length === 0) return;
    const next = future[future.length - 1];
    const current = snapshot();
    applying = true;
    useQueryStore.getState().loadTree(next);
    applying = false;
    const nextFuture = future.slice(0, -1);
    set({
      past: [...past, current],
      future: nextFuture,
      canUndo: true,
      canRedo: nextFuture.length > 0,
    });
  },

  clear: () => set({ past: [], future: [], canUndo: false, canRedo: false }),
}));

export function useHistory() {
  return useHistoryStore(
    useShallow((s) => ({
      undo: s.undo,
      redo: s.redo,
      canUndo: s.canUndo,
      canRedo: s.canRedo,
    })),
  );
}

// Record the pre-change tree on every user edit (coalescing bursts into one step).
useQueryStore.subscribe((state, prev) => {
  if (applying) return;
  if (state.rootId === prev.rootId && state.nodes === prev.nodes) return;

  const now = Date.now();
  const isNewStep = now - lastEditAt > COALESCE_MS;
  lastEditAt = now;

  const history = useHistoryStore.getState();
  if (isNewStep) {
    const past = [...history.past, { rootId: prev.rootId, nodes: prev.nodes }];
    useHistoryStore.setState({
      past: past.slice(-LIMIT),
      future: [],
      canUndo: true,
      canRedo: false,
    });
  } else if (history.future.length > 0) {
    useHistoryStore.setState({ future: [], canRedo: false });
  }
});
