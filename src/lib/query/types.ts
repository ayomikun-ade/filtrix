import { createId } from "@/lib/utils/id";

export type NodeId = string;

export type Combinator = "AND" | "OR";

export type FieldType = "string" | "number" | "boolean" | "enum" | "date";

export type OperatorId =
  | "eq"
  | "neq"
  | "contains"
  | "startsWith"
  | "gt"
  | "lt"
  | "in"
  | "between"
  | "regex"
  | "isNull"
  | "isNotNull"
  | "before"
  | "after";

export type ScalarValue = string | number | boolean | null;

// Shape depends on the operator's arity: scalar (unary), ScalarValue[] (list),
// [ScalarValue, ScalarValue] (binary/between), null (nullary or unset).
export type ConditionValue =
  | ScalarValue
  | ScalarValue[]
  | [ScalarValue, ScalarValue];

export interface ConditionNode {
  id: NodeId;
  type: "condition";
  parentId: NodeId;
  field: string | null;
  operator: OperatorId | null;
  value: ConditionValue;
}

export interface GroupNode {
  id: NodeId;
  type: "group";
  parentId: NodeId | null; // null only for the root group
  combinator: Combinator;
  children: NodeId[];
  collapsed: boolean;
}

export type QueryNode = ConditionNode | GroupNode;

// Normalized tree: a flat id -> node map with a root id, not a nested object.
export interface QueryTree {
  rootId: NodeId;
  nodes: Record<NodeId, QueryNode>;
}

export function isGroup(node: QueryNode): node is GroupNode {
  return node.type === "group";
}

export function isCondition(node: QueryNode): node is ConditionNode {
  return node.type === "condition";
}

export function createGroup(
  parentId: NodeId | null,
  combinator: Combinator = "AND",
): GroupNode {
  return {
    id: createId("group"),
    type: "group",
    parentId,
    combinator,
    children: [],
    collapsed: false,
  };
}

export function createCondition(parentId: NodeId): ConditionNode {
  return {
    id: createId("cond"),
    type: "condition",
    parentId,
    field: null,
    operator: null,
    value: null,
  };
}

export function createEmptyTree(): QueryTree {
  const root = createGroup(null, "AND");
  return { rootId: root.id, nodes: { [root.id]: root } };
}
