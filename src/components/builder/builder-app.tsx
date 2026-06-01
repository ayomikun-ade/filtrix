"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowTurnBackwardIcon,
  ArrowTurnForwardIcon,
  Delete02Icon,
  Download01Icon,
  PlayIcon,
  Upload01Icon,
} from "@hugeicons/core-free-icons";

import { useQueryActions } from "@/lib/store/hooks";
import { Brand } from "@/components/brand";
import { BuilderCanvas } from "@/components/builder/builder-canvas";
import { QueryPreview } from "@/components/builder/query-preview";
import { SourcePicker } from "@/components/builder/source-picker";
import { ValidationBadge } from "@/components/builder/validation-badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export function BuilderApp() {
  const { reset } = useQueryActions();

  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh">
      <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-3">
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
          <div className="hidden items-center gap-1.5 sm:flex">
            <Button variant="ghost" size="icon-sm" aria-label="Undo" disabled>
              <HugeiconsIcon icon={ArrowTurnBackwardIcon} className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Redo" disabled>
              <HugeiconsIcon icon={ArrowTurnForwardIcon} className="size-4" />
            </Button>
            <span className="mx-1 h-5 w-px bg-border" aria-hidden />
            <Button variant="outline" size="sm" disabled>
              <HugeiconsIcon icon={Upload01Icon} className="size-4" />
              Import
            </Button>
            <Button variant="outline" size="sm" disabled>
              <HugeiconsIcon icon={Download01Icon} className="size-4" />
              Export
            </Button>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_360px] lg:overflow-hidden">
        <aside className="flex flex-col gap-6 border-b border-border p-4 lg:overflow-auto lg:border-r lg:border-b-0">
          <PanelSection label="Data source">
            <SourcePicker />
          </PanelSection>
          <PanelSection label="Saved presets">
            <EmptyHint>No saved presets yet.</EmptyHint>
          </PanelSection>
          <PanelSection label="History">
            <EmptyHint>Your query history will appear here.</EmptyHint>
          </PanelSection>
        </aside>

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

        <aside className="flex flex-col border-border lg:overflow-hidden lg:border-l">
          <QueryPreview />
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                Results
              </span>
              <Button size="sm" disabled>
                <HugeiconsIcon icon={PlayIcon} className="size-4" />
                Run
              </Button>
            </div>
            <div className="flex flex-1 items-center justify-center p-6">
              <EmptyHint>Run a query to inspect matching rows.</EmptyHint>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function PanelSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
        {label}
      </span>
      {children}
    </div>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}
