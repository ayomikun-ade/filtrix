import {
  isGroup,
  type ConditionNode,
  type NodeId,
  type QueryNode,
  type QueryTree,
  type ScalarValue,
} from "@/lib/query/types";
import type { DataSource } from "@/lib/schema/types";
import { isRenderableCondition, tableName } from "@/lib/query/builders/shared";

type Nodes = Record<NodeId, QueryNode>;
type GqlFilter = Record<string, unknown>;

export function toGraphql(tree: QueryTree, source: DataSource): string {
  const filter = isGroup(tree.nodes[tree.rootId])
    ? gqlNode(tree.nodes, tree.rootId)
    : null;
  const selection = source.fields
    .slice(0, 2)
    .map((f) => f.name)
    .join("\n    ");
  const arg = filter ? `(where: ${gqlObject(filter)})` : "";

  return `query {\n  ${tableName(source)}${arg} {\n    ${selection}\n  }\n}`;
}

function gqlNode(nodes: Nodes, id: NodeId): GqlFilter | null {
  const node = nodes[id];
  if (!node) return null;

  if (isGroup(node)) {
    const parts = node.children
      .map((childId) => gqlNode(nodes, childId))
      .filter((part): part is GqlFilter => part !== null);
    if (parts.length === 0) return null;
    if (parts.length === 1) return parts[0];
    return { [node.combinator === "AND" ? "_and" : "_or"]: parts };
  }

  return isRenderableCondition(node) ? gqlCondition(node) : null;
}

function gqlCondition(node: ConditionNode): GqlFilter {
  const field = node.field as string;
  const value = node.value;

  const op = ((): GqlFilter => {
    switch (node.operator) {
      case "eq":
        return { _eq: value };
      case "neq":
        return { _neq: value };
      case "contains":
        return { _ilike: `%${String(value)}%` };
      case "startsWith":
        return { _ilike: `${String(value)}%` };
      case "gt":
        return { _gt: value };
      case "lt":
        return { _lt: value };
      case "in":
        return { _in: value as ScalarValue[] };
      case "between": {
        const [a, b] = value as [ScalarValue, ScalarValue];
        return { _gte: a, _lte: b };
      }
      case "regex":
        return { _regex: String(value) };
      case "isNull":
        return { _is_null: true };
      case "isNotNull":
        return { _is_null: false };
      case "before":
        return { _lt: value };
      case "after":
        return { _gt: value };
      default:
        return {};
    }
  })();

  return { [field]: op };
}

function gqlObject(obj: GqlFilter): string {
  const entries = Object.entries(obj).map(
    ([key, value]) => `${key}: ${gqlValue(value)}`,
  );
  return `{ ${entries.join(", ")} }`;
}

function gqlValue(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (typeof value === "boolean" || typeof value === "number") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(gqlValue).join(", ")}]`;
  }
  if (typeof value === "object") {
    return gqlObject(value as GqlFilter);
  }
  return JSON.stringify(String(value));
}
