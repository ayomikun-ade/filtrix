import type { FieldType } from "@/lib/query/types";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  values?: string[]; // required for enum fields
}

export interface DataSource {
  id: string;
  name: string;
  description: string;
  fields: FieldDef[];
  rows: Record<string, unknown>[];
  // User-imported sources run against their real rows (no synthetic expansion)
  // and can be removed from the picker. Built-in sources leave this unset.
  custom?: boolean;
}
