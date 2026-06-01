import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import type { OperatorId } from "@/lib/query/types";
import { DEFAULT_SOURCE_ID } from "@/lib/schema/sources";
import { useQueryStore } from "@/lib/store/queryStore";
import { useSourceStore } from "@/lib/store/sourceStore";
import { QueryPreview } from "@/components/builder/query-preview";

const store = () => useQueryStore.getState();

function addCondition(
  parentId: string,
  field: string,
  operator: OperatorId,
  value: unknown,
) {
  const id = store().addCondition(parentId)!;
  store().updateCondition(id, { field, operator, value } as never);
  return id;
}

beforeEach(() => {
  store().reset();
  useSourceStore.getState().setSource(DEFAULT_SOURCE_ID);
});

describe("query preview", () => {
  it("renders SQL by default with a natural-language summary", () => {
    addCondition(store().rootId, "rating", "gt", 8);
    render(<QueryPreview />);

    expect(screen.getByText(/SELECT \*/)).toBeInTheDocument();
    expect(screen.getByText(/rating > 8/)).toBeInTheDocument();
    expect(
      screen.getByText(/Movies where Rating is greater than 8/),
    ).toBeInTheDocument();
  });

  it("switches formats through the tabs", async () => {
    const user = userEvent.setup();
    addCondition(store().rootId, "rating", "gt", 8);
    render(<QueryPreview />);

    await user.click(screen.getByRole("button", { name: "MongoDB" }));
    expect(screen.getByText(/"\$gt": 8/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "GraphQL" }));
    expect(screen.getByText(/_gt: 8/)).toBeInTheDocument();
  });

  it("updates live as the query changes", () => {
    const { rerender } = render(<QueryPreview />);
    expect(screen.getByText(/All movies\./)).toBeInTheDocument();

    addCondition(store().rootId, "genre", "eq", "Sci-Fi");
    rerender(<QueryPreview />);
    expect(screen.getByText(/genre = 'Sci-Fi'/)).toBeInTheDocument();
  });
});
