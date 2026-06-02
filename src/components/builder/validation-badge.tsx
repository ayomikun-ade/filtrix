"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon, AlertCircleIcon } from "@hugeicons/core-free-icons";

import { useQueryValidity } from "@/lib/validation/useQueryValidity";

export function ValidationBadge() {
  const { count, incomplete } = useQueryValidity();
  if (count === 0 && incomplete === 0) return null;

  return (
    <span className="inline-flex items-center gap-1.5">
      {count > 0 ? (
        <span className="inline-flex items-center gap-1 rounded-md border border-destructive/40 bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
          <HugeiconsIcon icon={Alert02Icon} className="size-3.5" />
          {count} {count === 1 ? "issue" : "issues"}
        </span>
      ) : null}
      {incomplete > 0 ? (
        <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-500">
          <HugeiconsIcon icon={AlertCircleIcon} className="size-3.5" />
          {incomplete} incomplete
        </span>
      ) : null}
    </span>
  );
}
