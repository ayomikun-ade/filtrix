import { books } from "@/lib/schema/datasets/books";
import { movies } from "@/lib/schema/datasets/movies";
import { songs } from "@/lib/schema/datasets/songs";
import type { DataSource, FieldDef } from "@/lib/schema/types";

export const DATA_SOURCES: DataSource[] = [movies, books, songs];

export const DEFAULT_SOURCE_ID = movies.id;

export function getSource(id: string): DataSource | undefined {
  return DATA_SOURCES.find((source) => source.id === id);
}

export function getField(
  source: DataSource,
  fieldName: string,
): FieldDef | undefined {
  return source.fields.find((field) => field.name === fieldName);
}
