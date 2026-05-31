import type { Metadata } from "next";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  ArrowLeft01Icon,
  ArrowTurnBackwardIcon,
  ArrowTurnForwardIcon,
  Download01Icon,
  PlayIcon,
  PlusSignIcon,
  Upload01Icon,
} from "@hugeicons/core-free-icons";

import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Builder — Filtrix",
};

const SOURCES = ["Movies", "Books", "Songs"] as const;

export default function BuilderPage() {
  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh">
      {/* Top bar */}
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
          <ThemeToggle />
        </div>
      </header>

      {/* Three-pane body */}
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_360px] lg:overflow-hidden">
        {/* Left rail */}
        <aside className="flex flex-col gap-6 border-b border-border p-4 lg:overflow-auto lg:border-r lg:border-b-0">
          <PanelSection label="Data source">
            <div className="flex flex-col gap-1">
              {SOURCES.map((source, i) => (
                <button
                  key={source}
                  type="button"
                  disabled
                  aria-current={i === 0 ? "true" : undefined}
                  className="flex items-center justify-between rounded-md border border-transparent px-2.5 py-1.5 text-left text-sm aria-[current]:border-border aria-[current]:bg-muted"
                >
                  {source}
                  {i === 0 ? (
                    <span
                      className="size-1.5 rounded-full bg-brand"
                      aria-hidden
                    />
                  ) : null}
                </button>
              ))}
            </div>
          </PanelSection>

          <PanelSection label="Saved presets">
            <EmptyHint>No saved presets yet.</EmptyHint>
          </PanelSection>

          <PanelSection label="History">
            <EmptyHint>Your query history will appear here.</EmptyHint>
          </PanelSection>
        </aside>

        {/* Center canvas */}
        <section className="flex flex-col border-b border-border lg:overflow-auto lg:border-b-0">
          <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2.5">
            <div className="inline-flex overflow-hidden rounded-md border border-border text-xs font-medium">
              <span className="bg-brand px-2.5 py-1 text-brand-foreground">
                AND
              </span>
              <span className="px-2.5 py-1 text-muted-foreground">OR</span>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <Button variant="outline" size="sm" disabled>
                <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
                Add condition
              </Button>
              <Button variant="outline" size="sm" disabled>
                <HugeiconsIcon icon={Add01Icon} className="size-4" />
                Add group
              </Button>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center p-6">
            <div className="flex max-w-sm flex-col items-center gap-3 text-center">
              <span className="inline-flex size-10 items-center justify-center rounded-md border border-dashed border-border">
                <HugeiconsIcon
                  icon={PlusSignIcon}
                  className="size-5 text-muted-foreground"
                />
              </span>
              <p className="text-sm font-medium">Your query is empty</p>
              <p className="text-sm text-muted-foreground">
                The recursive rule builder lands in the next milestone. Add
                conditions, nest groups, and watch the query update live.
              </p>
            </div>
          </div>
        </section>

        {/* Right dock */}
        <aside className="flex flex-col lg:overflow-hidden">
          <div className="flex flex-col border-b border-border">
            <div className="flex items-center gap-4 border-b border-border px-4 pt-2 text-xs font-medium">
              <Tab active>SQL</Tab>
              <Tab>MongoDB</Tab>
              <Tab>GraphQL</Tab>
            </div>
            <pre className="overflow-auto px-4 py-3 font-mono text-xs leading-relaxed text-muted-foreground">
              {`-- query preview\nSELECT * FROM movies;`}
            </pre>
          </div>

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

function Tab({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <span
      className={
        active
          ? "border-b-2 border-brand pb-2 text-foreground"
          : "border-b-2 border-transparent pb-2 text-muted-foreground"
      }
    >
      {children}
    </span>
  );
}
