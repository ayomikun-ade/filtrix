"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { HugeiconsIcon } from "@hugeicons/react";
import { DragDropVerticalIcon } from "@hugeicons/core-free-icons";

import type { NodeId } from "@/lib/query/types";
import { cn } from "@/lib/utils";

export function SortableNode({
  id,
  children,
}: {
  id: NodeId;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn("flex items-start gap-1", isDragging && "opacity-50")}
    >
      <button
        type="button"
        aria-label="Drag to reorder"
        className="mt-1.5 inline-flex size-6 shrink-0 cursor-grab touch-none items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <HugeiconsIcon icon={DragDropVerticalIcon} className="size-4" />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
