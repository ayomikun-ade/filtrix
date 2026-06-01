import { beforeEach, describe, expect, it } from "vitest";

import { parseQuery, serializeQuery } from "@/lib/query/serialize";
import { useQueryStore } from "@/lib/store/queryStore";

const store = () => useQueryStore.getState();
const tree = () => ({ rootId: store().rootId, nodes: store().nodes });

beforeEach(() => {
  store().reset();
});

describe("query serialization", () => {
  it("round-trips a valid query", () => {
    const id = store().addCondition(store().rootId)!;
    store().updateCondition(id, {
      field: "rating",
      operator: "gt",
      value: 8,
    });

    const result = parseQuery(serializeQuery(tree(), "movies"));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.document.source).toBe("movies");
      expect(result.document.tree.rootId).toBe(store().rootId);
      expect(Object.keys(result.document.tree.nodes)).toHaveLength(2);
    }
  });

  it("rejects input that is not JSON", () => {
    expect(parseQuery("{ not json").ok).toBe(false);
  });

  it("rejects a document with the wrong shape", () => {
    const result = parseQuery(
      JSON.stringify({ tree: { rootId: "r", nodes: {} } }),
    );
    expect(result.ok).toBe(false);
  });

  it("rejects a missing root node", () => {
    const result = parseQuery(
      JSON.stringify({
        source: "movies",
        tree: { rootId: "ghost", nodes: {} },
      }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/root/i);
  });

  it("rejects inconsistent parent/child links", () => {
    const result = parseQuery(
      JSON.stringify({
        source: "movies",
        tree: {
          rootId: "root",
          nodes: {
            root: {
              id: "root",
              type: "group",
              parentId: null,
              combinator: "AND",
              children: ["c1"],
              collapsed: false,
            },
            c1: {
              id: "c1",
              type: "condition",
              parentId: "somewhere-else",
              field: null,
              operator: null,
              value: null,
            },
          },
        },
      }),
    );
    expect(result.ok).toBe(false);
  });

  it("rejects an unknown operator", () => {
    const result = parseQuery(
      JSON.stringify({
        source: "movies",
        tree: {
          rootId: "root",
          nodes: {
            root: {
              id: "root",
              type: "group",
              parentId: null,
              combinator: "AND",
              children: ["c1"],
              collapsed: false,
            },
            c1: {
              id: "c1",
              type: "condition",
              parentId: "root",
              field: "rating",
              operator: "explode",
              value: 1,
            },
          },
        },
      }),
    );
    expect(result.ok).toBe(false);
  });
});
