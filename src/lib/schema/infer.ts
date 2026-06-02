import type { FieldType, ScalarValue } from "@/lib/query/types";
import type { DataSource, FieldDef } from "@/lib/schema/types";
import { createId } from "@/lib/utils/id";

// Guard rails for user-imported data — keeps the in-memory dataset bounded and
// the generated controls sane.
const MAX_ROWS = 5000;
const MAX_FIELDS = 50;
const MAX_STRING = 2000;
const ENUM_MAX_DISTINCT = 12;

type RawRow = Record<string, ScalarValue>;

export type ParseDatasetResult =
  | { ok: true; source: DataSource }
  | { ok: false; error: string };

// Accepts a bare array of row objects, or `{ name?, rows }`. The schema (field
// names, types, enum values) is inferred from the data.
export function parseDataset(
  input: string,
  nameOverride: string,
): ParseDatasetResult {
  let raw: unknown;
  try {
    raw = JSON.parse(input);
  } catch {
    return { ok: false, error: "That is not valid JSON." };
  }

  let rawRows: unknown;
  let docName = "";

  if (Array.isArray(raw)) {
    rawRows = raw;
  } else if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    rawRows = obj.rows;
    if (typeof obj.name === "string") docName = obj.name.trim();
  } else {
    return {
      ok: false,
      error: 'Expected a JSON array of rows, or an object with a "rows" array.',
    };
  }

  if (!Array.isArray(rawRows)) {
    return { ok: false, error: '"rows" must be an array of objects.' };
  }
  if (rawRows.length === 0) {
    return { ok: false, error: "The dataset has no rows." };
  }
  if (rawRows.length > MAX_ROWS) {
    return { ok: false, error: `Too many rows (max ${MAX_ROWS}).` };
  }

  const rows: RawRow[] = [];
  for (const r of rawRows) {
    if (!r || typeof r !== "object" || Array.isArray(r)) {
      return { ok: false, error: "Every row must be a JSON object." };
    }
    rows.push(sanitizeRow(r as Record<string, unknown>));
  }

  const fields = inferSchema(rows);
  if (fields.length === 0) {
    return { ok: false, error: "Could not find any fields in the data." };
  }
  if (fields.length > MAX_FIELDS) {
    return { ok: false, error: `Too many fields (max ${MAX_FIELDS}).` };
  }

  const name = (nameOverride.trim() || docName || "Imported data").slice(0, 60);
  return {
    ok: true,
    source: {
      id: createId("src"),
      name,
      description: `Imported · ${rows.length} ${rows.length === 1 ? "row" : "rows"}`,
      fields,
      rows,
      custom: true,
    },
  };
}

// Infers a FieldDef per key (union of keys across rows, first-seen order).
export function inferSchema(rows: RawRow[]): FieldDef[] {
  const keys: string[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (!seen.has(key)) {
        seen.add(key);
        keys.push(key);
      }
    }
  }

  return keys.slice(0, MAX_FIELDS).map((key) => {
    const present = rows
      .map((r) => r[key])
      .filter((v) => v !== null && v !== undefined && v !== "");
    const type = inferType(present);
    const field: FieldDef = { name: key, label: humanize(key), type };
    if (type === "enum") {
      field.values = distinct(present.map(String)).slice(0, ENUM_MAX_DISTINCT);
    }
    return field;
  });
}

function inferType(values: ScalarValue[]): FieldType {
  if (values.length === 0) return "string";
  if (values.every((v) => typeof v === "boolean")) return "boolean";
  if (values.every((v) => typeof v === "number")) return "number";
  if (values.every(isDateString)) return "date";
  if (values.every((v) => typeof v === "string")) {
    const d = distinct(values.map(String));
    if (d.length <= ENUM_MAX_DISTINCT && d.length < values.length)
      return "enum";
  }
  return "string";
}

function isDateString(value: ScalarValue): boolean {
  if (typeof value !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}/.test(value)) return false;
  return !Number.isNaN(new Date(value).getTime());
}

function distinct(values: string[]): string[] {
  return [...new Set(values)];
}

// camelCase / snake_case / kebab-case → "Sentence case" (matches built-ins).
function humanize(key: string): string {
  const spaced = key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .trim()
    .toLowerCase();
  if (!spaced) return key;
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function sanitizeRow(row: Record<string, unknown>): RawRow {
  const out: RawRow = {};
  for (const [key, value] of Object.entries(row)) {
    out[key] = sanitizeValue(value);
  }
  return out;
}

// Keeps scalars; collapses nested objects/arrays to a bounded JSON string so the
// table and operators only ever deal with primitives.
function sanitizeValue(value: unknown): ScalarValue {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.slice(0, MAX_STRING);
  try {
    return JSON.stringify(value).slice(0, MAX_STRING);
  } catch {
    return String(value).slice(0, MAX_STRING);
  }
}
