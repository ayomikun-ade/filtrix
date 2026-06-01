import { beforeEach, describe, expect, it } from "vitest";

import { createEmptyTree } from "@/lib/query/types";
import { usePresetsStore } from "@/lib/store/presetsStore";

const presets = () => usePresetsStore.getState().presets;

beforeEach(() => {
  usePresetsStore.setState({ presets: [] });
});

describe("presets store", () => {
  it("saves presets newest-first with their source", () => {
    usePresetsStore.getState().save("First", "movies", createEmptyTree());
    usePresetsStore.getState().save("Second", "books", createEmptyTree());

    expect(presets()).toHaveLength(2);
    expect(presets()[0].name).toBe("Second");
    expect(presets()[0].sourceId).toBe("books");
    expect(presets()[0].id).not.toBe(presets()[1].id);
  });

  it("removes a preset by id", () => {
    usePresetsStore.getState().save("Keep", "movies", createEmptyTree());
    usePresetsStore.getState().save("Drop", "movies", createEmptyTree());
    const dropId = presets()[0].id;

    usePresetsStore.getState().remove(dropId);
    expect(presets()).toHaveLength(1);
    expect(presets()[0].name).toBe("Keep");
  });
});
