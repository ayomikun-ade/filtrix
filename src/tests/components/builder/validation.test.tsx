import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { DEFAULT_SOURCE_ID } from "@/lib/schema/sources";
import { useQueryStore } from "@/lib/store/queryStore";
import { useSourceStore } from "@/lib/store/sourceStore";
import { BuilderCanvas } from "@/components/builder/builder-canvas";
import { ValidationBadge } from "@/components/builder/validation-badge";
import { selectOption } from "@/tests/helpers";

const store = () => useQueryStore.getState();

beforeEach(() => {
  store().reset();
  useSourceStore.getState().setSource(DEFAULT_SOURCE_ID);
});

describe("validation in the builder", () => {
  it("does not flag a freshly added condition", async () => {
    const user = userEvent.setup();
    render(<BuilderCanvas />);
    await user.click(screen.getByRole("button", { name: /add condition/i }));

    expect(
      screen.queryByText(
        /must be|can't be applied|range start|group is empty/i,
      ),
    ).toBeNull();
  });

  it("flags an empty nested group", async () => {
    const user = userEvent.setup();
    render(<BuilderCanvas />);
    await user.click(screen.getByRole("button", { name: /add group/i }));

    expect(screen.getByText(/group is empty/i)).toBeInTheDocument();
  });

  it("flags an out-of-order range inline", async () => {
    const user = userEvent.setup();
    render(<BuilderCanvas />);
    await user.click(screen.getByRole("button", { name: /add condition/i }));
    await selectOption(user, "Field", "Rating");
    await selectOption(user, "Operator", "between");

    const [from, to] = screen.getAllByRole("spinbutton");
    await user.type(from, "9");
    await user.type(to, "7");

    expect(
      screen.getByText(/range start must be less than or equal/i),
    ).toBeInTheDocument();
  });

  it("badge shows the issue count", () => {
    const id = store().addCondition(store().rootId)!;
    store().updateCondition(id, {
      field: "rating",
      operator: "between",
      value: [9, 7],
    } as never);

    render(<ValidationBadge />);
    expect(screen.getByText(/1 issue/i)).toBeInTheDocument();
  });
});
