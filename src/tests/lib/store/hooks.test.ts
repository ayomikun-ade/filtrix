import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import type { ConditionNode } from "@/lib/query/types";
import { useChildren, useNode, useRootId } from "@/lib/store/hooks";
import { useQueryStore } from "@/lib/store/queryStore";

const store = () => useQueryStore.getState();

beforeEach(() => {
  store().reset();
});

describe("store selector hooks", () => {
  it("useNode returns the node and reflects updates", () => {
    const id = store().addCondition(store().rootId)!;
    const { result } = renderHook(() => useNode(id));
    expect(result.current?.type).toBe("condition");

    act(() => {
      store().updateCondition(id, { field: "rating" });
    });
    expect((result.current as ConditionNode).field).toBe("rating");
  });

  it("useChildren tracks a group's child ids", () => {
    const { result } = renderHook(() => useChildren(useRootId()));
    expect(result.current).toEqual([]);

    let id = "";
    act(() => {
      id = store().addCondition(store().rootId)!;
    });
    expect(result.current).toContain(id);
  });

  it("isolates re-renders: editing one node does not re-render a sibling", () => {
    const a = store().addCondition(store().rootId)!;
    const b = store().addCondition(store().rootId)!;
    const renders = { a: 0, b: 0 };

    renderHook(() => {
      renders.a += 1;
      return useNode(a);
    });
    renderHook(() => {
      renders.b += 1;
      return useNode(b);
    });

    const aBefore = renders.a;
    const bBefore = renders.b;

    act(() => {
      store().updateCondition(a, { field: "x" });
    });

    expect(renders.a).toBeGreaterThan(aBefore);
    expect(renders.b).toBe(bBefore);
  });
});
