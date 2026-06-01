import { beforeEach, describe, expect, it } from "vitest";

import {
  generateQueries,
  toGraphql,
  toMongo,
  toNaturalLanguage,
  toSql,
} from "@/lib/query/builders";
import type { OperatorId, QueryTree } from "@/lib/query/types";
import { movies } from "@/lib/schema/datasets/movies";
import { useQueryStore } from "@/lib/store/queryStore";

const store = () => useQueryStore.getState();
const tree = (): QueryTree => ({
  rootId: store().rootId,
  nodes: store().nodes,
});

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
});

describe("query generation", () => {
  it("handles an empty query", () => {
    expect(toSql(tree(), movies)).toBe("SELECT *\nFROM movies;");
    expect(toMongo(tree())).toEqual({});
    expect(toGraphql(tree(), movies)).not.toContain("where");
    expect(toNaturalLanguage(tree(), movies)).toBe("All movies.");
  });

  it("generates a flat single condition without extra parentheses", () => {
    addCondition(store().rootId, "rating", "gt", 8);
    expect(toSql(tree(), movies)).toBe(
      "SELECT *\nFROM movies\nWHERE rating > 8;",
    );
    expect(toMongo(tree())).toEqual({ rating: { $gt: 8 } });
  });

  it("joins multiple conditions with the root combinator", () => {
    addCondition(store().rootId, "genre", "eq", "Sci-Fi");
    addCondition(store().rootId, "rating", "gt", 8);

    const sql = toSql(tree(), movies);
    expect(sql).toContain("WHERE genre = 'Sci-Fi'");
    expect(sql).toContain("AND rating > 8");

    expect(toMongo(tree())).toEqual({
      $and: [{ genre: "Sci-Fi" }, { rating: { $gt: 8 } }],
    });
  });

  it("nests groups recursively with parentheses and $or/_or", () => {
    addCondition(store().rootId, "genre", "eq", "Sci-Fi");
    const group = store().addGroup(store().rootId, "OR")!;
    addCondition(group, "releaseDate", "after", "2010-01-01");
    addCondition(group, "title", "contains", "Star");

    const sql = toSql(tree(), movies);
    expect(sql).toContain(
      "(releaseDate > '2010-01-01' OR title LIKE '%Star%')",
    );

    expect(toMongo(tree())).toEqual({
      $and: [
        { genre: "Sci-Fi" },
        {
          $or: [
            { releaseDate: { $gt: "2010-01-01" } },
            { title: { $regex: "Star", $options: "i" } },
          ],
        },
      ],
    });

    const gql = toGraphql(tree(), movies);
    expect(gql).toContain("movies(where:");
    expect(gql).toContain("_and");
    expect(gql).toContain("_or");

    expect(toNaturalLanguage(tree(), movies)).toBe(
      'Movies where Genre is "Sci-Fi" and (Release date is after "2010-01-01" or Title contains "Star").',
    );
  });

  it("supports in / between / null operators", () => {
    addCondition(store().rootId, "genre", "in", ["Action", "Comedy"]);
    addCondition(store().rootId, "rating", "between", [7, 9]);
    addCondition(store().rootId, "director", "isNotNull", null);

    const sql = toSql(tree(), movies);
    expect(sql).toContain("genre IN ('Action', 'Comedy')");
    expect(sql).toContain("rating BETWEEN 7 AND 9");
    expect(sql).toContain("director IS NOT NULL");

    expect(toMongo(tree())).toEqual({
      $and: [
        { genre: { $in: ["Action", "Comedy"] } },
        { rating: { $gte: 7, $lte: 9 } },
        { director: { $ne: null } },
      ],
    });
  });

  it("escapes single quotes in SQL string values", () => {
    addCondition(store().rootId, "director", "eq", "O'Brien");
    expect(toSql(tree(), movies)).toContain("director = 'O''Brien'");
  });

  it("skips incomplete conditions", () => {
    store().addCondition(store().rootId); // no field/operator/value
    addCondition(store().rootId, "rating", "gt", 8);

    expect(toSql(tree(), movies)).toBe(
      "SELECT *\nFROM movies\nWHERE rating > 8;",
    );
    expect(toMongo(tree())).toEqual({ rating: { $gt: 8 } });
  });

  it("generateQueries returns all four formats", () => {
    addCondition(store().rootId, "rating", "gt", 8);
    const out = generateQueries(tree(), movies);
    expect(out.sql).toContain("rating > 8");
    expect(out.mongo).toContain('"$gt": 8');
    expect(out.graphql).toContain("_gt: 8");
    expect(out.summary).toBe("Movies where Rating is greater than 8.");
  });
});
