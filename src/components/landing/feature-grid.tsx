import { HugeiconsIcon } from "@hugeicons/react";
import {
  Database02Icon,
  FlashIcon,
  GitBranchIcon,
  PlayCircleIcon,
  SourceCodeIcon,
  ValidationIcon,
} from "@hugeicons/core-free-icons";

type Feature = {
  icon: typeof GitBranchIcon;
  title: string;
  body: string;
};

const FEATURES: Feature[] = [
  {
    icon: GitBranchIcon,
    title: "Unlimited nesting",
    body: "Group conditions with AND/OR to any depth. Collapse, reorder, and drag rules between groups.",
  },
  {
    icon: Database02Icon,
    title: "Schema-driven",
    body: "Fields, operators, and inputs adapt to the data source — date pickers for dates, dropdowns for enums.",
  },
  {
    icon: SourceCodeIcon,
    title: "Three query formats",
    body: "Watch your query render to SQL, a MongoDB filter object, and a GraphQL filter in real time.",
  },
  {
    icon: PlayCircleIcon,
    title: "Execution simulator",
    body: "Run queries against sample datasets with live result counts, sorting, pagination, and virtualization.",
  },
  {
    icon: ValidationIcon,
    title: "Validation engine",
    body: "Incompatible operators, empty groups, and malformed values are caught and surfaced inline.",
  },
  {
    icon: FlashIcon,
    title: "Built for scale",
    body: "A normalized query tree with isolated, memoized nodes keeps deep, heavy queries responsive.",
  },
];

export function FeatureGrid() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-20">
      <div className="mb-8 flex flex-col gap-2 border-t border-border pt-8">
        <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          Capabilities
        </span>
        <h2 className="text-2xl font-semibold tracking-tight">
          Everything the query needs, nothing it doesn&apos;t.
        </h2>
      </div>

      <ul className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <li
            key={feature.title}
            className="flex flex-col gap-3 bg-card p-5 transition-colors hover:bg-muted/40"
          >
            <span className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-background">
              <HugeiconsIcon icon={feature.icon} className="size-4.5" />
            </span>
            <h3 className="text-sm font-medium">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
