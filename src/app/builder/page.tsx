import type { Metadata } from "next";

import { BuilderApp } from "@/components/builder/builder-app";

export const metadata: Metadata = {
  title: "Builder — Filtrix",
};

export default function BuilderPage() {
  return <BuilderApp />;
}
