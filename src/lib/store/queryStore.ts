import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { collectSubtreeIds, isDescendant } from "@/lib/query/tree";
import {
  createCondition,
  createEmptyTree,
  createGroup,
  isCondition,
  isGroup,
  type Combinator,
  type ConditionNode,
  type NodeId,
  type QueryNode,
  type QueryTree,
} from "@/lib/query/types";

export type ConditionPatch = Partial<
  Pick<ConditionNode, "field" | "operator" | "value">
>;

export interface QueryState {
  rootId: NodeId;
  nodes: Record<NodeId, QueryNode>;

  addCondition: (parentId: NodeId) => NodeId | null;
  addGroup: (parentId: NodeId, combinator?: Combinator) => NodeId | null;
  removeNode: (id: NodeId) => void;
  updateCondition: (id: NodeId, patch: ConditionPatch) => void;
  setCombinator: (id: NodeId, combinator: Combinator) => void;
  toggleCollapsed: (id: NodeId, collapsed?: boolean) => void;
  moveNode: (id: NodeId, newParentId: NodeId, index: number) => void;
  reorderWithinGroup: (
    groupId: NodeId,
    fromIndex: number,
    toIndex: number,
  ) => void;
  loadTree: (tree: QueryTree) => void;
  reset: () => void;
}

export const useQueryStore = create<QueryState>()(
  immer((set, get) => ({
    ...createEmptyTree(),

    addCondition: (parentId) => {
      const parent = get().nodes[parentId];
      if (!parent || !isGroup(parent)) return null;
      const node = createCondition(parentId);
      set((s) => {
        s.nodes[node.id] = node;
        const p = s.nodes[parentId];
        if (p && isGroup(p)) p.children.push(node.id);
      });
      return node.id;
    },

    addGroup: (parentId, combinator = "AND") => {
      const parent = get().nodes[parentId];
      if (!parent || !isGroup(parent)) return null;
      const node = createGroup(parentId, combinator);
      set((s) => {
        s.nodes[node.id] = node;
        const p = s.nodes[parentId];
        if (p && isGroup(p)) p.children.push(node.id);
      });
      return node.id;
    },

    removeNode: (id) =>
      set((s) => {
        if (id === s.rootId) return;
        const node = s.nodes[id];
        if (!node) return;
        const { parentId } = node;
        for (const subId of collectSubtreeIds(s.nodes, id)) {
          delete s.nodes[subId];
        }
        if (parentId) {
          const parent = s.nodes[parentId];
          if (parent && isGroup(parent)) {
            parent.children = parent.children.filter((c) => c !== id);
          }
        }
      }),

    updateCondition: (id, patch) =>
      set((s) => {
        const node = s.nodes[id];
        if (node && isCondition(node)) Object.assign(node, patch);
      }),

    setCombinator: (id, combinator) =>
      set((s) => {
        const node = s.nodes[id];
        if (node && isGroup(node)) node.combinator = combinator;
      }),

    toggleCollapsed: (id, collapsed) =>
      set((s) => {
        const node = s.nodes[id];
        if (node && isGroup(node))
          node.collapsed = collapsed ?? !node.collapsed;
      }),

    moveNode: (id, newParentId, index) =>
      set((s) => {
        if (id === s.rootId) return;
        const node = s.nodes[id];
        const newParent = s.nodes[newParentId];
        if (!node || !newParent || !isGroup(newParent)) return;
        // Never move a node into itself or one of its own descendants.
        if (id === newParentId || isDescendant(s.nodes, id, newParentId))
          return;

        const { parentId } = node;
        if (parentId) {
          const oldParent = s.nodes[parentId];
          if (oldParent && isGroup(oldParent)) {
            oldParent.children = oldParent.children.filter((c) => c !== id);
          }
        }

        const target = s.nodes[newParentId];
        if (target && isGroup(target)) {
          const clamped = Math.max(0, Math.min(index, target.children.length));
          target.children.splice(clamped, 0, id);
          node.parentId = newParentId;
        }
      }),

    reorderWithinGroup: (groupId, fromIndex, toIndex) =>
      set((s) => {
        const group = s.nodes[groupId];
        if (!group || !isGroup(group)) return;
        const { children } = group;
        if (fromIndex < 0 || fromIndex >= children.length) return;
        const [moved] = children.splice(fromIndex, 1);
        const clamped = Math.max(0, Math.min(toIndex, children.length));
        children.splice(clamped, 0, moved);
      }),

    loadTree: (tree) =>
      set((s) => {
        s.rootId = tree.rootId;
        s.nodes = tree.nodes;
      }),

    reset: () =>
      set((s) => {
        const fresh = createEmptyTree();
        s.rootId = fresh.rootId;
        s.nodes = fresh.nodes;
      }),
  })),
);
