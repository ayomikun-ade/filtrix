import type { FieldType, OperatorId } from "@/lib/query/types";

// none: no value, unary: scalar, binary: [a, b] (between), list: values[] (in)
export type OperatorArity = "none" | "unary" | "binary" | "list";

export interface OperatorDef {
  id: OperatorId;
  label: string;
  types: FieldType[];
  arity: OperatorArity;
}

const ALL_TYPES: FieldType[] = ["string", "number", "boolean", "enum", "date"];

export const OPERATORS: Record<OperatorId, OperatorDef> = {
  eq: { id: "eq", label: "equals", types: ALL_TYPES, arity: "unary" },
  neq: { id: "neq", label: "not equals", types: ALL_TYPES, arity: "unary" },
  contains: {
    id: "contains",
    label: "contains",
    types: ["string"],
    arity: "unary",
  },
  startsWith: {
    id: "startsWith",
    label: "starts with",
    types: ["string"],
    arity: "unary",
  },
  gt: { id: "gt", label: "greater than", types: ["number"], arity: "unary" },
  lt: { id: "lt", label: "less than", types: ["number"], arity: "unary" },
  in: {
    id: "in",
    label: "in",
    types: ["string", "number", "enum"],
    arity: "list",
  },
  between: {
    id: "between",
    label: "between",
    types: ["number", "date"],
    arity: "binary",
  },
  regex: {
    id: "regex",
    label: "matches regex",
    types: ["string"],
    arity: "unary",
  },
  isNull: { id: "isNull", label: "is null", types: ALL_TYPES, arity: "none" },
  isNotNull: {
    id: "isNotNull",
    label: "is not null",
    types: ALL_TYPES,
    arity: "none",
  },
  before: { id: "before", label: "before", types: ["date"], arity: "unary" },
  after: { id: "after", label: "after", types: ["date"], arity: "unary" },
};

export const OPERATOR_LIST: OperatorDef[] = Object.values(OPERATORS);

export function getOperator(id: OperatorId): OperatorDef {
  return OPERATORS[id];
}

export function getOperatorsForType(type: FieldType): OperatorDef[] {
  return OPERATOR_LIST.filter((op) => op.types.includes(type));
}

export function isOperatorAllowedForType(
  id: OperatorId,
  type: FieldType,
): boolean {
  return OPERATORS[id].types.includes(type);
}
