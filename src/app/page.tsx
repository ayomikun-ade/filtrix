import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-start justify-center gap-6 px-6 py-16">
      <div className="flex w-full items-center justify-between">
        <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          Filtrix
        </span>
        <ThemeToggle />
      </div>

      <h1 className="text-3xl font-semibold tracking-tight">
        Visual Query Builder
      </h1>
      <p className="max-w-prose text-muted-foreground">
        Construct complex, deeply nested queries through a graphical interface —
        then preview SQL, MongoDB, and GraphQL in real time and run them against
        sample datasets. The builder UI lands in the next milestones.
      </p>

      <div className="flex items-center gap-3">
        <Button>Primary action</Button>
        <Button variant="outline">Secondary</Button>
      </div>

      <div className="mt-2 inline-flex items-center gap-2 rounded-md border border-border px-2.5 py-1 font-mono text-xs text-muted-foreground">
        <span className="size-3 rounded-[3px] bg-brand" aria-hidden />
        accent #a6f236
      </div>
    </main>
  );
}
