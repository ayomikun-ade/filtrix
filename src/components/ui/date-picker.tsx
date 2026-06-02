"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar03Icon } from "@hugeicons/core-free-icons";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Dates are stored as `yyyy-mm-dd` strings (matching the dataset rows and the
// query evaluator). Parsing uses explicit args, so no argless `new Date()`.
function parseISO(iso: string | null): Date | undefined {
  if (!iso) return undefined;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Deterministic display (no locale) so SSR and client agree.
function formatDisplay(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

// Bounds the year dropdown so any year is one click away (the datasets span
// decades). Explicit args, so no argless `new Date()`.
const START_MONTH = new Date(1900, 0);
const END_MONTH = new Date(2035, 11);

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  ariaLabel,
  invalid,
  className,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  ariaLabel?: string;
  invalid?: boolean;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = parseISO(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        className={cn(
          "flex h-8 w-full items-center gap-2 rounded-lg border border-input bg-transparent px-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
          "dark:bg-input/30 dark:hover:bg-input/50",
          !selected && "text-muted-foreground",
          className,
        )}
      >
        <HugeiconsIcon
          icon={Calendar03Icon}
          className="size-3.5 shrink-0 text-muted-foreground"
        />
        <span className="truncate">
          {selected ? formatDisplay(selected) : placeholder}
        </span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          startMonth={START_MONTH}
          endMonth={END_MONTH}
          defaultMonth={selected}
          selected={selected}
          onSelect={(date) => {
            onChange(date ? toISO(date) : null);
            setOpen(false);
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
