"use client";

import { useRootId } from "@/lib/store/hooks";
import { QueryGroup } from "@/components/builder/query-group";

export function BuilderCanvas() {
  const rootId = useRootId();
  return (
    <div className="p-4">
      <QueryGroup id={rootId} />
    </div>
  );
}
