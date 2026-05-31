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
}
