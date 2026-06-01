"use client";

import { useMemo } from "react";

import { getSource } from "@/lib/schema/sources";
import { useQueryStore } from "@/lib/store/queryStore";
import { useSourceStore } from "@/lib/store/sourceStore";
import { countErrors, validateTree } from "@/lib/validation/validate";

export function useQueryValidity(): { count: number; valid: boolean } {
  const rootId = useQueryStore((s) => s.rootId);
  const nodes = useQueryStore((s) => s.nodes);
  const sourceId = useSourceStore((s) => s.sourceId);
  const source = getSource(sourceId);

  return useMemo(() => {
    if (!source) return { count: 0, valid: true };
    const count = countErrors(validateTree({ rootId, nodes }, source));
    return { count, valid: count === 0 };
  }, [rootId, nodes, source]);
}
