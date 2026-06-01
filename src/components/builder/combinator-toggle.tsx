"use client";

import type { Combinator } from "@/lib/query/types";
import { cn } from "@/lib/utils";

const OPTIONS: Combinator[] = ["AND", "OR"];

export function CombinatorToggle({
  value,
  onChange,
}: {
  value: Combinator;
  onChange: (value: Combinator) => void;
}) {
  return (
    <div className="inline-flex overflow-hidden rounded-md border border-border text-xs font-medium">
      {OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={value === option}
          onClick={() => onChange(option)}
          className={cn(
            "px-2.5 py-1 transition-colors",
            value === option
              ? "bg-brand text-brand-foreground"
              : "bg-background text-muted-foreground hover:text-foreground",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
