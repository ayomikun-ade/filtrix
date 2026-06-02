import { useMemo } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { DATA_SOURCES, setCustomSources } from "@/lib/schema/sources";
import type { DataSource } from "@/lib/schema/types";

interface CustomSourcesState {
  sources: DataSource[];
  addSource: (source: DataSource) => void;
  removeSource: (id: string) => void;
}

export const useCustomSourcesStore = create<CustomSourcesState>()(
  persist(
    (set) => ({
      sources: [],
      addSource: (source) =>
        set((s) => ({
          sources: [source, ...s.sources.filter((x) => x.id !== source.id)],
        })),
      removeSource: (id) =>
        set((s) => ({ sources: s.sources.filter((x) => x.id !== id) })),
    }),
    {
      name: "filtrix-custom-sources",
      storage: createJSONStorage(() => localStorage),
      // Hydrate on the client only (see SourcePicker for the rehydrate call).
      skipHydration: true,
    },
  ),
);

// Keep the synchronous registry in src/lib/schema/sources.ts in sync so that
// non-React lookups (getSource) resolve imported sources too.
setCustomSources(useCustomSourcesStore.getState().sources);
useCustomSourcesStore.subscribe((state) => setCustomSources(state.sources));

// Built-in + imported sources, for the source list and command registry.
export function useAllSources(): DataSource[] {
  const custom = useCustomSourcesStore((s) => s.sources);
  return useMemo(() => [...DATA_SOURCES, ...custom], [custom]);
}
