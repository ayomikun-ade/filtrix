import { isGroup, type NodeId, type QueryNode } from "@/lib/query/types";

type Nodes = Record<NodeId, QueryNode>;

export function getNode(nodes: Nodes, id: NodeId): QueryNode | undefined {
  return nodes[id];
}

export function getChildNodes(nodes: Nodes, id: NodeId): QueryNode[] {
  const node = nodes[id];
  if (!node || !isGroup(node)) return [];
  return node.children
    .map((childId) => nodes[childId])
    .filter((child): child is QueryNode => Boolean(child));
}

// The node itself plus every descendant id (depth-first).
export function collectSubtreeIds(nodes: Nodes, id: NodeId): NodeId[] {
  const node = nodes[id];
  if (!node || !isGroup(node)) return [id];
  const out: NodeId[] = [id];
  for (const childId of node.children) {
    out.push(...collectSubtreeIds(nodes, childId));
  }
  return out;
}

// True when `candidateId` lives anywhere inside `ancestorId`'s subtree.
export function isDescendant(
  nodes: Nodes,
  ancestorId: NodeId,
  candidateId: NodeId,
): boolean {
  let current = nodes[candidateId]?.parentId ?? null;
  while (current) {
    if (current === ancestorId) return true;
    current = nodes[current]?.parentId ?? null;
  }
  return false;
}

export function depthOf(nodes: Nodes, id: NodeId): number {
  let depth = 0;
  let current = nodes[id]?.parentId ?? null;
  while (current) {
    depth += 1;
    current = nodes[current]?.parentId ?? null;
  }
  return depth;
}
