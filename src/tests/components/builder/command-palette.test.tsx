import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_SOURCE_ID } from "@/lib/schema/sources";
import { useQueryStore } from "@/lib/store/queryStore";
import { useSourceStore } from "@/lib/store/sourceStore";
import { CommandPalette } from "@/components/builder/command-palette";

const store = () => useQueryStore.getState();

beforeEach(() => {
  store().reset();
  useSourceStore.getState().setSource(DEFAULT_SOURCE_ID);
});

describe("command palette", () => {
  it("filters and runs a command, then closes", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<CommandPalette onClose={onClose} />);

    await user.type(screen.getByLabelText("Command"), "add condition");
    await user.keyboard("{Enter}");

    expect(Object.keys(store().nodes)).toHaveLength(2);
    expect(onClose).toHaveBeenCalled();
  });

  it("shows shortcut chips for commands that have them", () => {
    render(<CommandPalette onClose={vi.fn()} />);
    const runItem = screen.getByRole("button", { name: /run query/i });
    // chord chips render inside the Run item (mod + Enter)
    expect(runItem.textContent).toMatch(/Run query.*(Ctrl|⌘)/i);
  });

  it("shows an empty state and closes on Escape", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<CommandPalette onClose={onClose} />);

    await user.type(screen.getByLabelText("Command"), "zzzzz");
    expect(screen.getByText(/no matching commands/i)).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });
});
