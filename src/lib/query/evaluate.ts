import { isRenderableCondition } from "@/lib/query/builders/shared";
import {
  isGroup,
  type ConditionNode,
  type FieldType,
  type NodeId,
  type OperatorId,
  type QueryNode,
  type QueryTree,
  type ScalarValue,
} from "@/lib/query/types";
import { getField } from "@/lib/schema/sources";
import type { DataSource } from "@/lib/schema/types";

export type Row = Record<string, unknown>;
type Predicate = (row: Row) => boolean;
type Nodes = Record<NodeId, QueryNode>;

// Compiles the query tree into a single predicate. Incomplete conditions and
// empty groups impose no constraint (same rows the generators would skip).
export function buildPredicate(tree: QueryTree, source: DataSource): Predicate {
  return buildNodePredicate(tree.nodes, tree.rootId, source) ?? (() => true);
}

function buildNodePredicate(
  nodes: Nodes,
  id: NodeId,
  source: DataSource,
): Predicate | null {
  const node = nodes[id];
  if (!node) return null;

  if (isGroup(node)) {
    const preds = node.children
      .map((childId) => buildNodePredicate(nodes, childId, source))
      .filter((p): p is Predicate => p !== null);
    if (preds.length === 0) return null;
    return node.combinator === "AND"
      ? (row) => preds.every((p) => p(row))
      : (row) => preds.some((p) => p(row));
  }

  if (!isRenderableCondition(node)) return null;
  return buildConditionPredicate(node, source);
}

function buildConditionPredicate(
  node: ConditionNode,
  source: DataSource,
): Predicate {
  const field = node.field as string;
  const type = getField(source, field)?.type ?? "string";
  const operator = node.operator as OperatorId;
  const target = node.value;
  return (row) => evaluate(operator, row[field], target, type);
}

function evaluate(
  operator: OperatorId,
  cell: unknown,
  target: unknown,
  type: FieldType,
): boolean {
  switch (operator) {
    case "eq":
      return equals(cell, target as ScalarValue, type);
    case "neq":
      return !equals(cell, target as ScalarValue, type);
    case "contains":
      return lower(cell).includes(lower(target));
    case "startsWith":
      return lower(cell).startsWith(lower(target));
    case "gt":
      return Number(cell) > Number(target);
    case "lt":
      return Number(cell) < Number(target);
    case "in":
      return Array.isArray(target) && target.some((t) => equals(cell, t, type));
    case "between": {
      if (!Array.isArray(target) || target.length !== 2) return false;
      const value = comparable(cell, type);
      return (
        value >= comparable(target[0], type) &&
        value <= comparable(target[1], type)
      );
    }
    case "regex":
      return safeRegex(String(target)).test(String(cell ?? ""));
    case "isNull":
      return isEmpty(cell);
    case "isNotNull":
      return !isEmpty(cell);
    case "before":
      return comparable(cell, "date") < comparable(target, "date");
    case "after":
      return comparable(cell, "date") > comparable(target, "date");
    default:
      return true;
  }
}

function equals(cell: unknown, target: ScalarValue, type: FieldType): boolean {
  if (type === "number") return Number(cell) === Number(target);
  if (type === "boolean") return Boolean(cell) === Boolean(target);
  return String(cell) === String(target);
}

function lower(value: unknown): string {
  return String(value ?? "").toLowerCase();
}

function comparable(value: unknown, type: FieldType): number {
  if (type === "date") return new Date(String(value)).getTime();
  return Number(value);
}

function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === "";
}

function safeRegex(pattern: string): RegExp {
  try {
    return new RegExp(pattern);
  } catch {
    return /$^/; // matches nothing
  }
}
