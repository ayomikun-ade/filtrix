"use client";

import Link from "next/link";
import { motion, MotionConfig } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

import { riseItem, staggerContainer } from "@/lib/motion";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <MotionConfig reducedMotion="user">
      <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.1fr_1fr] lg:py-24">
        <motion.div
          className="flex flex-col items-start gap-6"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.span
            variants={riseItem}
            className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 font-mono text-xs text-muted-foreground"
          >
            <span className="size-1.5 rounded-full bg-brand" aria-hidden />
            Visual query builder
          </motion.span>

          <motion.h1
            variants={riseItem}
            className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl"
          >
            Build complex queries without writing the syntax.
          </motion.h1>

          <motion.p
            variants={riseItem}
            className="max-w-xl text-base text-pretty text-muted-foreground sm:text-lg"
          >
            Compose deeply nested AND/OR logic through a graphical interface,
            preview it as SQL, MongoDB, and GraphQL in real time, then run it
            against sample datasets — all in the browser.
          </motion.p>

          <motion.div
            variants={riseItem}
            className="flex flex-wrap items-center gap-3"
          >
            <Link
              href="/builder"
              className={cn(buttonVariants({ size: "lg" }), "group/cta")}
            >
              Open the builder
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                className="size-4 transition-transform group-hover/cta:translate-x-0.5"
              />
            </Link>
            <a
              href="https://github.com/ayomikun-ade/filtrix"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              View source
            </a>
          </motion.div>
        </motion.div>

        <HeroPreview />
      </section>
    </MotionConfig>
  );
}

/** Decorative snapshot of the builder that assembles itself on load. */
function HeroPreview() {
  return (
    <motion.div
      className="overflow-hidden rounded-lg border border-border bg-card text-sm shadow-none"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      transition={{ delayChildren: 0.25 }}
    >
      <motion.div
        variants={riseItem}
        className="flex items-center justify-between border-b border-border px-4 py-2.5"
      >
        <span className="font-mono text-xs text-muted-foreground">
          source: <span className="text-foreground">movies</span>
        </span>
        <Pill>AND</Pill>
      </motion.div>

      <div className="space-y-2 p-4">
        <ConditionRow field="genre" op="equals" value='"Sci-Fi"' />
        <ConditionRow field="rating" op="&gt;" value="8" />

        <motion.div
          variants={riseItem}
          className="relative space-y-2 rounded-md border border-dashed border-border py-3 pr-3 pl-4"
        >
          <div className="absolute top-3 left-4 flex items-center">
            <Pill tone="brand">OR</Pill>
          </div>
          <div className="space-y-2 pt-7">
            <ConditionRow field="year" op="&ge;" value="2010" />
            <ConditionRow field="awards" op="contains" value='"Oscar"' />
          </div>
        </motion.div>
      </div>

      <motion.div
        variants={riseItem}
        className="border-t border-border bg-muted/40 px-4 py-3 font-mono text-xs leading-relaxed text-muted-foreground"
      >
        <span className="text-foreground">SELECT</span> * <br />
        <span className="text-foreground">FROM</span> movies <br />
        <span className="text-foreground">WHERE</span> genre =
        &apos;Sci-Fi&apos; <span className="text-foreground">AND</span> rating
        &gt; 8 <span className="text-foreground">AND</span> (year &ge; 2010{" "}
        <span className="text-foreground">OR</span> awards LIKE
        &apos;%Oscar%&apos;)
      </motion.div>
    </motion.div>
  );
}

function ConditionRow({
  field,
  op,
  value,
}: {
  field: string;
  op: string;
  value: string;
}) {
  return (
    <motion.div
      variants={riseItem}
      className="flex items-center gap-2 font-mono text-xs"
    >
      <span className="rounded-lg border border-border bg-background px-2 py-1 text-foreground">
        {field}
      </span>
      <span className="px-1 text-muted-foreground">{op}</span>
      <span className="rounded-lg border border-border bg-background px-2 py-1 text-foreground">
        {value}
      </span>
    </motion.div>
  );
}

function Pill({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "brand";
}) {
  return (
    <span
      className={cn(
        "rounded-lg px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-wide",
        tone === "brand"
          ? "bg-brand text-brand-foreground"
          : "border border-border text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}
