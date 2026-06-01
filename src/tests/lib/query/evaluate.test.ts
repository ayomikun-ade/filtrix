import { beforeEach, describe, expect, it } from "vitest";

import { buildPredicate, type Row } from "@/lib/query/evaluate";
import type { OperatorId, QueryTree } from "@/lib/query/types";
import { movies } from "@/lib/schema/datasets/movies";
import { useQueryStore } from "@/lib/store/queryStore";

const store = () => useQueryStore.getState();
const tree = (): QueryTree => ({
  rootId: store().rootId,
  nodes: store().nodes,
});

function add(
  parentId: string,
  field: string,
  operator: OperatorId,
  value: unknown,
) {
  const id = store().addCondition(parentId)!;
  store().updateCondition(id, { field, operator, value } as never);
  return id;
}

const ROWS: Row[] = [
  {
    title: "A",
    genre: "Sci-Fi",
    rating: 9,
    year: 2012,
    releaseDate: "2012-05-01",
    isAwardWinner: true,
    director: "X",
  },
  {
    title: "B",
    genre: "Comedy",
    rating: 6,
    year: 2008,
    releaseDate: "2008-01-01",
    isAwardWinner: false,
    director: "Y",
  },
  {
    title: "Star Wars",
    genre: "Sci-Fi",
    rating: 7,
    year: 2019,
    releaseDate: "2019-12-01",
    isAwardWinner: false,
    director: "Z",
  },
];

const titles = () =>
  ROWS.filter(buildPredicate(tree(), movies)).map((r) => r.title);

beforeEach(() => {
  store().reset();
});

describe("evaluator", () => {
  it("matches everything for an empty query", () => {
    expect(titles()).toEqual(["A", "B", "Star Wars"]);
  });

  it("filters by equality on an enum", () => {
    add(store().rootId, "genre", "eq", "Sci-Fi");
    expect(titles()).toEqual(["A", "Star Wars"]);
  });

  it("filters by greater-than on a number", () => {
    add(store().rootId, "rating", "gt", 8);
    expect(titles()).toEqual(["A"]);
  });

  it("does case-insensitive contains", () => {
    add(store().rootId, "title", "contains", "star");
    expect(titles()).toEqual(["Star Wars"]);
  });

  it("combines conditions with AND", () => {
    add(store().rootId, "genre", "eq", "Sci-Fi");
    add(store().rootId, "rating", "gt", 8);
    expect(titles()).toEqual(["A"]);
  });

  it("combines conditions with OR", () => {
    store().setCombinator(store().rootId, "OR");
    add(store().rootId, "genre", "eq", "Comedy");
    add(store().rootId, "rating", "gt", 8);
    expect(titles().sort()).toEqual(["A", "B"]);
  });

  it("handles between (inclusive), in, after, boolean, and null checks", () => {
    add(store().rootId, "rating", "between", [6, 7]);
    expect(titles().sort()).toEqual(["B", "Star Wars"]);

    store().reset();
    add(store().rootId, "releaseDate", "after", "2015-01-01");
    expect(titles()).toEqual(["Star Wars"]);

    store().reset();
    add(store().rootId, "isAwardWinner", "eq", true);
    expect(titles()).toEqual(["A"]);

    store().reset();
    add(store().rootId, "director", "isNotNull", null);
    expect(titles()).toHaveLength(3);
  });

  it("evaluates a nested OR within an AND", () => {
    add(store().rootId, "genre", "eq", "Sci-Fi");
    const group = store().addGroup(store().rootId, "OR")!;
    add(group, "rating", "gt", 8);
    add(group, "year", "gt", 2015);
    expect(titles().sort()).toEqual(["A", "Star Wars"]);
  });
});
