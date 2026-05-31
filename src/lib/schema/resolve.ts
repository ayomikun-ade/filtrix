import {
  getOperator,
  getOperatorsForType,
  type OperatorDef,
} from "@/lib/query/operators";
import type { ConditionValue, OperatorId } from "@/lib/query/types";
import { getField } from "@/lib/schema/sources";
import type { DataSource, FieldDef } from "@/lib/schema/types";

export type ControlKind =
  | "none"
  | "text"
  | "number"
  | "date"
  | "select"
  | "multiselect"
  | "tags"
  | "boolean"
  | "number-range"
  | "date-range";

export function getOperatorsForField(
  source: DataSource,
  fieldName: string,
): OperatorDef[] {
  const field = getField(source, fieldName);
  return field ? getOperatorsForType(field.type) : [];
}

export function getDefaultOperator(field: FieldDef): OperatorId | null {
  return getOperatorsForType(field.type)[0]?.id ?? null;
}

export function resolveControl(
  field: FieldDef,
  operator: OperatorId,
): ControlKind {
  const { arity } = getOperator(operator);

  switch (arity) {
    case "none":
      return "none";
    case "list":
      return field.type === "enum" ? "multiselect" : "tags";
    case "binary":
      return field.type === "date" ? "date-range" : "number-range";
    case "unary":
      switch (field.type) {
        case "boolean":
          return "boolean";
        case "enum":
          return "select";
        case "number":
          return "number";
        case "date":
          return "date";
        default:
          return "text";
      }
  }
}

export function getDefaultValue(
  field: FieldDef,
  operator: OperatorId,
): ConditionValue {
  const { arity } = getOperator(operator);

  switch (arity) {
    case "none":
      return null;
    case "list":
      return [];
    case "binary":
      return [null, null];
    case "unary":
      return field.type === "boolean" ? true : null;
  }
}
