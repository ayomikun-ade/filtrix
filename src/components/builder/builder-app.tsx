"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowTurnBackwardIcon,
  ArrowTurnForwardIcon,
  CommandIcon,
  Delete02Icon,
  Download01Icon,
  Menu01Icon,
  Upload01Icon,
} from "@hugeicons/core-free-icons";

import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useHistory } from "@/lib/store/historyStore";
import { useQueryActions } from "@/lib/store/hooks";
import { useSourceStore } from "@/lib/store/sourceStore";
import { useUiStore } from "@/lib/store/uiStore";
import { Brand } from "@/components/brand";
import { BuilderCanvas } from "@/components/builder/builder-canvas";
import { BuilderRail } from "@/components/builder/builder-rail";
import { CommandPalette } from "@/components/builder/command-palette";
import { ExportDialog } from "@/components/builder/export-dialog";
import { ImportDialog } from "@/components/builder/import-dialog";
import { QueryPreview } from "@/components/builder/query-preview";
import { ResultsPanel } from "@/components/builder/results-panel";
import { SavePresetDialog } from "@/components/builder/save-preset-dialog";
import { ValidationBadge } from "@/components/builder/validation-badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";

export function BuilderApp() {
  const { reset } = useQueryActions();
  const sourceId = useSourceStore((s) => s.sourceId);
  const { undo, redo, canUndo, canRedo } = useHistory();
  const dialog = useUiStore((s) => s.dialog);
  const openDialog = useUiStore((s) => s.openDialog);
  const closeDialog = useUiStore((s) => s.closeDialog);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [railOpen, setRailOpen] = useState(false);
  const openPalette = useCallback(() => setPaletteOpen(true), []);
  useKeyboardShortcuts({ onOpenPalette: openPalette });

  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh">
      <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRailOpen(true)}
            aria-label="Open menu"
            className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
          >
            <HugeiconsIcon icon={Menu01Icon} className="size-4" />
          </button>
          <Link
            href="/"
            aria-label="Back to home"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
          </Link>
          <Brand />
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Undo"
            onClick={undo}
            disabled={!canUndo}
          >
            <HugeiconsIcon icon={ArrowTurnBackwardIcon} className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Redo"
            onClick={redo}
            disabled={!canRedo}
          >
            <HugeiconsIcon icon={ArrowTurnForwardIcon} className="size-4" />
          </Button>
          <div className="hidden items-center gap-1.5 sm:flex">
            <span className="mx-1 h-5 w-px bg-border" aria-hidden />
            <Button
              variant="outline"
              size="sm"
              onClick={() => openDialog("import")}
            >
              <HugeiconsIcon icon={Upload01Icon} className="size-4" />
              Import
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openDialog("export")}
            >
              <HugeiconsIcon icon={Download01Icon} className="size-4" />
              Export
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={openPalette}
            aria-label="Open command palette"
          >
            <HugeiconsIcon icon={CommandIcon} className="size-4" />
            <kbd className="hidden font-mono text-[10px] text-muted-foreground sm:inline">
              ⌘K
            </kbd>
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 flex-col lg:flex-row lg:overflow-hidden">
        {/* Persistent sidebar on desktop; a slide-out sheet replaces it on mobile. */}
        <aside className="hidden p-4 lg:block lg:w-64 lg:shrink-0 lg:overflow-auto lg:border-r lg:border-border">
          <BuilderRail />
        </aside>

        {/* Content column: query + preview on top, results docked below */}
        <div className="flex min-w-0 flex-1 flex-col lg:overflow-hidden">
          <div className="grid flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] lg:overflow-hidden">
            <section className="flex flex-col border-b border-border lg:overflow-hidden lg:border-b-0">
              <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                    Query
                  </span>
                  <ValidationBadge />
                </div>
                <Button variant="ghost" size="sm" onClick={reset}>
                  <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                  Clear all
                </Button>
              </div>
              <div className="flex-1 lg:overflow-auto">
                <BuilderCanvas />
              </div>
            </section>

            <aside className="flex flex-col border-t border-border lg:overflow-hidden lg:border-t-0 lg:border-l">
              <QueryPreview />
            </aside>
          </div>

          <div className="border-t border-border">
            <ResultsPanel key={sourceId} />
          </div>
        </div>
      </div>

      {railOpen ? (
        <Sheet title="filtrix" onClose={() => setRailOpen(false)}>
          <BuilderRail onNavigate={() => setRailOpen(false)} />
        </Sheet>
      ) : null}
      {paletteOpen ? (
        <CommandPalette onClose={() => setPaletteOpen(false)} />
      ) : null}
      {dialog === "import" ? <ImportDialog onClose={closeDialog} /> : null}
      {dialog === "export" ? <ExportDialog onClose={closeDialog} /> : null}
      {dialog === "savePreset" ? (
        <SavePresetDialog onClose={closeDialog} />
      ) : null}
    </div>
  );
}
