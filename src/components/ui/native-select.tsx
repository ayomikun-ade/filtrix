import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";

function NativeSelect({
  className,
  children,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <div className="relative inline-flex w-full">
      <select
        data-slot="native-select"
        className={cn(
          "h-8 w-full appearance-none rounded-md border border-input bg-background py-1 pr-7 pl-2.5 text-sm transition-colors outline-none",
          "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <HugeiconsIcon
        icon={ArrowDown01Icon}
        className="pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}

export { NativeSelect };
