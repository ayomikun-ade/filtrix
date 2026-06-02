import { beforeEach, describe, expect, it } from "vitest";

import { getSource } from "@/lib/schema/sources";
import type { DataSource } from "@/lib/schema/types";
import { useCustomSourcesStore } from "@/lib/store/customSourcesStore";

const source: DataSource = {
  id: "src_test",
  name: "Test source",
  description: "",
  fields: [{ name: "a", label: "A", type: "number" }],
  rows: [{ a: 1 }],
  custom: true,
};

beforeEach(() => {
  useCustomSourcesStore.setState({ sources: [] });
});

describe("customSourcesStore", () => {
  it("adds and removes sources", () => {
    useCustomSourcesStore.getState().addSource(source);
    expect(useCustomSourcesStore.getState().sources).toHaveLength(1);

    useCustomSourcesStore.getState().removeSource(source.id);
    expect(useCustomSourcesStore.getState().sources).toHaveLength(0);
  });

  it("syncs the registry so getSource resolves imported sources", () => {
    expect(getSource(source.id)).toBeUndefined();

    useCustomSourcesStore.getState().addSource(source);
    expect(getSource(source.id)?.name).toBe("Test source");

    useCustomSourcesStore.getState().removeSource(source.id);
    expect(getSource(source.id)).toBeUndefined();
  });

  it("de-duplicates by id", () => {
    useCustomSourcesStore.getState().addSource(source);
    useCustomSourcesStore.getState().addSource({ ...source, name: "Renamed" });
    const { sources } = useCustomSourcesStore.getState();
    expect(sources).toHaveLength(1);
    expect(sources[0].name).toBe("Renamed");
  });
});
