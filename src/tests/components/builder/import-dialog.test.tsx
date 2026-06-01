import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { serializeQuery } from "@/lib/query/serialize";
import { DEFAULT_SOURCE_ID } from "@/lib/schema/sources";
import { useQueryStore } from "@/lib/store/queryStore";
import { useSourceStore } from "@/lib/store/sourceStore";
import { ImportDialog } from "@/components/builder/import-dialog";

const store = () => useQueryStore.getState();

beforeEach(() => {
  store().reset();
  useSourceStore.getState().setSource(DEFAULT_SOURCE_ID);
});

describe("import dialog", () => {
  it("shows an inline error for invalid JSON", async () => {
    const user = userEvent.setup();
    render(<ImportDialog onClose={vi.fn()} />);

    // fireEvent.change avoids userEvent treating JSON braces as special keys
    fireEvent.change(screen.getByLabelText("Query JSON"), {
      target: { value: "not json" },
    });
    await user.click(screen.getByRole("button", { name: "Import" }));

    expect(await screen.findByText(/not valid json/i)).toBeInTheDocument();
  });

  it("imports a valid query, applies it, and closes", async () => {
    const user = userEvent.setup();
    const id = store().addCondition(store().rootId)!;
    store().updateCondition(id, {
      field: "rating",
      operator: "gt",
      value: 8,
    } as never);
    const json = serializeQuery(
      { rootId: store().rootId, nodes: store().nodes },
      "books",
    );
    store().reset();

    const onClose = vi.fn();
    render(<ImportDialog onClose={onClose} />);
    fireEvent.change(screen.getByLabelText("Query JSON"), {
      target: { value: json },
    });
    await user.click(screen.getByRole("button", { name: "Import" }));

    expect(onClose).toHaveBeenCalled();
    expect(Object.keys(store().nodes)).toHaveLength(2);
    expect(useSourceStore.getState().sourceId).toBe("books");
  });
});
