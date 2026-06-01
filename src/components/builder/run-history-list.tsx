"use client";

import { getSource } from "@/lib/schema/sources";
import { useHistoryStore } from "@/lib/store/historyStore";
import { useQueryStore } from "@/lib/store/queryStore";
import {
  useRunHistoryStore,
  type RunRecord,
} from "@/lib/store/runHistoryStore";
import { useSourceStore } from "@/lib/store/sourceStore";

export function RunHistoryList() {
  const records = useRunHistoryStore((s) => s.records);
  const setSource = useSourceStore((s) => s.setSource);
  const loadTree = useQueryStore((s) => s.loadTree);

  function restore(record: RunRecord) {
    if (getSource(record.sourceId)) setSource(record.sourceId);
    loadTree(record.tree);
    useHistoryStore.getState().clear();
  }

  if (records.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Run a query and it shows up here.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-1">
      {records.map((record) => (
        <li key={record.id}>
          <button
            type="button"
            onClick={() => restore(record)}
            className="flex w-full flex-col items-start gap-0.5 rounded-md px-2.5 py-1.5 text-left transition-colors hover:bg-muted"
          >
            <span className="line-clamp-1 text-sm">{record.label}</span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {record.count} {record.count === 1 ? "row" : "rows"} ·{" "}
              {formatTime(record.at)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function formatTime(at: number): string {
  return new Date(at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
