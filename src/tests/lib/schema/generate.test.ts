import { describe, expect, it } from "vitest";

import { expandDataset } from "@/lib/schema/generate";
import { movies } from "@/lib/schema/datasets/movies";
import { songs } from "@/lib/schema/datasets/songs";

describe("expandDataset", () => {
  it("produces the requested count, deterministically", () => {
    const a = expandDataset(movies, 250);
    const b = expandDataset(movies, 250);
    expect(a).toHaveLength(250);
    expect(a).toEqual(b);
  });

  it("cycles seed rows for non-number fields and varies numbers", () => {
    const rows = expandDataset(movies, 100);
    const len = movies.rows.length;
    expect(rows[0].title).toBe(movies.rows[0].title);
    expect(rows[len].title).toBe(movies.rows[0].title); // wraps after a full cycle
    expect(new Set(rows.map((r) => r.rating)).size).toBeGreaterThan(1);
  });

  it("gives a rarer category several distinct rows, not duplicates", () => {
    const rows = expandDataset(songs, 600);
    const rnb = rows.filter((r) => r.genre === "R&B");
    expect(rnb.length).toBeGreaterThan(20);
    expect(new Set(rnb.map((r) => r.title)).size).toBeGreaterThan(4);
  });
});
