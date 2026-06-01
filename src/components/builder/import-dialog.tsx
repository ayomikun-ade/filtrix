"use client";

import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";

import { parseQuery } from "@/lib/query/serialize";
import { getSource } from "@/lib/schema/sources";
import { useHistoryStore } from "@/lib/store/historyStore";
import { useQueryStore } from "@/lib/store/queryStore";
import { useSourceStore } from "@/lib/store/sourceStore";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const importSchema = z
  .object({ json: z.string().min(1, "Paste a query JSON to import.") })
  .superRefine((data, ctx) => {
    if (!data.json.trim()) return;
    const result = parseQuery(data.json);
    if (!result.ok) {
      ctx.addIssue({ code: "custom", path: ["json"], message: result.error });
    }
  });

type ImportForm = z.infer<typeof importSchema>;

export function ImportDialog({ onClose }: { onClose: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ImportForm>({
    resolver: standardSchemaResolver(importSchema),
    defaultValues: { json: "" },
  });
  const setSource = useSourceStore((s) => s.setSource);
  const loadTree = useQueryStore((s) => s.loadTree);

  function onSubmit(data: ImportForm) {
    const result = parseQuery(data.json);
    if (!result.ok) return;
    const { document } = result;
    if (getSource(document.source)) setSource(document.source);
    loadTree(document.tree);
    useHistoryStore.getState().clear();
    onClose();
  }

  return (
    <Dialog title="Import query" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <textarea
          {...register("json")}
          rows={10}
          aria-label="Query JSON"
          aria-invalid={Boolean(errors.json)}
          placeholder={'{ "source": "movies", "tree": { … } }'}
          className="w-full rounded-md border border-border bg-background p-3 font-mono text-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 aria-invalid:border-destructive"
        />
        {errors.json ? (
          <p className="text-xs text-destructive">{errors.json.message}</p>
        ) : null}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm">
            Import
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
