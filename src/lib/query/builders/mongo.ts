import {
  isGroup,
  type ConditionNode,
  type NodeId,
  type QueryNode,
  type QueryTree,
  type ScalarValue,
} from "@/lib/query/types";
import { isRenderableCondition } from "@/lib/query/builders/shared";

type Nodes = Record<NodeId, QueryNode>;
export type MongoFilter = Record<string, unknown>;

export function toMongo(tree: QueryTree): MongoFilter {
  const root = tree.nodes[tree.rootId];
  if (!root || !isGroup(root)) return {};
  return mongoNode(tree.nodes, tree.rootId) ?? {};
}

export function toMongoString(tree: QueryTree): string {
  return JSON.stringify(toMongo(tree), null, 2);
}

function mongoNode(nodes: Nodes, id: NodeId): MongoFilter | null {
  const node = nodes[id];
  if (!node) return null;

  if (isGroup(node)) {
    const parts = node.children
      .map((childId) => mongoNode(nodes, childId))
      .filter((part): part is MongoFilter => part !== null);
    if (parts.length === 0) return null;
    if (parts.length === 1) return parts[0];
    return { [node.combinator === "AND" ? "$and" : "$or"]: parts };
  }

  return isRenderableCondition(node) ? mongoCondition(node) : null;
}

function mongoCondition(node: ConditionNode): MongoFilter {
  const field = node.field as string;
  const value = node.value;

  switch (node.operator) {
    case "eq":
      return { [field]: value };
    case "neq":
      return { [field]: { $ne: value } };
    case "contains":
      return { [field]: { $regex: String(value), $options: "i" } };
    case "startsWith":
      return { [field]: { $regex: `^${String(value)}`, $options: "i" } };
    case "gt":
      return { [field]: { $gt: value } };
    case "lt":
      return { [field]: { $lt: value } };
    case "in":
      return { [field]: { $in: value as ScalarValue[] } };
    case "between": {
      const [a, b] = value as [ScalarValue, ScalarValue];
      return { [field]: { $gte: a, $lte: b } };
    }
    case "regex":
      return { [field]: { $regex: String(value) } };
    case "isNull":
      return { [field]: null };
    case "isNotNull":
      return { [field]: { $ne: null } };
    case "before":
      return { [field]: { $lt: value } };
    case "after":
      return { [field]: { $gt: value } };
    default:
      return {};
  }
}
