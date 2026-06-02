import {
  isGroup,
  type ConditionNode,
  type FieldType,
  type NodeId,
  type QueryNode,
  type QueryTree,
  type ScalarValue,
} from "@/lib/query/types";
import type { DataSource } from "@/lib/schema/types";
import {
  fieldType,
  isRenderableCondition,
  tableName,
} from "@/lib/query/builders/shared";

type Nodes = Record<NodeId, QueryNode>;

export function toSql(tree: QueryTree, source: DataSource): string {
  const root = tree.nodes[tree.rootId];
  const base = `SELECT *\nFROM ${tableName(source)}`;
  if (!root || !isGroup(root)) return `${base};`;

  const parts = root.children
    .map((childId) => sqlNode(tree.nodes, childId, source))
    .filter((part): part is string => part !== null);

  if (parts.length === 0) return `${base};`;
  return `${base}\nWHERE ${parts.join(`\n  ${root.combinator} `)};`;
}

function sqlNode(nodes: Nodes, id: NodeId, source: DataSource): string | null {
  const node = nodes[id];
  if (!node) return null;

  if (isGroup(node)) {
    const parts = node.children
      .map((childId) => sqlNode(nodes, childId, source))
      .filter((part): part is string => part !== null);
    if (parts.length === 0) return null;
    // A single child needs no combinator, so skip the redundant parentheses.
    if (parts.length === 1) return parts[0];
    return `(${parts.join(` ${node.combinator} `)})`;
  }

  return isRenderableCondition(node) ? sqlCondition(node, source) : null;
}

function sqlCondition(node: ConditionNode, source: DataSource): string {
  const field = node.field as string;
  const type = fieldType(source, field);
  const value = node.value;

  switch (node.operator) {
    case "eq":
      return `${field} = ${sqlValue(value as ScalarValue, type)}`;
    case "neq":
      return `${field} != ${sqlValue(value as ScalarValue, type)}`;
    case "contains":
      return `${field} LIKE ${sqlString(`%${String(value)}%`)}`;
    case "startsWith":
      return `${field} LIKE ${sqlString(`${String(value)}%`)}`;
    case "gt":
      return `${field} > ${sqlValue(value as ScalarValue, type)}`;
    case "lt":
      return `${field} < ${sqlValue(value as ScalarValue, type)}`;
    case "in":
      return `${field} IN (${(value as ScalarValue[])
        .map((v) => sqlValue(v, type))
        .join(", ")})`;
    case "between": {
      const [a, b] = value as [ScalarValue, ScalarValue];
      return `${field} BETWEEN ${sqlValue(a, type)} AND ${sqlValue(b, type)}`;
    }
    case "regex":
      return `${field} REGEXP ${sqlString(String(value))}`;
    case "isNull":
      return `${field} IS NULL`;
    case "isNotNull":
      return `${field} IS NOT NULL`;
    case "before":
      return `${field} < ${sqlValue(value as ScalarValue, type)}`;
    case "after":
      return `${field} > ${sqlValue(value as ScalarValue, type)}`;
    default:
      return "";
  }
}

function sqlValue(value: ScalarValue, type: FieldType): string {
  if (value === null || value === undefined) return "NULL";
  if (type === "boolean") return value ? "TRUE" : "FALSE";
  if (type === "number") {
    const num = Number(value);
    return Number.isFinite(num) ? String(num) : "NULL";
  }
  return sqlString(String(value));
}

// Escape single quotes by doubling them — prevents the generated SQL from being
// broken (or injected) by quote characters in user values.
function sqlString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}
