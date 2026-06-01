"use client";

import { useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon, PlusSignIcon } from "@hugeicons/core-free-icons";

import { getSource } from "@/lib/schema/sources";
import { useHistoryStore } from "@/lib/store/historyStore";
import { usePresetsStore, type Preset } from "@/lib/store/presetsStore";
import { useQueryStore } from "@/lib/store/queryStore";
import { useSourceStore } from "@/lib/store/sourceStore";
import { useUiStore } from "@/lib/store/uiStore";

export function PresetList() {
  const presets = usePresetsStore((s) => s.presets);
  const remove = usePresetsStore((s) => s.remove);
  const setSource = useSourceStore((s) => s.setSource);
  const loadTree = useQueryStore((s) => s.loadTree);

  // Persisted store hydrates from localStorage on the client only.
  useEffect(() => {
    void usePresetsStore.persist.rehydrate();
  }, []);

  function load(preset: Preset) {
    if (getSource(preset.sourceId)) setSource(preset.sourceId);
    loadTree(preset.tree);
    useHistoryStore.getState().clear();
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => useUiStore.getState().openDialog("savePreset")}
        className="inline-flex w-fit items-center gap-1 rounded-md text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
        Save current query
      </button>

      {presets.length === 0 ? (
        <p className="text-sm text-muted-foreground">No saved presets yet.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {presets.map((preset) => (
            <li key={preset.id} className="group flex items-center gap-1">
              <button
                type="button"
                onClick={() => load(preset)}
                className="flex-1 truncate rounded-md px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-muted"
              >
                {preset.name}
              </button>
              <button
                type="button"
                onClick={() => remove(preset.id)}
                aria-label={`Delete ${preset.name}`}
                className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:bg-muted hover:text-foreground"
              >
                <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
