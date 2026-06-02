"use client";

import { useMemo } from "react";

import { getSource } from "@/lib/schema/sources";
import { useQueryStore } from "@/lib/store/queryStore";
import { useSourceStore } from "@/lib/store/sourceStore";
import {
  analyzeQuery,
  countErrors,
  validateTree,
} from "@/lib/validation/validate";

export interface QueryValidity {
  count: number; // error messages (red badge + "fix N issues")
  valid: boolean; // no errors
  runnable: boolean; // safe to execute
  incomplete: number; // engaged-but-incomplete conditions (amber)
  complete: number; // runnable conditions
  emptyRows: number; // untouched conditions
}

export function useQueryValidity(): QueryValidity {
  const rootId = useQueryStore((s) => s.rootId);
  const nodes = useQueryStore((s) => s.nodes);
  const sourceId = useSourceStore((s) => s.sourceId);
  const source = getSource(sourceId);

  return useMemo(() => {
    if (!source) {
      return {
        count: 0,
        valid: true,
        runnable: false,
        incomplete: 0,
        complete: 0,
        emptyRows: 0,
      };
    }
    const tree = { rootId, nodes };
    const count = countErrors(validateTree(tree, source));
    const a = analyzeQuery(tree, source);
    return {
      count,
      valid: count === 0,
      runnable: a.runnable,
      incomplete: a.incomplete,
      complete: a.complete,
      emptyRows: a.emptyRows,
    };
  }, [rootId, nodes, source]);
}
