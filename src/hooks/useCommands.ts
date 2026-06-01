"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";

import { DATA_SOURCES } from "@/lib/schema/sources";
import { useHistory, useHistoryStore } from "@/lib/store/historyStore";
import { useQueryActions } from "@/lib/store/hooks";
import { useQueryStore } from "@/lib/store/queryStore";
import { useRunStore } from "@/lib/store/runStore";
import { useSourceStore } from "@/lib/store/sourceStore";
import { useUiStore } from "@/lib/store/uiStore";

export interface Chord {
  key: string; // matched against KeyboardEvent.key (case-insensitive)
  mod?: boolean; // Cmd / Ctrl
  shift?: boolean;
  whenTyping?: boolean; // also fires while a field is focused
}

export interface Command {
  id: string;
  label: string;
  run: () => void;
  chord?: Chord;
}

export function useCommands(): Command[] {
  const rootId = useQueryStore((s) => s.rootId);
  const { addCondition, addGroup, reset } = useQueryActions();
  const setSource = useSourceStore((s) => s.setSource);
  const { undo, redo } = useHistory();
  const requestRun = useRunStore((s) => s.requestRun);
  const { resolvedTheme, setTheme } = useTheme();

  return useMemo(() => {
    const switchSource = (id: string) => {
      setSource(id);
      reset();
      useHistoryStore.getState().clear();
    };

    return [
      {
        id: "run",
        label: "Run query",
        run: requestRun,
        chord: { mod: true, key: "Enter" },
      },
      {
        id: "add-condition",
        label: "Add condition",
        run: () => addCondition(rootId),
      },
      { id: "add-group", label: "Add group", run: () => addGroup(rootId) },
      {
        id: "clear",
        label: "Clear all rules",
        run: () => reset(),
        chord: { mod: true, shift: true, key: "c" },
      },
      {
        id: "export",
        label: "Export query as JSON",
        run: () => useUiStore.getState().openDialog("export"),
        chord: { mod: true, key: "e" },
      },
      {
        id: "import",
        label: "Import query from JSON",
        run: () => useUiStore.getState().openDialog("import"),
        chord: { mod: true, key: "i" },
      },
      {
        id: "save-preset",
        label: "Save query as preset",
        run: () => useUiStore.getState().openDialog("savePreset"),
      },
      {
        id: "undo",
        label: "Undo",
        run: undo,
        chord: { mod: true, key: "z", whenTyping: true },
      },
      {
        id: "redo",
        label: "Redo",
        run: redo,
        chord: { mod: true, shift: true, key: "z", whenTyping: true },
      },
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
    requestRun,
    setSource,
    resolvedTheme,
    setTheme,
  ]);
}

const isMac =
  typeof navigator !== "undefined" &&
  /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent || "");

// Renders a chord as display chips, e.g. ["Ctrl", "Shift", "Z"] or ["⌘", "↵"].
export function chordChips(chord: Chord): string[] {
  const chips: string[] = [];
  if (chord.mod) chips.push(isMac ? "⌘" : "Ctrl");
  if (chord.shift) chips.push(isMac ? "⇧" : "Shift");
  chips.push(displayKey(chord.key));
  return chips;
}

function displayKey(key: string): string {
  if (key === "Enter") return isMac ? "↵" : "Enter";
  if (key.length === 1) return key.toUpperCase();
  return key;
}
