import { describe, expect, it } from "vitest";

import {
  getDefaultOperator,
  getDefaultValue,
  getOperatorsForField,
  resolveControl,
} from "@/lib/schema/resolve";
import { movies } from "@/lib/schema/datasets/movies";
import type { FieldDef } from "@/lib/schema/types";

const stringField: FieldDef = { name: "title", label: "Title", type: "string" };
const numberField: FieldDef = {
  name: "rating",
  label: "Rating",
  type: "number",
};
const dateField: FieldDef = { name: "d", label: "Date", type: "date" };
const boolField: FieldDef = { name: "b", label: "Bool", type: "boolean" };
const enumField: FieldDef = {
  name: "genre",
  label: "Genre",
  type: "enum",
  values: ["A", "B"],
};

describe("resolveControl", () => {
  it("maps enum fields to select / multiselect", () => {
    expect(resolveControl(enumField, "eq")).toBe("select");
    expect(resolveControl(enumField, "in")).toBe("multiselect");
  });

  it("maps number fields to number / range / tags", () => {
    expect(resolveControl(numberField, "gt")).toBe("number");
    expect(resolveControl(numberField, "between")).toBe("number-range");
    expect(resolveControl(numberField, "in")).toBe("tags");
  });

  it("maps date fields to date / date-range", () => {
    expect(resolveControl(dateField, "after")).toBe("date");
    expect(resolveControl(dateField, "between")).toBe("date-range");
  });

  it("maps string and boolean fields", () => {
    expect(resolveControl(stringField, "contains")).toBe("text");
    expect(resolveControl(stringField, "in")).toBe("tags");
    expect(resolveControl(boolField, "eq")).toBe("boolean");
  });

  it("renders no control for nullary operators", () => {
    expect(resolveControl(numberField, "isNull")).toBe("none");
    expect(resolveControl(stringField, "isNotNull")).toBe("none");
  });
});

describe("getDefaultValue", () => {
  it("returns the right empty shape per arity", () => {
    expect(getDefaultValue(numberField, "isNull")).toBeNull();
    expect(getDefaultValue(numberField, "in")).toEqual([]);
    expect(getDefaultValue(numberField, "between")).toEqual([null, null]);
    expect(getDefaultValue(numberField, "gt")).toBeNull();
    expect(getDefaultValue(boolField, "eq")).toBe(true);
  });
});

describe("field helpers", () => {
  it("getDefaultOperator picks the first valid operator", () => {
    expect(getDefaultOperator(numberField)).toBe("eq");
  });

  it("getOperatorsForField resolves by the field's type", () => {
    const ratingOps = getOperatorsForField(movies, "rating").map((o) => o.id);
    expect(ratingOps).toContain("gt");
    expect(ratingOps).not.toContain("contains");

    const genreOps = getOperatorsForField(movies, "genre").map((o) => o.id);
    expect(genreOps).toContain("in");
  });

  it("returns an empty list for unknown fields", () => {
    expect(getOperatorsForField(movies, "nope")).toEqual([]);
  });
});
