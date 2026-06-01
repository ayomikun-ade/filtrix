import {
  isGroup,
  type Combinator,
  type ConditionNode,
  type GroupNode,
  type NodeId,
  type QueryNode,
  type QueryTree,
  type ScalarValue,
} from "@/lib/query/types";
import { getField } from "@/lib/schema/sources";
import type { DataSource } from "@/lib/schema/types";
import { isRenderableCondition } from "@/lib/query/builders/shared";

type Nodes = Record<NodeId, QueryNode>;

export function toNaturalLanguage(tree: QueryTree, source: DataSource): string {
  const root = tree.nodes[tree.rootId];
  const inner = isGroup(root) ? nlGroupInner(tree.nodes, root, source) : null;
  if (!inner) return `All ${source.name.toLowerCase()}.`;
  return `${source.name} where ${inner}.`;
}

function nlNode(nodes: Nodes, id: NodeId, source: DataSource): string | null {
  const node = nodes[id];
  if (!node) return null;
  if (isGroup(node)) {
    const parts = nlGroupParts(nodes, node, source);
    if (parts.length === 0) return null;
    // A single child needs no combinator, so skip the wrapping parentheses.
    if (parts.length === 1) return parts[0];
    return `(${joinParts(parts, node.combinator)})`;
  }
  return isRenderableCondition(node) ? nlCondition(node, source) : null;
}

function nlGroupInner(
  nodes: Nodes,
  group: GroupNode,
  source: DataSource,
): string | null {
  const parts = nlGroupParts(nodes, group, source);
  if (parts.length === 0) return null;
  return joinParts(parts, group.combinator);
}

function nlGroupParts(
  nodes: Nodes,
  group: GroupNode,
  source: DataSource,
): string[] {
  return group.children
    .map((childId) => nlNode(nodes, childId, source))
    .filter((part): part is string => part !== null);
}

function joinParts(parts: string[], combinator: Combinator): string {
  return parts.join(combinator === "AND" ? " and " : " or ");
}

function nlCondition(node: ConditionNode, source: DataSource): string {
  const label = getField(source, node.field as string)?.label ?? node.field;
  const value = node.value;

  switch (node.operator) {
    case "eq":
      return `${label} is ${fmt(value as ScalarValue)}`;
    case "neq":
      return `${label} is not ${fmt(value as ScalarValue)}`;
    case "contains":
      return `${label} contains ${fmt(value as ScalarValue)}`;
    case "startsWith":
      return `${label} starts with ${fmt(value as ScalarValue)}`;
    case "gt":
      return `${label} is greater than ${fmt(value as ScalarValue)}`;
    case "lt":
      return `${label} is less than ${fmt(value as ScalarValue)}`;
    case "in":
      return `${label} is any of ${(value as ScalarValue[])
        .map(fmt)
        .join(", ")}`;
    case "between": {
      const [a, b] = value as [ScalarValue, ScalarValue];
      return `${label} is between ${fmt(a)} and ${fmt(b)}`;
    }
    case "regex":
      return `${label} matches ${fmt(value as ScalarValue)}`;
    case "isNull":
      return `${label} is empty`;
    case "isNotNull":
      return `${label} is not empty`;
    case "before":
      return `${label} is before ${fmt(value as ScalarValue)}`;
    case "after":
      return `${label} is after ${fmt(value as ScalarValue)}`;
    default:
      return String(label);
  }
}

function fmt(value: ScalarValue): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return `"${value}"`;
}
