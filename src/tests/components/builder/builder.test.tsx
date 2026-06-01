import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { isCondition } from "@/lib/query/types";
import { DEFAULT_SOURCE_ID } from "@/lib/schema/sources";
import { useQueryStore } from "@/lib/store/queryStore";
import { useSourceStore } from "@/lib/store/sourceStore";
import { BuilderCanvas } from "@/components/builder/builder-canvas";

const store = () => useQueryStore.getState();

function conditionIds() {
  return Object.values(store().nodes)
    .filter(isCondition)
    .map((n) => n.id);
}

beforeEach(() => {
  store().reset();
  useSourceStore.getState().setSource(DEFAULT_SOURCE_ID);
});

describe("builder canvas", () => {
  it("shows an empty state for a fresh query", () => {
    render(<BuilderCanvas />);
    expect(screen.getByText(/no rules yet/i)).toBeInTheDocument();
  });

  it("adds a condition row with a field selector", async () => {
    const user = userEvent.setup();
    render(<BuilderCanvas />);

    await user.click(screen.getByRole("button", { name: /add condition/i }));

    expect(screen.getByLabelText("Field")).toBeInTheDocument();
    expect(conditionIds()).toHaveLength(1);
  });

  it("reveals operator and value controls after picking a field", async () => {
    const user = userEvent.setup();
    render(<BuilderCanvas />);
    await user.click(screen.getByRole("button", { name: /add condition/i }));

    await user.selectOptions(screen.getByLabelText("Field"), "rating");

    expect(screen.getByLabelText("Operator")).toBeInTheDocument();
    // number field + default operator (equals) -> a number input
    expect(screen.getByRole("spinbutton")).toBeInTheDocument();
  });

  it("swaps the value control when the operator changes", async () => {
    const user = userEvent.setup();
    render(<BuilderCanvas />);
    await user.click(screen.getByRole("button", { name: /add condition/i }));
    await user.selectOptions(screen.getByLabelText("Field"), "rating");

    await user.selectOptions(screen.getByLabelText("Operator"), "between");

    // between -> two number inputs (a range)
    expect(screen.getAllByRole("spinbutton")).toHaveLength(2);
  });

  it("writes edited values back to the store", async () => {
    const user = userEvent.setup();
    render(<BuilderCanvas />);
    await user.click(screen.getByRole("button", { name: /add condition/i }));
    await user.selectOptions(screen.getByLabelText("Field"), "rating");

    await user.type(screen.getByRole("spinbutton"), "8");

    const [id] = conditionIds();
    expect(store().nodes[id]).toMatchObject({
      field: "rating",
      operator: "eq",
      value: 8,
    });
  });

  it("renders nested groups recursively", async () => {
    const user = userEvent.setup();
    render(<BuilderCanvas />);

    await user.click(screen.getByRole("button", { name: /add group/i }));
    // root group + nested group => two AND/OR toggles, two "Add condition" bars
    expect(screen.getAllByRole("button", { name: "AND" })).toHaveLength(2);

    // The nested group's AddBar renders before the root's, so it comes first.
    const addConditionButtons = screen.getAllByRole("button", {
      name: /add condition/i,
    });
    await user.click(addConditionButtons[0]);

    expect(conditionIds()).toHaveLength(1);
    const [condId] = conditionIds();
    const parent = store().nodes[store().nodes[condId].parentId!];
    expect(parent.parentId).toBe(store().rootId); // condition sits in the nested group
  });

  it("removes a condition", async () => {
    const user = userEvent.setup();
    render(<BuilderCanvas />);
    await user.click(screen.getByRole("button", { name: /add condition/i }));
    expect(conditionIds()).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: /remove condition/i }));

    expect(conditionIds()).toHaveLength(0);
    expect(screen.getByText(/no rules yet/i)).toBeInTheDocument();
  });

  it("collapses a group to hide its children", async () => {
    const user = userEvent.setup();
    render(<BuilderCanvas />);
    await user.click(screen.getByRole("button", { name: /add condition/i }));
    expect(screen.getByLabelText("Field")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /collapse group/i }));

    // The body animates out before unmounting, so await its removal.
    await waitFor(() =>
      expect(screen.queryByLabelText("Field")).not.toBeInTheDocument(),
    );
  });

  it("updates the combinator from the store", async () => {
    const user = userEvent.setup();
    render(<BuilderCanvas />);

    await user.click(screen.getByRole("button", { name: "OR" }));

    const root = store().nodes[store().rootId];
    expect(root.type === "group" && root.combinator).toBe("OR");
  });
});
