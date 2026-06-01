"use client";

import { memo } from "react";
import { AnimatePresence, motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { isGroup, type NodeId } from "@/lib/query/types";
import { useChildren, useNode, useQueryActions } from "@/lib/store/hooks";
import {
  collapseVariants,
  EASE,
  EASE_LAYOUT,
  nodeVariants,
} from "@/lib/motion";
import { validateGroup } from "@/lib/validation/validate";
import { AddBar } from "@/components/builder/add-bar";
import { BuilderNode } from "@/components/builder/builder-node";
import { CombinatorToggle } from "@/components/builder/combinator-toggle";
import { SortableNode } from "@/components/builder/sortable-node";

function QueryGroupImpl({ id }: { id: NodeId }) {
  const node = useNode(id);
  const childIds = useChildren(id);
  const { addCondition, addGroup, setCombinator, toggleCollapsed, removeNode } =
    useQueryActions();

  if (!node || !isGroup(node)) return null;
  const isRoot = node.parentId === null;
  const count = childIds.length;
  const groupErrors = validateGroup(node, isRoot);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => toggleCollapsed(id)}
          aria-label={node.collapsed ? "Expand group" : "Collapse group"}
          aria-expanded={!node.collapsed}
          className="inline-flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <HugeiconsIcon
            icon={node.collapsed ? ArrowRight01Icon : ArrowDown01Icon}
            className="size-4"
          />
        </button>

        <CombinatorToggle
          value={node.combinator}
          onChange={(c) => setCombinator(id, c)}
        />

        <span className="font-mono text-xs text-muted-foreground">
          {count} {count === 1 ? "rule" : "rules"}
        </span>

        {!isRoot ? (
          <button
            type="button"
            onClick={() => removeNode(id)}
            aria-label="Remove group"
            className="ml-auto inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
          </button>
        ) : null}
      </div>

      <AnimatePresence initial={false}>
        {!node.collapsed ? (
          <motion.div
            key="body"
            variants={collapseVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={EASE_LAYOUT}
            style={{ overflow: "hidden" }}
          >
            <div className="ml-2.75 space-y-2 border-l border-border pl-4">
              {count === 0 ? (
                groupErrors.length > 0 ? (
                  <p className="py-1 text-sm text-destructive">
                    {groupErrors[0]}
                  </p>
                ) : (
                  <p className="py-1 text-sm text-muted-foreground">
                    No rules yet — add a condition or a nested group.
                  </p>
                )
              ) : (
                <SortableContext
                  items={[...childIds]}
                  strategy={verticalListSortingStrategy}
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    {childIds.map((childId) => (
                      <motion.div
                        key={childId}
                        layout
                        variants={nodeVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={EASE}
                      >
                        <SortableNode id={childId}>
                          <BuilderNode id={childId} />
                        </SortableNode>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </SortableContext>
              )}
              <AddBar
                onAddCondition={() => addCondition(id)}
                onAddGroup={() => addGroup(id)}
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export const QueryGroup = memo(QueryGroupImpl);
