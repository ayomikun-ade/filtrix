import { create } from "zustand";

import { DEFAULT_SOURCE_ID } from "@/lib/schema/sources";

interface SourceState {
  sourceId: string;
  setSource: (id: string) => void;
}

export const useSourceStore = create<SourceState>((set) => ({
  sourceId: DEFAULT_SOURCE_ID,
  setSource: (id) => set({ sourceId: id }),
}));
