import { describe, expect, it } from "vitest";

import {
  createCondition,
  createGroup,
  type ConditionNode,
  type QueryNode,
} from "@/lib/query/types";
import { movies } from "@/lib/schema/datasets/movies";
import {
  countErrors,
  validateCondition,
  validateGroup,
  validateTree,
} from "@/lib/validation/validate";

function cond(partial: Partial<ConditionNode>): ConditionNode {
  return { ...createCondition("parent"), ...partial };
}

describe("validateCondition", () => {
  it("requires a field and operator", () => {
    expect(validateCondition(cond({}), movies)).toEqual(["Select a field."]);
    expect(validateCondition(cond({ field: "rating" }), movies)).toEqual([
      "Select an operator.",
    ]);
  });

  it("rejects operators incompatible with the field type", () => {
    const errors = validateCondition(
      cond({ field: "rating", operator: "contains", value: "x" }),
      movies,
    );
    expect(errors[0]).toMatch(/can't be applied/i);
  });

  it("requires a value for unary operators", () => {
    expect(
      validateCondition(
        cond({ field: "rating", operator: "gt", value: null }),
        movies,
      ),
    ).toEqual(["Enter a value."]);
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

  it("requires at least one value for `in`", () => {
    expect(
      validateCondition(
        cond({ field: "genre", operator: "in", value: [] }),
        movies,
      ),
    ).toEqual(["Add at least one value."]);
  });

  it("validates ranges for `between`", () => {
    expect(
      validateCondition(
        cond({ field: "rating", operator: "between", value: [null, null] }),
        movies,
      ),
    ).toEqual(["Enter both ends of the range."]);

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
      operator: "gt",
      value: null,
    });
    const emptyGroup = createGroup(root.id);
    root.children = [bad.id, emptyGroup.id];

    const nodes: Record<string, QueryNode> = {
      [root.id]: root,
      [bad.id]: bad,
      [emptyGroup.id]: emptyGroup,
    };
    const map = validateTree({ rootId: root.id, nodes }, movies);

    expect(map[bad.id][0].message).toBe("Enter a value.");
    expect(map[emptyGroup.id][0].message).toMatch(/empty/i);
    expect(map[root.id]).toBeUndefined();
    expect(countErrors(map)).toBe(2);
  });
});
