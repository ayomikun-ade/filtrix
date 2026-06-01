import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { DEFAULT_SOURCE_ID } from "@/lib/schema/sources";
import { useHistoryStore } from "@/lib/store/historyStore";
import { useQueryStore } from "@/lib/store/queryStore";
import { useRunStore } from "@/lib/store/runStore";
import { useSourceStore } from "@/lib/store/sourceStore";

function Harness() {
  useKeyboardShortcuts({ onOpenPalette: () => {} });
  return <input aria-label="field" />;
}

const store = () => useQueryStore.getState();
const nodeCount = () => Object.keys(store().nodes).length;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(0);
  store().reset();
  useHistoryStore.getState().clear();
  useSourceStore.getState().setSource(DEFAULT_SOURCE_ID);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useKeyboardShortcuts", () => {
  it("Ctrl+Enter requests a run", () => {
    render(<Harness />);
    const before = useRunStore.getState().token;
    fireEvent.keyDown(window, { key: "Enter", ctrlKey: true });
    expect(useRunStore.getState().token).toBe(before + 1);
  });

  it("Ctrl+Shift+C clears the query", () => {
    render(<Harness />);
    store().addCondition(store().rootId);
    expect(nodeCount()).toBe(2);
    fireEvent.keyDown(window, { key: "c", ctrlKey: true, shiftKey: true });
    expect(nodeCount()).toBe(1);
  });

  it("Ctrl+Z undoes the last edit", () => {
    render(<Harness />);
    vi.setSystemTime(1000); // past the coalesce window so this is its own step
    store().addCondition(store().rootId);
    fireEvent.keyDown(window, { key: "z", ctrlKey: true });
    expect(nodeCount()).toBe(1);
  });

  it("does not fire field shortcuts while a field is focused", () => {
    render(<Harness />);
    const before = useRunStore.getState().token;
    // Ctrl+Enter dispatched from within an input → Run is suppressed
    fireEvent.keyDown(screen.getByLabelText("field"), {
      key: "Enter",
      ctrlKey: true,
    });
    expect(useRunStore.getState().token).toBe(before);
  });
});
