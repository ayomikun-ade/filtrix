"use client";

import * as React from "react";

import type {
  ConditionValue,
  OperatorId,
  ScalarValue,
} from "@/lib/query/types";
import { resolveControl } from "@/lib/schema/resolve";
import type { FieldDef } from "@/lib/schema/types";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { cn } from "@/lib/utils";

interface ValueControlProps {
  field: FieldDef;
  operator: OperatorId;
  value: ConditionValue;
  onChange: (value: ConditionValue) => void;
  invalid?: boolean;
}

export function ValueControl({
  field,
  operator,
  value,
  onChange,
  invalid,
}: ValueControlProps) {
  switch (resolveControl(field, operator)) {
    case "none":
      return null;

    case "text":
      return (
        <Input
          value={asText(value)}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Value"
          aria-invalid={invalid}
        />
      );

    case "number":
      return (
        <Input
          type="number"
          value={asText(value)}
          onChange={(e) =>
            onChange(e.target.value === "" ? null : Number(e.target.value))
          }
          placeholder="0"
          aria-invalid={invalid}
        />
      );

    case "date":
      return (
        <Input
          type="date"
          value={asText(value)}
          onChange={(e) => onChange(e.target.value || null)}
          aria-invalid={invalid}
        />
      );

    case "boolean":
      return <BooleanToggle value={value === true} onChange={onChange} />;

    case "select":
      return (
        <NativeSelect
          value={asText(value)}
          onChange={(e) => onChange(e.target.value || null)}
          aria-invalid={invalid}
        >
          <option value="">Select…</option>
          {(field.values ?? []).map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </NativeSelect>
      );

    case "multiselect":
      return (
        <EnumChips
          options={field.values ?? []}
          value={asArray(value)}
          onChange={onChange}
        />
      );

    case "tags":
      return (
        <TagsInput field={field} value={asArray(value)} onChange={onChange} />
      );

    case "number-range":
      return (
        <RangeControl
          type="number"
          value={asTuple(value)}
          onChange={onChange}
        />
      );

    case "date-range":
      return (
        <RangeControl type="date" value={asTuple(value)} onChange={onChange} />
      );
  }
}

function BooleanToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="inline-flex overflow-hidden rounded-md border border-input text-sm">
      {[true, false].map((option) => (
        <button
          key={String(option)}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "px-3 py-1 transition-colors",
            value === option
              ? "bg-brand text-brand-foreground"
              : "bg-background text-muted-foreground hover:text-foreground",
          )}
        >
          {option ? "true" : "false"}
        </button>
      ))}
    </div>
  );
}

function EnumChips({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: ScalarValue[];
  onChange: (value: string[]) => void;
}) {
  const selected = new Set(value.map(String));

  function toggle(option: string) {
    const next = new Set(selected);
    if (next.has(option)) next.delete(option);
    else next.add(option);
    onChange([...next]);
  }

  return (
    <div className="flex flex-wrap gap-1">
      {options.map((option) => {
        const active = selected.has(option);
        return (
          <button
            key={option}
            type="button"
            aria-pressed={active}
            onClick={() => toggle(option)}
            className={cn(
              "rounded-md border px-2 py-0.5 text-xs transition-colors",
              active
                ? "border-brand bg-brand text-brand-foreground"
                : "border-input bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function TagsInput({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: ScalarValue[];
  onChange: (value: ScalarValue[]) => void;
}) {
  const [draft, setDraft] = React.useState("");

  function commit() {
    const raw = draft.trim();
    if (!raw) return;
    if (field.type === "number") {
      const num = Number(raw);
      if (Number.isNaN(num)) {
        setDraft("");
        return;
      }
      onChange([...value, num]);
    } else {
      onChange([...value, raw]);
    }
    setDraft("");
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-md border border-input bg-background px-1.5 py-1">
      {value.map((entry, index) => (
        <span
          key={`${String(entry)}-${index}`}
          className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-xs"
        >
          {String(entry)}
          <button
            type="button"
            onClick={() => removeAt(index)}
            aria-label={`Remove ${String(entry)}`}
            className="text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          } else if (e.key === "Backspace" && !draft && value.length) {
            removeAt(value.length - 1);
          }
        }}
        onBlur={commit}
        placeholder={value.length ? "" : "Add value…"}
        className="min-w-16 flex-1 bg-transparent text-sm outline-none"
      />
    </div>
  );
}

function RangeControl({
  type,
  value,
  onChange,
}: {
  type: "number" | "date";
  value: [ScalarValue, ScalarValue];
  onChange: (value: [ScalarValue, ScalarValue]) => void;
}) {
  const [from, to] = value;

  function set(index: 0 | 1, raw: string) {
    const parsed: ScalarValue =
      raw === "" ? null : type === "number" ? Number(raw) : raw;
    onChange(index === 0 ? [parsed, to] : [from, parsed]);
  }

  return (
    <div className="flex items-center gap-1.5">
      <Input
        type={type}
        value={from == null ? "" : String(from)}
        onChange={(e) => set(0, e.target.value)}
        placeholder={type === "number" ? "min" : undefined}
      />
      <span className="text-xs text-muted-foreground">and</span>
      <Input
        type={type}
        value={to == null ? "" : String(to)}
        onChange={(e) => set(1, e.target.value)}
        placeholder={type === "number" ? "max" : undefined}
      />
    </div>
  );
}

function asText(value: ConditionValue): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  return "";
}

function asArray(value: ConditionValue): ScalarValue[] {
  return Array.isArray(value) ? value : [];
}

function asTuple(value: ConditionValue): [ScalarValue, ScalarValue] {
  return Array.isArray(value) && value.length === 2
    ? [value[0], value[1]]
    : [null, null];
}
