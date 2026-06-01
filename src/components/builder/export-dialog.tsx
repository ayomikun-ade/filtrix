"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Copy01Icon,
  Download01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";

import { serializeQuery } from "@/lib/query/serialize";
import { useQueryStore } from "@/lib/store/queryStore";
import { useSourceStore } from "@/lib/store/sourceStore";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ExportDialog({ onClose }: { onClose: () => void }) {
  const rootId = useQueryStore((s) => s.rootId);
  const nodes = useQueryStore((s) => s.nodes);
  const sourceId = useSourceStore((s) => s.sourceId);
  const [copied, setCopied] = useState(false);

  const json = serializeQuery({ rootId, nodes }, sourceId);

  async function copy() {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(json);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  function download() {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `filtrix-${sourceId}-query.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog title="Export query" onClose={onClose}>
      <pre className="max-h-72 overflow-auto rounded-md border border-border bg-muted/40 p-3 font-mono text-xs">
        {json}
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
