import { describe, expect, it } from "vitest";

import {
  createCondition,
  createGroup,
  type ConditionNode,
  type QueryNode,
} from "@/lib/query/types";
import { movies } from "@/lib/schema/datasets/movies";
import {
  analyzeQuery,
  conditionStatus,
  countErrors,
  validateCondition,
  validateGroup,
  validateTree,
} from "@/lib/validation/validate";

function cond(partial: Partial<ConditionNode>): ConditionNode {
  return { ...createCondition("parent"), ...partial };
}

describe("validateCondition", () => {
  it("does not flag incomplete rows (no field, no operator, empty value)", () => {
    expect(validateCondition(cond({}), movies)).toEqual([]);
    expect(validateCondition(cond({ field: "rating" }), movies)).toEqual([]);
    expect(
      validateCondition(
        cond({ field: "rating", operator: "gt", value: null }),
        movies,
      ),
    ).toEqual([]);
    expect(
      validateCondition(
        cond({ field: "genre", operator: "in", value: [] }),
        movies,
      ),
    ).toEqual([]);
    expect(
      validateCondition(
        cond({ field: "rating", operator: "between", value: [null, null] }),
        movies,
      ),
    ).toEqual([]);
  });

  it("rejects operators incompatible with the field type", () => {
    const errors = validateCondition(
      cond({ field: "rating", operator: "contains", value: "x" }),
      movies,
    );
    expect(errors[0]).toMatch(/can't be applied/i);
  });

  it("flags non-numeric values on number fields", () => {
    expect(
      validateCondition(
        cond({ field: "rating", operator: "gt", value: "abc" }),
        movies,
      ),
    ).toEqual(["Value must be a number."]);
  });

  it("accepts a valid unary condition", () => {
    expect(
      validateCondition(
        cond({ field: "rating", operator: "gt", value: 8 }),
        movies,
      ),
    ).toEqual([]);
  });

  it("validates ranges for `between`", () => {
    expect(
      validateCondition(
        cond({ field: "rating", operator: "between", value: [9, 7] }),
        movies,
      ),
    ).toEqual(["Range start must be less than or equal to the end."]);

    expect(
      validateCondition(
        cond({ field: "rating", operator: "between", value: [7, 9] }),
        movies,
      ),
    ).toEqual([]);
  });

  it("validates regular expressions", () => {
    expect(
      validateCondition(
        cond({ field: "title", operator: "regex", value: "(" }),
        movies,
      ),
    ).toEqual(["Invalid regular expression."]);
    expect(
      validateCondition(
        cond({ field: "title", operator: "regex", value: "^A" }),
        movies,
      ),
    ).toEqual([]);
  });

  it("validates dates and needs no value for null checks", () => {
    expect(
      validateCondition(
        cond({ field: "releaseDate", operator: "after", value: "nope" }),
        movies,
      ),
    ).toEqual(["Value must be a valid date."]);
    expect(
      validateCondition(
        cond({ field: "rating", operator: "isNull", value: null }),
        movies,
      ),
    ).toEqual([]);
  });
});

describe("validateGroup", () => {
  it("allows an empty root but rejects empty nested groups", () => {
    const root = createGroup(null);
    expect(validateGroup(root, true)).toEqual([]);

    const nested = createGroup(root.id);
    expect(validateGroup(nested, false)).toEqual([
      "Group is empty — add a rule or remove it.",
    ]);

    nested.children = ["c1"];
    expect(validateGroup(nested, false)).toEqual([]);
  });
});

describe("validateTree", () => {
  it("collects errors keyed by node and counts them", () => {
    const root = createGroup(null);
    const bad = cond({
      parentId: root.id,
      field: "rating",
      operator: "between",
      value: [9, 7],
    });
    const emptyGroup = createGroup(root.id);
    root.children = [bad.id, emptyGroup.id];

    const nodes: Record<string, QueryNode> = {
      [root.id]: root,
      [bad.id]: bad,
      [emptyGroup.id]: emptyGroup,
    };
    const map = validateTree({ rootId: root.id, nodes }, movies);

    expect(map[bad.id][0].message).toMatch(/range start/i);
    expect(map[emptyGroup.id][0].message).toMatch(/empty/i);
    expect(map[root.id]).toBeUndefined();
    expect(countErrors(map)).toBe(2);
  });
});

describe("conditionStatus", () => {
  it("classifies a row by how far along it is", () => {
    expect(conditionStatus(cond({}), movies)).toBe("empty");
    // A field has been chosen but the row isn't runnable yet → engaged/incomplete.
    expect(conditionStatus(cond({ field: "rating" }), movies)).toBe(
      "incomplete",
    );
    expect(
      conditionStatus(
        cond({ field: "rating", operator: "gt", value: null }),
        movies,
      ),
    ).toBe("incomplete");
    expect(
      conditionStatus(
        cond({ field: "rating", operator: "contains", value: "x" }),
        movies,
      ),
    ).toBe("invalid");
    expect(
      conditionStatus(
        cond({ field: "rating", operator: "gt", value: 8 }),
        movies,
      ),
    ).toBe("complete");
  });
});

describe("analyzeQuery", () => {
  function treeWith(...conditions: ConditionNode[]) {
    const root = createGroup(null);
    root.children = conditions.map((c) => c.id);
    const nodes: Record<string, QueryNode> = { [root.id]: root };
    for (const c of conditions) {
      c.parentId = root.id;
      nodes[c.id] = c;
    }
    return { rootId: root.id, nodes };
  }

  it("is not runnable for an empty query", () => {
    expect(analyzeQuery(treeWith(), movies).runnable).toBe(false);
  });

  it("is not runnable while any condition is incomplete", () => {
    const tree = treeWith(
      cond({ field: "rating", operator: "gt", value: 8 }), // complete
      cond({ field: "year", operator: "gt", value: null }), // incomplete
    );
    const a = analyzeQuery(tree, movies);
    expect(a.complete).toBe(1);
    expect(a.incomplete).toBe(1);
    expect(a.runnable).toBe(false);
  });

  it("is runnable once every condition is complete", () => {
    const a = analyzeQuery(
      treeWith(cond({ field: "rating", operator: "gt", value: 8 })),
      movies,
    );
    expect(a.runnable).toBe(true);
  });
});
