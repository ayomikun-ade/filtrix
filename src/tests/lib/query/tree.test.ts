import { describe, expect, it } from "vitest";

import {
  collectSubtreeIds,
  depthOf,
  getChildNodes,
  isDescendant,
} from "@/lib/query/tree";
import {
  createCondition,
  createGroup,
  type NodeId,
  type QueryNode,
} from "@/lib/query/types";

// root [AND]
//  ├─ condA
//  └─ sub [OR]
//      ├─ condB
//      └─ condC
function buildTree() {
  const root = createGroup(null, "AND");
  const condA = createCondition(root.id);
  const sub = createGroup(root.id, "OR");
  const condB = createCondition(sub.id);
  const condC = createCondition(sub.id);
  root.children = [condA.id, sub.id];
  sub.children = [condB.id, condC.id];
  const nodes: Record<NodeId, QueryNode> = {
    [root.id]: root,
    [condA.id]: condA,
    [sub.id]: sub,
    [condB.id]: condB,
    [condC.id]: condC,
  };
  return { nodes, root, condA, sub, condB, condC };
}

describe("tree helpers", () => {
  it("collectSubtreeIds returns the node plus all descendants", () => {
    const { nodes, root, condA, sub, condB, condC } = buildTree();
    expect(new Set(collectSubtreeIds(nodes, root.id))).toEqual(
      new Set([root.id, condA.id, sub.id, condB.id, condC.id]),
    );
    expect(collectSubtreeIds(nodes, condA.id)).toEqual([condA.id]);
    expect(new Set(collectSubtreeIds(nodes, sub.id))).toEqual(
      new Set([sub.id, condB.id, condC.id]),
    );
  });

  it("isDescendant walks the parent chain", () => {
    const { nodes, root, sub, condB } = buildTree();
    expect(isDescendant(nodes, root.id, condB.id)).toBe(true);
    expect(isDescendant(nodes, sub.id, condB.id)).toBe(true);
    expect(isDescendant(nodes, condB.id, sub.id)).toBe(false);
    expect(isDescendant(nodes, root.id, root.id)).toBe(false);
  });

  it("getChildNodes returns only direct children", () => {
    const { nodes, root, condA, sub } = buildTree();
    expect(getChildNodes(nodes, root.id).map((n) => n.id)).toEqual([
      condA.id,
      sub.id,
    ]);
    expect(getChildNodes(nodes, condA.id)).toEqual([]);
  });

  it("depthOf measures nesting from the root", () => {
    const { nodes, root, sub, condB } = buildTree();
    expect(depthOf(nodes, root.id)).toBe(0);
    expect(depthOf(nodes, sub.id)).toBe(1);
    expect(depthOf(nodes, condB.id)).toBe(2);
  });
});
