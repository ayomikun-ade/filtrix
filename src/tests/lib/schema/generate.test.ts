import { describe, expect, it } from "vitest";

import { expandDataset } from "@/lib/schema/generate";
import { movies } from "@/lib/schema/datasets/movies";

describe("expandDataset", () => {
  it("produces the requested count, deterministically", () => {
    const a = expandDataset(movies, 250);
    const b = expandDataset(movies, 250);
    expect(a).toHaveLength(250);
    expect(a).toEqual(b);
  });

  it("cycles seed rows for non-number fields and varies numbers", () => {
    const rows = expandDataset(movies, 40);
    expect(rows[0].title).toBe(movies.rows[0].title);
    expect(rows[20].title).toBe(movies.rows[0].title);
    expect(new Set(rows.map((r) => r.rating)).size).toBeGreaterThan(1);
  });
});
