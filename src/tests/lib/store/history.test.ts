import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useHistoryStore } from "@/lib/store/historyStore";
import { useQueryStore } from "@/lib/store/queryStore";

const store = () => useQueryStore.getState();
const history = () => useHistoryStore.getState();
const nodeCount = () => Object.keys(store().nodes).length;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(0);
  store().reset();
  history().clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("history", () => {
  it("records an edit and undoes / redoes it", () => {
    vi.setSystemTime(1000);
    store().addCondition(store().rootId);
    expect(history().canUndo).toBe(true);
    expect(nodeCount()).toBe(2);

    history().undo();
    expect(nodeCount()).toBe(1);
    expect(history().canRedo).toBe(true);

    history().redo();
    expect(nodeCount()).toBe(2);
  });

  it("coalesces rapid edits into a single step", () => {
    vi.setSystemTime(1000);
    store().addCondition(store().rootId);
    vi.setSystemTime(1100); // within the coalesce window
    store().addCondition(store().rootId);

    expect(history().past).toHaveLength(1);
    history().undo();
    expect(nodeCount()).toBe(1); // both conditions removed in one undo
  });

  it("keeps separated edits as distinct steps", () => {
    vi.setSystemTime(1000);
    store().addCondition(store().rootId);
    vi.setSystemTime(2000);
    store().addGroup(store().rootId);
    expect(history().past).toHaveLength(2);

    history().undo();
    history().undo();
    expect(nodeCount()).toBe(1);
  });

  it("clears the redo stack on a new edit", () => {
    vi.setSystemTime(1000);
    store().addCondition(store().rootId);
    history().undo();
    expect(history().canRedo).toBe(true);

    vi.setSystemTime(2000);
    store().addCondition(store().rootId);
    expect(history().canRedo).toBe(false);
  });
});
