"use client";

import { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Copy01Icon,
  Download01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";

import { toGraphql, toMongoString, toSql } from "@/lib/query/builders";
import { serializeQuery } from "@/lib/query/serialize";
import { getSource } from "@/lib/schema/sources";
import { useQueryStore } from "@/lib/store/queryStore";
import { useSourceStore } from "@/lib/store/sourceStore";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ExportFormat = "json" | "sql" | "mongo" | "graphql";

const FORMATS: {
  id: ExportFormat;
  label: string;
  ext: string;
  mime: string;
}[] = [
  { id: "json", label: "JSON", ext: "json", mime: "application/json" },
  { id: "sql", label: "SQL", ext: "sql", mime: "text/plain" },
  {
    id: "mongo",
    label: "MongoDB",
    ext: "mongo.json",
    mime: "application/json",
  },
  { id: "graphql", label: "GraphQL", ext: "graphql", mime: "text/plain" },
];

export function ExportDialog({ onClose }: { onClose: () => void }) {
  const rootId = useQueryStore((s) => s.rootId);
  const nodes = useQueryStore((s) => s.nodes);
  const sourceId = useSourceStore((s) => s.sourceId);
  const [format, setFormat] = useState<ExportFormat>("json");
  const [copied, setCopied] = useState(false);

  const content = useMemo(() => {
    const tree = { rootId, nodes };
    const source = getSource(sourceId);
    switch (format) {
      case "sql":
        return source ? toSql(tree, source) : "";
      case "mongo":
        return toMongoString(tree);
      case "graphql":
        return source ? toGraphql(tree, source) : "";
      default:
        return serializeQuery(tree, sourceId);
    }
  }, [rootId, nodes, sourceId, format]);

  async function copy() {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  function download() {
    const { ext, mime } = FORMATS.find((f) => f.id === format)!;
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `filtrix-${sourceId}-query.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog title="Export query" onClose={onClose}>
      <div
        role="tablist"
        aria-label="Export format"
        className="mb-3 inline-flex rounded-md border border-border p-0.5"
      >
        {FORMATS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={format === f.id}
            onClick={() => setFormat(f.id)}
            className={cn(
              "rounded-[5px] px-2.5 py-1 text-xs font-medium transition-colors",
              format === f.id
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <pre className="max-h-72 overflow-auto rounded-md border border-border bg-muted/40 p-3 font-mono text-xs whitespace-pre-wrap">
        {content}
      </pre>

      <div className="mt-3 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={copy}>
          <HugeiconsIcon
            icon={copied ? Tick02Icon : Copy01Icon}
            className="size-4"
          />
          {copied ? "Copied" : "Copy"}
        </Button>
        <Button size="sm" onClick={download}>
          <HugeiconsIcon icon={Download01Icon} className="size-4" />
          Download
        </Button>
      </div>
    </Dialog>
  );
}
