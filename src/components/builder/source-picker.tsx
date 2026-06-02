"use client";

import { useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, DatabaseAddIcon } from "@hugeicons/core-free-icons";

import { DEFAULT_SOURCE_ID } from "@/lib/schema/sources";
import {
  useAllSources,
  useCustomSourcesStore,
} from "@/lib/store/customSourcesStore";
import { useHistoryStore } from "@/lib/store/historyStore";
import { useQueryActions } from "@/lib/store/hooks";
import { useSourceStore } from "@/lib/store/sourceStore";
import { useUiStore } from "@/lib/store/uiStore";
import { cn } from "@/lib/utils";

// Switching source invalidates existing field references, so the query resets.
export function SourcePicker({ onNavigate }: { onNavigate?: () => void }) {
  const sources = useAllSources();
  const sourceId = useSourceStore((s) => s.sourceId);
  const setSource = useSourceStore((s) => s.setSource);
  const removeSource = useCustomSourcesStore((s) => s.removeSource);
  const openDialog = useUiStore((s) => s.openDialog);
  const { reset } = useQueryActions();

  // Persisted custom sources hydrate from localStorage on the client only.
  useEffect(() => {
    void useCustomSourcesStore.persist.rehydrate();
  }, []);

  function select(id: string) {
    onNavigate?.();
    if (id === sourceId) return;
    setSource(id);
    reset();
    // Undo across a source change would restore invalid field references.
    useHistoryStore.getState().clear();
  }

  function remove(id: string) {
    removeSource(id);
    if (id === sourceId) {
      setSource(DEFAULT_SOURCE_ID);
      reset();
      useHistoryStore.getState().clear();
    }
  }

  return (
    <div className="flex flex-col gap-1">
      {sources.map((source) => {
        const active = source.id === sourceId;
        return (
          <div
            key={source.id}
            className={cn(
              "group flex items-center gap-1 rounded-md border pr-1 transition-colors",
              active
                ? "border-border bg-muted"
                : "border-transparent hover:bg-muted/50",
            )}
          >
            <button
              type="button"
              onClick={() => select(source.id)}
              aria-current={active ? "true" : undefined}
              className="flex flex-1 items-center justify-between px-2.5 py-1.5 text-left text-sm"
            >
              {source.name}
              {active ? (
                <span className="size-1.5 rounded-full bg-brand" aria-hidden />
              ) : null}
            </button>
            {source.custom ? (
              <button
                type="button"
                onClick={() => remove(source.id)}
                aria-label={`Remove ${source.name}`}
                className="inline-flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground focus-visible:opacity-100"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
              </button>
            ) : null}
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => openDialog("importData")}
        className="mt-1 inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-dashed border-border px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
      >
        <HugeiconsIcon icon={DatabaseAddIcon} className="size-4" />
        Import data
      </button>
    </div>
  );
}
