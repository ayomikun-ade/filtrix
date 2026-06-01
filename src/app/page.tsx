import Link from "next/link";

import { Brand } from "@/components/brand";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { Hero } from "@/components/landing/hero";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">
          <Brand />
          <nav className="flex items-center gap-1.5">
            <ThemeToggle />
            <Link
              href="/builder"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Open builder
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Hero />
        <FeatureGrid />
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 font-mono text-xs text-muted-foreground sm:flex-row">
          <Brand />
          <span>
            Built by —{" "}
            <a
              href="https://github.com/ayomikun-ade"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              ayomikun
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
