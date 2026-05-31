"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle color theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {/* Icon visibility is driven purely by the `.dark` class to avoid any
          server/client hydration mismatch — no mounted-state flag needed. */}
      <HugeiconsIcon icon={Moon02Icon} className="size-4 dark:hidden" />
      <HugeiconsIcon icon={Sun03Icon} className="hidden size-4 dark:block" />
      <span className="sr-only">Toggle color theme</span>
    </Button>
  );
}
