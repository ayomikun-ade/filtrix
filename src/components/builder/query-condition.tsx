"use client";

import { memo } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

import { getOperator, getOperatorsForType } from "@/lib/query/operators";
import {
  isCondition,
  type ConditionValue,
  type NodeId,
  type OperatorId,
} from "@/lib/query/types";
import { getDefaultOperator, getDefaultValue } from "@/lib/schema/resolve";
import { getField, getSource } from "@/lib/schema/sources";
import { useNode, useQueryActions } from "@/lib/store/hooks";
import { useSourceStore } from "@/lib/store/sourceStore";
import { conditionStatus, validateCondition } from "@/lib/validation/validate";
import { ValueControl } from "@/components/builder/value-control";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

function QueryConditionImpl({ id }: { id: NodeId }) {
  const node = useNode(id);
  const sourceId = useSourceStore((s) => s.sourceId);
  const { updateCondition, removeNode } = useQueryActions();

  if (!node || !isCondition(node)) return null;
  const source = getSource(sourceId);
  if (!source) return null;

  const field = node.field ? getField(source, node.field) : undefined;
  const operators = field ? getOperatorsForType(field.type) : [];

  function handleFieldChange(name: string) {
    const nextField = name ? getField(source!, name) : undefined;
    if (!nextField) {
      updateCondition(id, { field: null, operator: null, value: null });
      return;
    }
    const operator = getDefaultOperator(nextField);
    updateCondition(id, {
      field: name,
      operator,
      value: operator ? getDefaultValue(nextField, operator) : null,
    });
  }

  function handleOperatorChange(operator: OperatorId) {
    if (!field) return;
    updateCondition(id, { operator, value: getDefaultValue(field, operator) });
  }

  function handleValueChange(value: ConditionValue) {
    updateCondition(id, { value });
  }

  const errors = validateCondition(node, source);
  const status = conditionStatus(node, source);
  const isInvalid = status === "invalid";
  // An engaged-but-unfinished row is flagged amber; a pristine row stays neutral.
  const isIncomplete = status === "incomplete";

  return (
    <div className="space-y-1">
      <div
        className={cn(
          "flex flex-wrap items-center gap-2 rounded-md border bg-card px-2.5 py-2",
          isInvalid
            ? "border-destructive/50"
            : isIncomplete
              ? "border-amber-500/50"
              : "border-border",
        )}
      >
        <div className="w-40">
          <Select
            items={source.fields.map((f) => ({
              value: f.name,
              label: f.label,
            }))}
            value={node.field}
            onValueChange={(v) => handleFieldChange(v ?? "")}
          >
            <SelectTrigger
              aria-label="Field"
              aria-invalid={isInvalid && !node.field}
              className="w-full"
            >
              <SelectValue placeholder="Field…" />
            </SelectTrigger>
            <SelectContent>
              {source.fields.map((f) => (
                <SelectItem key={f.name} value={f.name}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {field ? (
          <div className="w-36">
            <Select
              items={operators.map((op) => ({
                value: op.id,
                label: op.label,
              }))}
              value={node.operator}
              onValueChange={(v) => {
                if (v) handleOperatorChange(v as OperatorId);
              }}
            >
              <SelectTrigger aria-label="Operator" className="w-full">
                <SelectValue placeholder="Operator…" />
              </SelectTrigger>
              <SelectContent>
                {operators.map((op) => (
                  <SelectItem key={op.id} value={op.id}>
                    {op.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        {field && node.operator ? (
          <div className="min-w-40 flex-1">
            <ValueControl
              field={field}
              operator={node.operator}
              value={node.value}
              onChange={handleValueChange}
              invalid={isInvalid}
            />
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => removeNode(id)}
          aria-label="Remove condition"
          className="ml-auto inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
        </button>
      </div>

      {isInvalid ? (
        <p className="px-1 text-xs text-destructive">{errors[0]}</p>
      ) : isIncomplete ? (
        <p className="px-1 text-xs text-amber-600 dark:text-amber-500">
          {incompleteHint(node.operator)}
        </p>
      ) : null}
    </div>
  );
}

// A short nudge for an engaged-but-unfinished condition.
function incompleteHint(operator: OperatorId | null): string {
  if (!operator) return "Choose an operator.";
  switch (getOperator(operator).arity) {
    case "list":
      return "Add at least one value.";
    case "binary":
      return "Fill in both ends of the range.";
    default:
      return "Add a value to finish this condition.";
  }
}

export const QueryCondition = memo(QueryConditionImpl);
