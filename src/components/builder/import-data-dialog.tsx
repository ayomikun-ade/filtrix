"use client";

import { useMemo, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Upload01Icon } from "@hugeicons/core-free-icons";

import { parseDataset } from "@/lib/schema/infer";
import { useCustomSourcesStore } from "@/lib/store/customSourcesStore";
import { useHistoryStore } from "@/lib/store/historyStore";
import { useQueryActions } from "@/lib/store/hooks";
import { useSourceStore } from "@/lib/store/sourceStore";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function ImportDataDialog({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const addSource = useCustomSourcesStore((s) => s.addSource);
  const setSource = useSourceStore((s) => s.setSource);
  const { reset } = useQueryActions();

  const result = useMemo(
    () => (text.trim() ? parseDataset(text, name) : null),
    [text, name],
  );

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!name) setName(file.name.replace(/\.json$/i, ""));
    file.text().then(setText);
  }

  function confirm() {
    if (!result?.ok) return;
    addSource(result.source);
    setSource(result.source.id);
    reset();
    useHistoryStore.getState().clear();
    onClose();
  }

  return (
    <Dialog title="Import data source" onClose={onClose}>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Source name (e.g. Customers)"
            aria-label="Source name"
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
          >
            <HugeiconsIcon icon={Upload01Icon} className="size-4" />
            Upload .json
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            onChange={onFile}
            className="hidden"
          />
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={9}
          aria-label="Dataset JSON"
          aria-invalid={Boolean(result && !result.ok)}
          placeholder={
            '[\n  { "name": "Ada", "age": 36, "active": true },\n  …\n]'
          }
          className="w-full rounded-md border border-border bg-background p-3 font-mono text-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 aria-invalid:border-destructive"
        />

        <p className="text-xs text-muted-foreground">
          Paste a JSON array of rows (or an object with a{" "}
          <code className="font-mono">rows</code> array). Field types are
          inferred from the data.
        </p>

        {result && !result.ok ? (
          <p className="text-xs text-destructive">{result.error}</p>
        ) : null}

        {result?.ok ? (
          <div className="space-y-1.5 rounded-md border border-border bg-muted/30 p-3">
            <span className="font-mono text-xs text-muted-foreground">
              {result.source.rows.length}{" "}
              {result.source.rows.length === 1 ? "row" : "rows"} ·{" "}
              {result.source.fields.length} fields
            </span>
            <div className="flex flex-wrap gap-1">
              {result.source.fields.map((field) => (
                <span
                  key={field.name}
                  className="inline-flex items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]"
                >
                  {field.label}
                  <span className="text-muted-foreground">{field.type}</span>
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={confirm}
            disabled={!result?.ok}
          >
            Add source
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
