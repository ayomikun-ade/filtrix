import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { QueryTree } from "@/lib/query/types";
import { createId } from "@/lib/utils/id";

export interface Preset {
  id: string;
  name: string;
  sourceId: string;
  tree: QueryTree;
  createdAt: number;
}

interface PresetsState {
  presets: Preset[];
  save: (name: string, sourceId: string, tree: QueryTree) => void;
  remove: (id: string) => void;
}

export const usePresetsStore = create<PresetsState>()(
  persist(
    (set) => ({
      presets: [],
      save: (name, sourceId, tree) =>
        set((s) => ({
          presets: [
            {
              id: createId("preset"),
              name,
              sourceId,
              tree,
              createdAt: Date.now(),
            },
            ...s.presets,
          ],
        })),
      remove: (id) =>
        set((s) => ({ presets: s.presets.filter((p) => p.id !== id) })),
    }),
    {
      name: "filtrix-presets",
      storage: createJSONStorage(() => localStorage),
      // Hydrate on the client only (avoids SSR/localStorage mismatch).
      skipHydration: true,
    },
  ),
);
