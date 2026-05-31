import { describe, expect, it } from "vitest";

import {
  getOperator,
  getOperatorsForType,
  isOperatorAllowedForType,
  OPERATORS,
} from "@/lib/query/operators";
import type { FieldType } from "@/lib/query/types";

const ALL_TYPES: FieldType[] = ["string", "number", "boolean", "enum", "date"];

describe("operator registry", () => {
  it("string fields allow text operators but not numeric/range ones", () => {
    const ids = getOperatorsForType("string").map((o) => o.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        "eq",
        "neq",
        "contains",
        "startsWith",
        "regex",
        "in",
      ]),
    );
    expect(ids).not.toContain("gt");
    expect(ids).not.toContain("between");
  });

  it("number fields disallow contains/startsWith/regex", () => {
    const ids = getOperatorsForType("number").map((o) => o.id);
    expect(ids).toEqual(
      expect.arrayContaining(["eq", "neq", "gt", "lt", "between", "in"]),
    );
    expect(ids).not.toContain("contains");
    expect(ids).not.toContain("startsWith");
    expect(ids).not.toContain("regex");
  });

  it("date fields use before/after/between, not gt/lt", () => {
    const ids = getOperatorsForType("date").map((o) => o.id);
    expect(ids).toEqual(expect.arrayContaining(["before", "after", "between"]));
    expect(ids).not.toContain("gt");
    expect(ids).not.toContain("lt");
  });

  it("boolean fields only allow equality and null checks", () => {
    const ids = getOperatorsForType("boolean").map((o) => o.id);
    expect(ids).toEqual(["eq", "neq", "isNull", "isNotNull"]);
  });

  it("enum fields allow `in` but not range or text operators", () => {
    const ids = getOperatorsForType("enum").map((o) => o.id);
    expect(ids).toContain("in");
    expect(ids).not.toContain("between");
    expect(ids).not.toContain("contains");
  });

  it("null checks apply to every field type", () => {
    for (const type of ALL_TYPES) {
      const ids = getOperatorsForType(type).map((o) => o.id);
      expect(ids).toContain("isNull");
      expect(ids).toContain("isNotNull");
    }
  });

  it("isOperatorAllowedForType reflects the registry", () => {
    expect(isOperatorAllowedForType("contains", "string")).toBe(true);
    expect(isOperatorAllowedForType("contains", "number")).toBe(false);
    expect(isOperatorAllowedForType("between", "date")).toBe(true);
  });

  it("each registry entry is keyed by its own id", () => {
    for (const [key, def] of Object.entries(OPERATORS)) {
      expect(def.id).toBe(key);
      expect(getOperator(def.id)).toBe(def);
    }
  });
});
