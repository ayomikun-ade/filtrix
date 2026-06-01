"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, PlusSignIcon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";

export function AddBar({
  onAddCondition,
  onAddGroup,
}: {
  onAddCondition: () => void;
  onAddGroup: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Button variant="outline" size="sm" onClick={onAddCondition}>
        <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
        Add condition
      </Button>
      <Button variant="outline" size="sm" onClick={onAddGroup}>
        <HugeiconsIcon icon={Add01Icon} className="size-4" />
        Add group
      </Button>
    </div>
  );
}
