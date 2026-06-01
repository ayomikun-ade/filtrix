"use client";

import { DATA_SOURCES } from "@/lib/schema/sources";
import { useHistoryStore } from "@/lib/store/historyStore";
import { useQueryActions } from "@/lib/store/hooks";
import { useSourceStore } from "@/lib/store/sourceStore";
import { cn } from "@/lib/utils";

// Switching source invalidates existing field references, so the query resets.
export function SourcePicker({ onNavigate }: { onNavigate?: () => void }) {
  const sourceId = useSourceStore((s) => s.sourceId);
  const setSource = useSourceStore((s) => s.setSource);
  const { reset } = useQueryActions();

  function select(id: string) {
    onNavigate?.();
    if (id === sourceId) return;
    setSource(id);
    reset();
    // Undo across a source change would restore invalid field references.
    useHistoryStore.getState().clear();
  }

  return (
    <div className="flex flex-col gap-1">
      {DATA_SOURCES.map((source) => {
        const active = source.id === sourceId;
        return (
          <button
            key={source.id}
            type="button"
            onClick={() => select(source.id)}
            aria-current={active ? "true" : undefined}
            className={cn(
              "flex items-center justify-between rounded-md border px-2.5 py-1.5 text-left text-sm transition-colors",
              active
                ? "border-border bg-muted"
                : "border-transparent hover:bg-muted/50",
            )}
          >
            {source.name}
            {active ? (
              <span className="size-1.5 rounded-full bg-brand" aria-hidden />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
