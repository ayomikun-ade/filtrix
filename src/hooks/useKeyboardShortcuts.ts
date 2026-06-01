"use client";

import { useEffect } from "react";

import { useCommands } from "@/hooks/useCommands";

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return (
    el.tagName === "INPUT" ||
    el.tagName === "TEXTAREA" ||
    el.tagName === "SELECT" ||
    el.isContentEditable
  );
}

// Global builder shortcuts, driven by the same command registry the palette uses.
// ⌘/Ctrl+K opens the palette; every command with a chord is dispatched here.
export function useKeyboardShortcuts({
  onOpenPalette,
}: {
  onOpenPalette: () => void;
}) {
  const commands = useCommands();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();

      if (mod && key === "k") {
        e.preventDefault();
        onOpenPalette();
        return;
      }

      for (const command of commands) {
        const chord = command.chord;
        if (!chord) continue;
        if (Boolean(chord.mod) !== mod) continue;
        if (Boolean(chord.shift) !== e.shiftKey) continue;
        if (key !== chord.key.toLowerCase()) continue;
        if (!chord.whenTyping && isTyping(e.target)) continue;
        e.preventDefault();
        command.run();
        return;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [commands, onOpenPalette]);
}
