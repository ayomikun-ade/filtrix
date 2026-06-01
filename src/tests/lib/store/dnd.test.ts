import { beforeEach, describe, expect, it } from "vitest";

import { planDrag } from "@/lib/store/dnd";
import { useQueryStore } from "@/lib/store/queryStore";

const store = () => useQueryStore.getState();
const nodes = () => store().nodes;

beforeEach(() => {
  store().reset();
});

describe("planDrag", () => {
  it("reorders within the same group", () => {
    const root = store().rootId;
    const a = store().addCondition(root)!;
    store().addCondition(root);
    const c = store().addCondition(root)!;

    expect(planDrag(nodes(), a, c)).toEqual({
      type: "reorder",
      groupId: root,
      from: 0,
      to: 2,
    });
  });

  it("moves a node into another group", () => {
    const root = store().rootId;
    const a = store().addCondition(root)!;
    const group = store().addGroup(root)!;
    const b = store().addCondition(group)!;

    expect(planDrag(nodes(), a, b)).toEqual({
      type: "move",
      id: a,
      parentId: group,
      index: 0,
    });
  });

  it("refuses to move a group into its own descendant", () => {
    const root = store().rootId;
    const outer = store().addGroup(root)!;
    const inner = store().addGroup(outer)!;
    const leaf = store().addCondition(inner)!;

    // dragging `outer` over `leaf` would nest outer inside its own descendant
    expect(planDrag(nodes(), outer, leaf)).toBeNull();
  });

  it("returns null for no-ops and the root", () => {
    const root = store().rootId;
    const a = store().addCondition(root)!;
    expect(planDrag(nodes(), a, a)).toBeNull();
    expect(planDrag(nodes(), root, a)).toBeNull();
    expect(planDrag(nodes(), a, "missing")).toBeNull();
  });
});
