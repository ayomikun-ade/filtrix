import { isDescendant } from "@/lib/query/tree";
import { isGroup, type NodeId, type QueryNode } from "@/lib/query/types";

type Nodes = Record<NodeId, QueryNode>;

export type DragPlan =
  | { type: "reorder"; groupId: NodeId; from: number; to: number }
  | { type: "move"; id: NodeId; parentId: NodeId; index: number }
  | null;

export function planDrag(
  nodes: Nodes,
  activeId: NodeId,
  overId: NodeId,
): DragPlan {
  if (activeId === overId) return null;

  const active = nodes[activeId];
  const over = nodes[overId];
  if (!active || !over) return null;

  const activeParent = active.parentId;
  const overParent = over.parentId;
  if (!activeParent || !overParent) return null; // the root never moves

  if (activeParent === overParent) {
    const group = nodes[activeParent];
    if (!group || !isGroup(group)) return null;
    const from = group.children.indexOf(activeId);
    const to = group.children.indexOf(overId);
    if (from < 0 || to < 0) return null;
    return { type: "reorder", groupId: activeParent, from, to };
  }

  // Never move a group into itself or one of its own descendants.
  if (activeId === overParent || isDescendant(nodes, activeId, overParent)) {
    return null;
  }
  const parent = nodes[overParent];
  if (!parent || !isGroup(parent)) return null;
  return {
    type: "move",
    id: activeId,
    parentId: overParent,
    index: parent.children.indexOf(overId),
  };
}
