import type { QueryTree } from "@/lib/query/types";
import type { DataSource } from "@/lib/schema/types";
import { toGraphql } from "@/lib/query/builders/graphql";
import { toMongoString } from "@/lib/query/builders/mongo";
import { toNaturalLanguage } from "@/lib/query/builders/nl";
import { toSql } from "@/lib/query/builders/sql";

export type QueryFormat = "sql" | "mongo" | "graphql";

export interface GeneratedQueries {
  sql: string;
  mongo: string;
  graphql: string;
  summary: string;
}

export function generateQueries(
  tree: QueryTree,
  source: DataSource,
): GeneratedQueries {
  return {
    sql: toSql(tree, source),
    mongo: toMongoString(tree),
    graphql: toGraphql(tree, source),
    summary: toNaturalLanguage(tree, source),
  };
}

export { toSql } from "@/lib/query/builders/sql";
export { toMongo, toMongoString } from "@/lib/query/builders/mongo";
export { toGraphql } from "@/lib/query/builders/graphql";
export { toNaturalLanguage } from "@/lib/query/builders/nl";
