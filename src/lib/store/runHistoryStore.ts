import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { QueryTree } from "@/lib/query/types";
import { createId } from "@/lib/utils/id";

export interface RunRecord {
  id: string;
  sourceId: string;
  tree: QueryTree;
  label: string; // natural-language summary
  count: number; // matching rows
  at: number; // timestamp
}

interface RunHistoryState {
  records: RunRecord[];
  record: (entry: Omit<RunRecord, "id" | "at">) => void;
  clear: () => void;
}

const LIMIT = 15;

export const useRunHistoryStore = create<RunHistoryState>()(
  persist(
    (set) => ({
      records: [],
      record: (entry) =>
        set((s) => {
          const last = s.records[0];
          const sameQuery =
            last &&
            last.sourceId === entry.sourceId &&
            JSON.stringify(last.tree) === JSON.stringify(entry.tree);

          // Re-running the same query refreshes the latest entry instead of duplicating.
          if (sameQuery) {
            const records = s.records.slice();
            records[0] = { ...last, count: entry.count, at: Date.now() };
            return { records };
          }

          return {
            records: [
              { id: createId("run"), at: Date.now(), ...entry },
              ...s.records,
            ].slice(0, LIMIT),
          };
        }),
      clear: () => set({ records: [] }),
    }),
    {
      name: "filtrix-run-history",
      storage: createJSONStorage(() => localStorage),
      // Hydrate on the client only (avoids SSR/localStorage mismatch).
      skipHydration: true,
    },
  ),
);
