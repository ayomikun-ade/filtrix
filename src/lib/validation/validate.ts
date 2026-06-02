import { isRenderableCondition } from "@/lib/query/builders/shared";
import { OPERATORS } from "@/lib/query/operators";
import {
  isGroup,
  type ConditionNode,
  type FieldType,
  type GroupNode,
  type NodeId,
  type OperatorId,
  type QueryTree,
  type ScalarValue,
} from "@/lib/query/types";
import { getField } from "@/lib/schema/sources";
import type { DataSource } from "@/lib/schema/types";

export interface ValidationError {
  nodeId: NodeId;
  message: string;
}

export type ValidationMap = Record<NodeId, ValidationError[]>;

// Only genuine mistakes are reported. An incomplete row (no field yet, or a
// required value not filled in) is "in progress", not invalid — the generators
// already skip it — so it is left unflagged to avoid nagging mid-edit.
export function validateCondition(
  node: ConditionNode,
  source: DataSource,
): string[] {
  if (!node.field) return [];
  const field = getField(source, node.field);
  if (!field) return ["Unknown field for this data source."];
  if (!node.operator) return [];

  const op = OPERATORS[node.operator];
  if (!op.types.includes(field.type)) {
    return [`"${op.label}" can't be applied to ${field.label}.`];
  }

  const errors: string[] = [];
  const value = node.value;

  switch (op.arity) {
    case "none":
      break;
    case "unary":
      if (!isEmpty(value)) {
        checkScalar(value as ScalarValue, field.type, node.operator, errors);
      }
      break;
    case "list":
      if (Array.isArray(value)) {
        for (const item of value) {
          checkScalar(item, field.type, node.operator, errors);
        }
      }
      break;
    case "binary": {
      if (
        Array.isArray(value) &&
        value.length === 2 &&
        !isEmpty(value[0]) &&
        !isEmpty(value[1])
      ) {
        const [from, to] = value as [ScalarValue, ScalarValue];
        checkScalar(from, field.type, node.operator, errors);
        checkScalar(to, field.type, node.operator, errors);
        if (!rangeOrdered(from, to, field.type)) {
          errors.push("Range start must be less than or equal to the end.");
        }
      }
      break;
    }
  }

  return errors;
}

export function validateGroup(node: GroupNode, isRoot: boolean): string[] {
  if (!isRoot && node.children.length === 0) {
    return ["Group is empty — add a rule or remove it."];
  }
  return [];
}

export function validateTree(
  tree: QueryTree,
  source: DataSource,
): ValidationMap {
  const map: ValidationMap = {};
  for (const node of Object.values(tree.nodes)) {
    const messages = isGroup(node)
      ? validateGroup(node, node.id === tree.rootId)
      : validateCondition(node, source);
    if (messages.length > 0) {
      map[node.id] = messages.map((message) => ({ nodeId: node.id, message }));
    }
  }
  return map;
}

export function countErrors(map: ValidationMap): number {
  return Object.values(map).reduce((sum, errors) => sum + errors.length, 0);
}

// A condition's progress, distinct from validity:
// - "empty":      untouched (no field) — neutral, not yet flagged.
// - "incomplete": engaged (field chosen) but not yet runnable — flagged amber.
// - "invalid":    a genuine mistake — flagged red (see validateCondition).
// - "complete":   fully filled in and valid.
export type ConditionStatus = "empty" | "incomplete" | "invalid" | "complete";

export function conditionStatus(
  node: ConditionNode,
  source: DataSource,
): ConditionStatus {
  if (validateCondition(node, source).length > 0) return "invalid";
  if (!node.field) return "empty";
  return isRenderableCondition(node) ? "complete" : "incomplete";
}

export interface QueryAnalysis {
  errors: number; // invalid conditions + empty nested groups
  incomplete: number; // engaged-but-incomplete conditions
  emptyRows: number; // untouched conditions (no field)
  complete: number; // runnable conditions
  runnable: boolean; // safe to execute
}

// A query runs only when it has something to run (≥1 complete condition) and
// nothing half-finished or broken anywhere.
export function analyzeQuery(
  tree: QueryTree,
  source: DataSource,
): QueryAnalysis {
  let errors = 0;
  let incomplete = 0;
  let emptyRows = 0;
  let complete = 0;

  for (const node of Object.values(tree.nodes)) {
    if (isGroup(node)) {
      if (node.id !== tree.rootId && node.children.length === 0) errors++;
      continue;
    }
    switch (conditionStatus(node, source)) {
      case "invalid":
        errors++;
        break;
      case "incomplete":
        incomplete++;
        break;
      case "empty":
        emptyRows++;
        break;
      case "complete":
        complete++;
        break;
    }
  }

  const runnable =
    complete >= 1 && incomplete === 0 && emptyRows === 0 && errors === 0;
  return { errors, incomplete, emptyRows, complete, runnable };
}

function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === "";
}

function checkScalar(
  value: ScalarValue,
  type: FieldType,
  operator: OperatorId,
  errors: string[],
): void {
  if (type === "number" && !Number.isFinite(Number(value))) {
    errors.push("Value must be a number.");
  }
  if (type === "date" && !isValidDate(value)) {
    errors.push("Value must be a valid date.");
  }
  if (operator === "regex" && !isValidRegex(value)) {
    errors.push("Invalid regular expression.");
  }
}

function isValidDate(value: ScalarValue): boolean {
  if (typeof value !== "string" || value === "") return false;
  return !Number.isNaN(new Date(value).getTime());
}

function isValidRegex(value: ScalarValue): boolean {
  try {
    new RegExp(String(value));
    return true;
  } catch {
    return false;
  }
}

function rangeOrdered(
  from: ScalarValue,
  to: ScalarValue,
  type: FieldType,
): boolean {
  if (type === "number") return Number(from) <= Number(to);
  if (type === "date") {
    const a = new Date(String(from)).getTime();
    const b = new Date(String(to)).getTime();
    if (Number.isNaN(a) || Number.isNaN(b)) return true; // bad-date error covers this
    return a <= b;
  }
  return true;
}
