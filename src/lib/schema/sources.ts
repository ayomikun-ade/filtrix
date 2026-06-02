import { books } from "@/lib/schema/datasets/books";
import { movies } from "@/lib/schema/datasets/movies";
import { songs } from "@/lib/schema/datasets/songs";
import type { DataSource, FieldDef } from "@/lib/schema/types";

export const DATA_SOURCES: DataSource[] = [movies, books, songs];

export const DEFAULT_SOURCE_ID = movies.id;

// User-imported sources live in a persisted store; it mirrors them here via
// `setCustomSources` so the synchronous `getSource` can resolve them too,
// without this module depending on React or the store.
let customSources: DataSource[] = [];

export function setCustomSources(sources: DataSource[]): void {
  customSources = sources;
}

export function getAllSources(): DataSource[] {
  return [...DATA_SOURCES, ...customSources];
}

export function getSource(id: string): DataSource | undefined {
  return getAllSources().find((source) => source.id === id);
}

export function getField(
  source: DataSource,
  fieldName: string,
): FieldDef | undefined {
  return source.fields.find((field) => field.name === fieldName);
}
