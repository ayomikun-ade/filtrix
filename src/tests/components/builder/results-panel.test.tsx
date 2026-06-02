import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import type { OperatorId } from "@/lib/query/types";
import { DEFAULT_SOURCE_ID } from "@/lib/schema/sources";
import { useQueryStore } from "@/lib/store/queryStore";
import { useSourceStore } from "@/lib/store/sourceStore";
import { ResultsPanel } from "@/components/builder/results-panel";

const store = () => useQueryStore.getState();

function add(field: string, operator: OperatorId, value: unknown) {
  const id = store().addCondition(store().rootId)!;
  store().updateCondition(id, { field, operator, value } as never);
  return id;
}

beforeEach(() => {
  store().reset();
  useSourceStore.getState().setSource(DEFAULT_SOURCE_ID);
});

describe("results panel", () => {
  it("blocks Run while the query is invalid", async () => {
    const user = userEvent.setup();
    add("rating", "between", [9, 7]);
    render(<ResultsPanel />);

    expect(screen.getByRole("button", { name: /run/i })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: /expand results/i }));
    expect(screen.getByText(/fix .* to run/i)).toBeInTheDocument();
  });

  it("runs and reports the matching row count", async () => {
    const user = userEvent.setup();
    add("genre", "eq", "Sci-Fi");
    render(<ResultsPanel />);

    await user.click(screen.getByRole("button", { name: /run/i }));

    expect(await screen.findByText(/\d+ rows/)).toBeInTheDocument();
    // column headers render (not virtualized)
    expect(screen.getByRole("button", { name: "Title" })).toBeInTheDocument();
  });

  it("shows an empty state when nothing matches", async () => {
    const user = userEvent.setup();
    add("rating", "gt", 999);
    render(<ResultsPanel />);

    await user.click(screen.getByRole("button", { name: /run/i }));

    expect(await screen.findByText(/no rows match/i)).toBeInTheDocument();
  });

  it("paginates a full result set", async () => {
    const user = userEvent.setup();
    add("rating", "gt", 0); // every row has a positive rating, so all match
    render(<ResultsPanel />);

    await user.click(screen.getByRole("button", { name: /run/i }));

    expect(await screen.findByText("1 / 3")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /next page/i }));
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
  });
});
