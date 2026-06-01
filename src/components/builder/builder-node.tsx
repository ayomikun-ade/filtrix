"use client";

import type { NodeId } from "@/lib/query/types";
import { useNode } from "@/lib/store/hooks";
import { QueryCondition } from "@/components/builder/query-condition";
import { QueryGroup } from "@/components/builder/query-group";

// Dispatches a child id to the right renderer. Each node subscribes to its own
// slice, so a change to one never re-renders its siblings.
export function BuilderNode({ id }: { id: NodeId }) {
  const node = useNode(id);
  if (!node) return null;
  return node.type === "group" ? (
    <QueryGroup id={id} />
  ) : (
    <QueryCondition id={id} />
  );
}
