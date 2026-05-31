import { describe, expect, it } from "vitest";

import {
  createCondition,
  createEmptyTree,
  createGroup,
  isCondition,
  isGroup,
} from "@/lib/query/types";

describe("query tree factories", () => {
  it("createEmptyTree has a single root group with no parent or children", () => {
    const tree = createEmptyTree();
    const root = tree.nodes[tree.rootId];

    expect(isGroup(root)).toBe(true);
    expect(root.parentId).toBeNull();
    if (isGroup(root)) {
      expect(root.children).toEqual([]);
      expect(root.combinator).toBe("AND");
    }
  });

  it("createGroup defaults to AND and is collapsible", () => {
    const group = createGroup("parent-1");
    expect(group.type).toBe("group");
    expect(group.parentId).toBe("parent-1");
    expect(group.combinator).toBe("AND");
    expect(group.collapsed).toBe(false);
    expect(createGroup("p", "OR").combinator).toBe("OR");
  });

  it("createCondition starts empty under its parent", () => {
    const condition = createCondition("group-1");
    expect(condition.type).toBe("condition");
    expect(condition.parentId).toBe("group-1");
    expect(condition.field).toBeNull();
    expect(condition.operator).toBeNull();
    expect(condition.value).toBeNull();
  });

  it("generates unique ids across nodes", () => {
    const ids = [
      createGroup(null).id,
      createGroup(null).id,
      createCondition("g").id,
      createCondition("g").id,
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("guards discriminate node types", () => {
    const group = createGroup(null);
    const condition = createCondition(group.id);
    expect(isGroup(group)).toBe(true);
    expect(isCondition(group)).toBe(false);
    expect(isCondition(condition)).toBe(true);
    expect(isGroup(condition)).toBe(false);
  });
});
