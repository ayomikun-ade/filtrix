"use client";

import { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons";

import { generateQueries, type QueryFormat } from "@/lib/query/builders";
import { getSource } from "@/lib/schema/sources";
import { useQueryStore } from "@/lib/store/queryStore";
import { useSourceStore } from "@/lib/store/sourceStore";
import { cn } from "@/lib/utils";

const TABS: { id: QueryFormat; label: string }[] = [
  { id: "sql", label: "SQL" },
  { id: "mongo", label: "MongoDB" },
  { id: "graphql", label: "GraphQL" },
];

export function QueryPreview() {
  const rootId = useQueryStore((s) => s.rootId);
  const nodes = useQueryStore((s) => s.nodes);
  const sourceId = useSourceStore((s) => s.sourceId);
  const [format, setFormat] = useState<QueryFormat>("sql");
  const [copied, setCopied] = useState(false);

  const source = getSource(sourceId);
  const generated = useMemo(
    () => (source ? generateQueries({ rootId, nodes }, source) : null),
    [rootId, nodes, source],
  );

  if (!generated) return null;
  const code = generated[format];

  async function copy() {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 pt-2">
        <div className="flex items-center gap-4 text-xs font-medium">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFormat(tab.id)}
              aria-pressed={format === tab.id}
              className={cn(
                "border-b-2 pb-2 transition-colors",
                format === tab.id
                  ? "border-brand text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy query"
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <HugeiconsIcon
            icon={copied ? Tick02Icon : Copy01Icon}
            className="size-3.5"
          />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <p className="border-b border-border px-4 py-2 text-xs text-pretty text-muted-foreground">
        {generated.summary}
      </p>

      <pre className="flex-1 overflow-auto px-4 py-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-foreground">
        {code}
      </pre>
    </div>
  );
}
