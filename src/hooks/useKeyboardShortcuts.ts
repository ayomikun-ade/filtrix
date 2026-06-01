"use client";

import { useEffect } from "react";

import { useHistory } from "@/lib/store/historyStore";

// Global builder shortcuts: ⌘/Ctrl+K opens the palette, ⌘/Ctrl+Z undoes,
// ⌘/Ctrl+Shift+Z redoes.
export function useKeyboardShortcuts({
  onOpenPalette,
}: {
  onOpenPalette: () => void;
}) {
  const { undo, redo } = useHistory();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!(e.metaKey || e.ctrlKey)) return;
      const key = e.key.toLowerCase();
      if (key === "k") {
        e.preventDefault();
        onOpenPalette();
      } else if (key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo, redo, onOpenPalette]);
}
