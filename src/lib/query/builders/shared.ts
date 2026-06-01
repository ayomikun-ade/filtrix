import { OPERATORS } from "@/lib/query/operators";
import type { ConditionNode, FieldType, ScalarValue } from "@/lib/query/types";
import { getField } from "@/lib/schema/sources";
import type { DataSource } from "@/lib/schema/types";

// A condition contributes to the generated output only once it has enough filled
// in to be meaningful. Incomplete rows are skipped silently here; the validation
// engine (separate) is what surfaces them as errors.
export function isRenderableCondition(node: ConditionNode): boolean {
  if (!node.field || !node.operator) return false;
  const value = node.value;
  switch (OPERATORS[node.operator].arity) {
    case "none":
      return true;
    case "unary":
      return value !== null && value !== undefined && value !== "";
    case "list":
      return Array.isArray(value) && value.length > 0;
    case "binary":
      return (
        Array.isArray(value) &&
        value.length === 2 &&
        value[0] != null &&
        value[0] !== "" &&
        value[1] != null &&
        value[1] !== ""
      );
  }
}

export function fieldType(source: DataSource, fieldName: string): FieldType {
  return getField(source, fieldName)?.type ?? "string";
}

export function asArray(value: ScalarValue | ScalarValue[]): ScalarValue[] {
  return Array.isArray(value) ? value : [value];
}
