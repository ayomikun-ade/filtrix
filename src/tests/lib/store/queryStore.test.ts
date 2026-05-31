import { beforeEach, describe, expect, it } from "vitest";

import { isGroup, type ConditionNode, type GroupNode } from "@/lib/query/types";
import { useQueryStore } from "@/lib/store/queryStore";

const state = () => useQueryStore.getState();
const group = (id: string) => state().nodes[id] as GroupNode;

beforeEach(() => {
  state().reset();
});

describe("query store actions", () => {
  it("starts with a single empty root group", () => {
    const s = state();
    expect(Object.keys(s.nodes)).toHaveLength(1);
    expect(isGroup(s.nodes[s.rootId])).toBe(true);
  });

  it("addCondition appends a condition under its parent", () => {
    const { rootId } = state();
    const id = state().addCondition(rootId);
    expect(id).not.toBeNull();
    expect(group(rootId).children).toContain(id);
    expect(state().nodes[id!].parentId).toBe(rootId);
  });

  it("addGroup nests a group that can hold conditions", () => {
    const { rootId } = state();
    const gId = state().addGroup(rootId, "OR")!;
    const cId = state().addCondition(gId)!;
    expect(group(gId).combinator).toBe("OR");
    expect(group(gId).children).toContain(cId);
  });

  it("rejects adding under a missing or non-group parent", () => {
    expect(state().addCondition("nope")).toBeNull();
    const cId = state().addCondition(state().rootId)!;
    expect(state().addCondition(cId)).toBeNull();
  });

  it("removeNode prunes the whole subtree and detaches it", () => {
    const { rootId } = state();
    const gId = state().addGroup(rootId)!;
    const c1 = state().addCondition(gId)!;
    const c2 = state().addCondition(gId)!;
    expect(Object.keys(state().nodes)).toHaveLength(4);

    state().removeNode(gId);
    const s = state();
    expect(s.nodes[gId]).toBeUndefined();
    expect(s.nodes[c1]).toBeUndefined();
    expect(s.nodes[c2]).toBeUndefined();
    expect(group(rootId).children).not.toContain(gId);
    expect(Object.keys(s.nodes)).toHaveLength(1);
  });

  it("removeNode ignores the root", () => {
    const { rootId } = state();
    state().removeNode(rootId);
    expect(state().nodes[rootId]).toBeDefined();
  });

  it("updateCondition patches field, operator, and value", () => {
    const id = state().addCondition(state().rootId)!;
    state().updateCondition(id, { field: "rating", operator: "gt", value: 8 });
    const node = state().nodes[id] as ConditionNode;
    expect(node.field).toBe("rating");
    expect(node.operator).toBe("gt");
    expect(node.value).toBe(8);
  });

  it("setCombinator and toggleCollapsed mutate groups", () => {
    const { rootId } = state();
    state().setCombinator(rootId, "OR");
    expect(group(rootId).combinator).toBe("OR");

    expect(group(rootId).collapsed).toBe(false);
    state().toggleCollapsed(rootId);
    expect(group(rootId).collapsed).toBe(true);
    state().toggleCollapsed(rootId, false);
    expect(group(rootId).collapsed).toBe(false);
  });

  it("reorderWithinGroup moves a child to a new index", () => {
    const { rootId } = state();
    const a = state().addCondition(rootId)!;
    const b = state().addCondition(rootId)!;
    const c = state().addCondition(rootId)!;
    expect(group(rootId).children).toEqual([a, b, c]);

    state().reorderWithinGroup(rootId, 0, 2);
    expect(group(rootId).children).toEqual([b, c, a]);
  });

  it("moveNode relocates a node across groups", () => {
    const { rootId } = state();
    const g1 = state().addGroup(rootId)!;
    const g2 = state().addGroup(rootId)!;
    const c = state().addCondition(g1)!;

    state().moveNode(c, g2, 0);
    expect(group(g1).children).not.toContain(c);
    expect(group(g2).children).toContain(c);
    expect(state().nodes[c].parentId).toBe(g2);
  });

  it("moveNode refuses to create a cycle", () => {
    const { rootId } = state();
    const outer = state().addGroup(rootId)!;
    const inner = state().addGroup(outer)!;

    state().moveNode(outer, inner, 0);
    expect(state().nodes[outer].parentId).toBe(rootId);
    expect(group(inner).children).not.toContain(outer);
  });

  it("keeps references of untouched nodes (structural sharing)", () => {
    const { rootId } = state();
    const a = state().addCondition(rootId)!;
    const before = state().nodes[a];
    state().addCondition(rootId);
    expect(state().nodes[a]).toBe(before);
  });

  it("reset returns to a fresh single-root tree", () => {
    const { rootId } = state();
    state().addCondition(rootId);
    state().addGroup(rootId);
    expect(Object.keys(state().nodes).length).toBeGreaterThan(1);

    state().reset();
    expect(Object.keys(state().nodes)).toHaveLength(1);
  });
});
