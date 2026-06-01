"use client";

import { useMemo, useState } from "react";
import { useTheme } from "next-themes";

import { DATA_SOURCES } from "@/lib/schema/sources";
import { useHistory, useHistoryStore } from "@/lib/store/historyStore";
import { useQueryActions } from "@/lib/store/hooks";
import { useQueryStore } from "@/lib/store/queryStore";
import { useSourceStore } from "@/lib/store/sourceStore";
import { cn } from "@/lib/utils";

interface Command {
  id: string;
  label: string;
  run: () => void;
}

function useCommands(): Command[] {
  const rootId = useQueryStore((s) => s.rootId);
  const { addCondition, addGroup, reset } = useQueryActions();
  const setSource = useSourceStore((s) => s.setSource);
  const { undo, redo } = useHistory();
  const { resolvedTheme, setTheme } = useTheme();

  return useMemo(() => {
    const switchSource = (id: string) => {
      setSource(id);
      reset();
      useHistoryStore.getState().clear();
    };

    return [
      {
        id: "add-condition",
        label: "Add condition",
        run: () => addCondition(rootId),
      },
      { id: "add-group", label: "Add group", run: () => addGroup(rootId) },
      { id: "clear", label: "Clear all rules", run: () => reset() },
      { id: "undo", label: "Undo", run: undo },
      { id: "redo", label: "Redo", run: redo },
      ...DATA_SOURCES.map((source) => ({
        id: `source-${source.id}`,
        label: `Switch data source to ${source.name}`,
        run: () => switchSource(source.id),
      })),
      {
        id: "theme",
        label: "Toggle dark / light theme",
        run: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
      },
    ];
  }, [
    rootId,
    addCondition,
    addGroup,
    reset,
    undo,
    redo,
    setSource,
    resolvedTheme,
    setTheme,
  ]);
}

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const commands = useCommands();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const filtered = useMemo(
    () =>
      commands.filter((c) =>
        c.label.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [commands, query],
  );
  const activeIndex = Math.min(active, Math.max(0, filtered.length - 1));

  function exec(command: Command | undefined) {
    if (!command) return;
    command.run();
    onClose();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      exec(filtered[activeIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="fixed inset-0 z-50 bg-black/40 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className="mx-auto mt-[12vh] max-w-lg overflow-hidden rounded-lg border border-border bg-popover"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="Type a command…"
          aria-label="Command"
          className="w-full border-b border-border bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
        />
        <ul className="max-h-72 overflow-auto p-1">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              No matching commands.
            </li>
          ) : (
            filtered.map((command, i) => (
              <li key={command.id}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => exec(command)}
                  aria-current={i === activeIndex}
                  className={cn(
                    "flex w-full items-center rounded-md px-3 py-2 text-left text-sm transition-colors",
                    i === activeIndex
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {command.label}
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
