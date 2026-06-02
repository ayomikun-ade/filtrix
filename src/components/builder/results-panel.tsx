"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  Download01Icon,
  Loading03Icon,
  PlayIcon,
  SearchRemoveIcon,
} from "@hugeicons/core-free-icons";

import { toNaturalLanguage } from "@/lib/query/builders";
import { buildPredicate, type Row } from "@/lib/query/evaluate";
import { getDatasetRows } from "@/lib/schema/generate";
import { getSource } from "@/lib/schema/sources";
import { useQueryStore } from "@/lib/store/queryStore";
import { useRunHistoryStore } from "@/lib/store/runHistoryStore";
import { useRunStore } from "@/lib/store/runStore";
import { useSourceStore } from "@/lib/store/sourceStore";
import { useQueryValidity } from "@/lib/validation/useQueryValidity";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 50;
const ROW_HEIGHT = 33;

type Status = "idle" | "loading" | "done";
type Sort = { field: string | null; dir: "asc" | "desc" };

export function ResultsPanel() {
  const sourceId = useSourceStore((s) => s.sourceId);
  const { runnable, count, complete, incomplete, emptyRows } =
    useQueryValidity();
  const reason = runReason({ count, complete, incomplete, emptyRows });

  const [status, setStatus] = useState<Status>("idle");
  const [results, setResults] = useState<Row[]>([]);
  const [sort, setSort] = useState<Sort>({ field: null, dir: "asc" });
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(false);
  const timer = useRef<number | null>(null);
  const runRef = useRef<() => void>(() => {});

  useEffect(() => () => window.clearTimeout(timer.current ?? undefined), []);

  // Keep a latest-ref of run() and fire it when something requests a run.
  useEffect(() => {
    runRef.current = run;
  });
  useEffect(
    () =>
      useRunStore.subscribe((s, prev) => {
        if (s.token !== prev.token) runRef.current();
      }),
    [],
  );

  const sorted = useMemo(() => {
    if (!sort.field) return results;
    const field = sort.field;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...results].sort((a, b) => compareCells(a[field], b[field]) * dir);
  }, [results, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageRows = sorted.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const scrollRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: pageRows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
  });

  const source = getSource(sourceId);
  if (!source) return null;

  function run() {
    if (!runnable || !source) return;
    setOpen(true);
    setStatus("loading");
    window.clearTimeout(timer.current ?? undefined);
    const snapshot = useQueryStore.getState();
    const tree = { rootId: snapshot.rootId, nodes: snapshot.nodes };
    timer.current = window.setTimeout(() => {
      const matches = getDatasetRows(source).filter(
        buildPredicate(tree, source),
      );
      setResults(matches);
      setSort({ field: null, dir: "asc" });
      setPage(0);
      setStatus("done");
      useRunHistoryStore.getState().record({
        sourceId: source.id,
        tree,
        label: toNaturalLanguage(tree, source),
        count: matches.length,
      });
    }, 350);
  }

  function toggleSort(field: string) {
    setPage(0);
    setSort((prev) =>
      prev.field === field
        ? { field, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { field, dir: "asc" },
    );
  }

  function downloadCsv() {
    if (!source) return;
    const blob = new Blob([toCsv(sorted, source.fields)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `filtrix-${sourceId}-results.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={cn("flex flex-col", open && "h-80 lg:h-[42dvh]")}>
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Collapse results" : "Expand results"}
            aria-expanded={open}
            className="inline-flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <HugeiconsIcon
              icon={open ? ArrowDown01Icon : ArrowUp01Icon}
              className="size-4"
            />
          </button>
          <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
            Results
          </span>
          {status === "done" ? (
            <span className="text-xs text-foreground">
              {results.length} {results.length === 1 ? "row" : "rows"}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-1.5">
          {status === "done" && results.length > 0 ? (
            <Button variant="outline" size="sm" onClick={downloadCsv}>
              <HugeiconsIcon icon={Download01Icon} className="size-4" />
              Export
            </Button>
          ) : null}
          <Button
            size="sm"
            onClick={run}
            disabled={!runnable}
            title={!runnable ? reason : undefined}
          >
            <HugeiconsIcon icon={PlayIcon} className="size-4" />
            Run
          </Button>
        </div>
      </div>

      {!open ? null : !runnable ? (
        <Centered>{reason}</Centered>
      ) : status === "idle" ? (
        <Centered>Run a query to inspect matching rows.</Centered>
      ) : status === "loading" ? (
        <Centered>
          <HugeiconsIcon icon={Loading03Icon} className="size-4 animate-spin" />
          Running query…
        </Centered>
      ) : results.length === 0 ? (
        <Centered>
          <HugeiconsIcon icon={SearchRemoveIcon} className="size-5" />
          No rows match this query.
        </Centered>
      ) : (
        <>
          <div ref={scrollRef} className="flex-1 overflow-auto">
            <div className="min-w-max text-sm">
              <div className="sticky top-0 z-10 flex border-b border-border bg-background">
                {source.fields.map((field) => (
                  <button
                    key={field.name}
                    type="button"
                    onClick={() => toggleSort(field.name)}
                    className="flex w-36 shrink-0 items-center gap-1 px-3 py-2 text-left font-medium transition-colors hover:bg-muted/50"
                  >
                    <span className="truncate">{field.label}</span>
                    {sort.field === field.name ? (
                      <HugeiconsIcon
                        icon={
                          sort.dir === "asc" ? ArrowUp01Icon : ArrowDown01Icon
                        }
                        className="size-3 text-muted-foreground"
                      />
                    ) : null}
                  </button>
                ))}
              </div>

              <div
                className="relative"
                style={{ height: virtualizer.getTotalSize() }}
              >
                {virtualizer.getVirtualItems().map((item) => {
                  const row = pageRows[item.index];
                  return (
                    <div
                      key={item.key}
                      className="absolute left-0 flex w-full border-b border-border/60"
                      style={{
                        height: item.size,
                        transform: `translateY(${item.start}px)`,
                      }}
                    >
                      {source.fields.map((field) => (
                        <div
                          key={field.name}
                          className="w-36 shrink-0 truncate px-3 py-2 text-muted-foreground"
                        >
                          {formatCell(row[field.name])}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted-foreground">
            <span>
              {page * PAGE_SIZE + 1}–
              {Math.min((page + 1) * PAGE_SIZE, results.length)} of{" "}
              {results.length}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Previous page"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
              </Button>
              <span className="tabular-nums">
                {page + 1} / {pageCount}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Next page"
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                disabled={page >= pageCount - 1}
              >
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Explains why Run is disabled (button title + the collapsed-panel message).
function runReason({
  count,
  complete,
  incomplete,
  emptyRows,
}: {
  count: number;
  complete: number;
  incomplete: number;
  emptyRows: number;
}): string {
  if (count > 0) {
    return `Fix ${count} ${count === 1 ? "issue" : "issues"} to run the query.`;
  }
  if (complete === 0 && incomplete === 0 && emptyRows === 0) {
    return "Add a condition to run the query.";
  }
  if (complete === 0) {
    return "Finish your first condition to run the query.";
  }
  return "Finish or remove the incomplete conditions to run.";
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
      {children}
    </div>
  );
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

function compareCells(a: unknown, b: unknown): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

function toCsv(
  rows: Row[],
  fields: readonly { name: string; label: string }[],
): string {
  const header = fields.map((f) => csvCell(f.label)).join(",");
  const body = rows.map((row) =>
    fields.map((f) => csvCell(row[f.name])).join(","),
  );
  return [header, ...body].join("\n");
}

function csvCell(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
