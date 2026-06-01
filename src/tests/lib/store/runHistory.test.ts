import { beforeEach, describe, expect, it } from "vitest";

import { createEmptyTree } from "@/lib/query/types";
import { useRunHistoryStore } from "@/lib/store/runHistoryStore";

const records = () => useRunHistoryStore.getState().records;
const record = useRunHistoryStore.getState().record;

beforeEach(() => {
  useRunHistoryStore.getState().clear();
});

describe("run history store", () => {
  it("records runs newest-first", () => {
    record({
      sourceId: "movies",
      tree: createEmptyTree(),
      label: "All movies.",
      count: 150,
    });
    record({
      sourceId: "books",
      tree: createEmptyTree(),
      label: "All books.",
      count: 44,
    });

    expect(records()).toHaveLength(2);
    expect(records()[0].label).toBe("All books.");
    expect(records()[0].count).toBe(44);
  });

  it("refreshes the latest entry when the same query runs again", () => {
    const tree = createEmptyTree();
    record({ sourceId: "movies", tree, label: "All movies.", count: 150 });
    record({ sourceId: "movies", tree, label: "All movies.", count: 99 });

    expect(records()).toHaveLength(1);
    expect(records()[0].count).toBe(99);
  });

  it("caps the number of entries", () => {
    for (let i = 0; i < 20; i += 1) {
      record({
        sourceId: "movies",
        tree: createEmptyTree(),
        label: `run ${i}`,
        count: i,
      });
    }
    expect(records().length).toBeLessThanOrEqual(15);
  });
});
