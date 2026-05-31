import { cn } from "@/lib/utils";

/** Filtrix wordmark — a single lime tile beside a lowercase mono label. */
export function Brand({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono text-sm font-medium tracking-tight",
        className,
      )}
    >
      <span className="size-2.5 rounded-[2px] bg-brand" aria-hidden />
      filtrix
    </span>
  );
}
