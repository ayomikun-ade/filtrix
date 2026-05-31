import { useShallow } from "zustand/react/shallow";

import { isGroup, type NodeId, type QueryNode } from "@/lib/query/types";
import { useQueryStore } from "@/lib/store/queryStore";

const EMPTY: readonly NodeId[] = [];

export function useNode(id: NodeId): QueryNode | undefined {
  return useQueryStore((s) => s.nodes[id]);
}

// Returns the group's child ids. The array reference is stable (immer structural
// sharing) until the group's children actually change, so subscribers only
// re-render when their own children move.
export function useChildren(id: NodeId): readonly NodeId[] {
  return useQueryStore((s) => {
    const node = s.nodes[id];
    return node && isGroup(node) ? node.children : EMPTY;
  });
}

export function useRootId(): NodeId {
  return useQueryStore((s) => s.rootId);
}

export function useNodeCount(): number {
  return useQueryStore((s) => Object.keys(s.nodes).length);
}

export function useQueryActions() {
  return useQueryStore(
    useShallow((s) => ({
      addCondition: s.addCondition,
      addGroup: s.addGroup,
      removeNode: s.removeNode,
      updateCondition: s.updateCondition,
      setCombinator: s.setCombinator,
      toggleCollapsed: s.toggleCollapsed,
      moveNode: s.moveNode,
      reorderWithinGroup: s.reorderWithinGroup,
      loadTree: s.loadTree,
      reset: s.reset,
    })),
  );
}
