import { z } from "zod";

import { OPERATORS } from "@/lib/query/operators";
import { isGroup, type NodeId, type QueryTree } from "@/lib/query/types";

const MAX_DEPTH = 50;
const OPERATOR_IDS = Object.keys(OPERATORS) as [string, ...string[]];

const scalar = z.union([z.string(), z.number(), z.boolean(), z.null()]);
const valueSchema = z.union([scalar, z.array(scalar)]);

const conditionSchema = z.object({
  id: z.string(),
  type: z.literal("condition"),
  parentId: z.string(),
  field: z.string().nullable(),
  operator: z.enum(OPERATOR_IDS).nullable(),
  value: valueSchema,
});

const groupSchema = z.object({
  id: z.string(),
  type: z.literal("group"),
  parentId: z.string().nullable(),
  combinator: z.enum(["AND", "OR"]),
  children: z.array(z.string()),
  collapsed: z.boolean(),
});

const nodeSchema = z.discriminatedUnion("type", [conditionSchema, groupSchema]);

const treeSchema = z.object({
  rootId: z.string(),
  nodes: z.record(z.string(), nodeSchema),
});

export const documentSchema = z.object({
  version: z.number().optional(),
  source: z.string(),
  tree: treeSchema,
});

export interface QueryDocument {
  version?: number;
  source: string;
  tree: QueryTree;
}

export type ParseResult =
  | { ok: true; document: QueryDocument }
  | { ok: false; error: string };

export function serializeQuery(tree: QueryTree, source: string): string {
  return JSON.stringify({ version: 1, source, tree }, null, 2);
}

export function parseQuery(input: string): ParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(input);
  } catch {
    return { ok: false, error: "That is not valid JSON." };
  }

  const parsed = documentSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: firstIssue(parsed.error) };
  }

  const tree = parsed.data.tree as QueryTree;
  const integrity = checkIntegrity(tree);
  if (integrity) return { ok: false, error: integrity };

  return { ok: true, document: parsed.data as QueryDocument };
}

// Guards against malformed recursive structures beyond the shape check: a single
// valid root, consistent parent/child links, no cycles, no orphans, bounded depth.
function checkIntegrity(tree: QueryTree): string | null {
  const { rootId, nodes } = tree;
  const root = nodes[rootId];
  if (!root) return "The root node is missing.";
  if (!isGroup(root)) return "The root must be a group.";
  if (root.parentId !== null) return "The root must not have a parent.";

  for (const [id, node] of Object.entries(nodes)) {
    if (node.id !== id) return "A node id does not match its key.";
    if (id !== rootId) {
      if (node.parentId === null) return "Only the root may have no parent.";
      const parent = nodes[node.parentId];
      if (!parent) return "A node references a missing parent.";
      if (!isGroup(parent)) return "A node's parent is not a group.";
      if (!parent.children.includes(id)) {
        return "A node is not listed among its parent's children.";
      }
    }
    if (isGroup(node)) {
      for (const childId of node.children) {
        const child = nodes[childId];
        if (!child) return "A group references a missing child.";
        if (child.parentId !== id)
          return "Parent/child links are inconsistent.";
      }
    }
  }

  const seen = new Set<NodeId>();
  const walk = (id: NodeId, depth: number): string | null => {
    if (depth > MAX_DEPTH) return "The query is nested too deeply.";
    if (seen.has(id)) return "The query contains a cycle.";
    seen.add(id);
    const node = nodes[id];
    if (node && isGroup(node)) {
      for (const childId of node.children) {
        const error = walk(childId, depth + 1);
        if (error) return error;
      }
    }
    return null;
  };
  const cycleError = walk(rootId, 0);
  if (cycleError) return cycleError;
  if (seen.size !== Object.keys(nodes).length) {
    return "The query has nodes that are unreachable from the root.";
  }

  return null;
}

function firstIssue(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "The query document is invalid.";
  const path = issue.path.join(".") || "document";
  return `Invalid at "${path}": ${issue.message}`;
}
