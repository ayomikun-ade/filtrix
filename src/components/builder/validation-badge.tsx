"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon } from "@hugeicons/core-free-icons";

import { useQueryValidity } from "@/lib/validation/useQueryValidity";

export function ValidationBadge() {
  const { count } = useQueryValidity();
  if (count === 0) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-destructive/40 bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
      <HugeiconsIcon icon={Alert02Icon} className="size-3.5" />
      {count} {count === 1 ? "issue" : "issues"}
    </span>
  );
}
