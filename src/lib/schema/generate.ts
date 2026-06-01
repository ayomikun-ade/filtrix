import type { DataSource } from "@/lib/schema/types";

export const DATASET_SIZE = 600;

type Row = Record<string, unknown>;

// Deterministically expands a source's seed rows into `count` rows by cycling the
// seeds and jittering numeric fields, so filtering/sorting have real variety
// without shipping hundreds of literal rows. Deterministic = reproducible tests.
export function expandDataset(source: DataSource, count: number): Row[] {
  const base = source.rows;
  if (base.length === 0) return [];

  const rows: Row[] = [];
  for (let i = 0; i < count; i += 1) {
    const seed = base[i % base.length];
    const row: Row = { ...seed };
    for (const field of source.fields) {
      if (field.type === "number") {
        const n = Number(seed[field.name]);
        const jitter = ((i * 7 + field.name.length * 3) % 11) - 5;
        row[field.name] = Math.max(0, Math.round((n + jitter) * 10) / 10);
      }
    }
    rows.push(row);
  }
  return rows;
}
