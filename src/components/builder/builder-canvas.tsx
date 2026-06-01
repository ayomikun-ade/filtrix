"use client";

import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import { planDrag } from "@/lib/store/dnd";
import { useRootId } from "@/lib/store/hooks";
import { useQueryStore } from "@/lib/store/queryStore";
import { QueryGroup } from "@/components/builder/query-group";

export function BuilderCanvas() {
  const rootId = useRootId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const state = useQueryStore.getState();
    const plan = planDrag(state.nodes, String(active.id), String(over.id));
    if (!plan) return;
    if (plan.type === "reorder") {
      state.reorderWithinGroup(plan.groupId, plan.from, plan.to);
    } else {
      state.moveNode(plan.id, plan.parentId, plan.index);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="p-4">
        <QueryGroup id={rootId} />
      </div>
    </DndContext>
  );
}
