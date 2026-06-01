"use client";

import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";

import { usePresetsStore } from "@/lib/store/presetsStore";
import { useQueryStore } from "@/lib/store/queryStore";
import { useSourceStore } from "@/lib/store/sourceStore";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const presetSchema = z.object({
  name: z.string().trim().min(1, "Give your preset a name.").max(60),
});
type PresetForm = z.infer<typeof presetSchema>;

export function SavePresetDialog({ onClose }: { onClose: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PresetForm>({
    resolver: standardSchemaResolver(presetSchema),
    defaultValues: { name: "" },
  });
  const rootId = useQueryStore((s) => s.rootId);
  const nodes = useQueryStore((s) => s.nodes);
  const sourceId = useSourceStore((s) => s.sourceId);
  const save = usePresetsStore((s) => s.save);

  function onSubmit(data: PresetForm) {
    save(data.name.trim(), sourceId, { rootId, nodes });
    onClose();
  }

  return (
    <Dialog title="Save preset" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <Input
          {...register("name")}
          autoFocus
          placeholder="e.g. Top Sci-Fi after 2015"
          aria-label="Preset name"
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name ? (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        ) : null}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm">
            Save
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
