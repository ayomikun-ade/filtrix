"use client";

import { memo } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

import { getOperatorsForType } from "@/lib/query/operators";
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
import { ValueControl } from "@/components/builder/value-control";
import { NativeSelect } from "@/components/ui/native-select";

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

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card px-2.5 py-2">
      <div className="w-40">
        <NativeSelect
          aria-label="Field"
          value={node.field ?? ""}
          onChange={(e) => handleFieldChange(e.target.value)}
        >
          <option value="">Field…</option>
          {source.fields.map((f) => (
            <option key={f.name} value={f.name}>
              {f.label}
            </option>
          ))}
        </NativeSelect>
      </div>

      {field ? (
        <div className="w-36">
          <NativeSelect
            aria-label="Operator"
            value={node.operator ?? ""}
            onChange={(e) => handleOperatorChange(e.target.value as OperatorId)}
          >
            {operators.map((op) => (
              <option key={op.id} value={op.id}>
                {op.label}
              </option>
            ))}
          </NativeSelect>
        </div>
      ) : null}

      {field && node.operator ? (
        <div className="min-w-40 flex-1">
          <ValueControl
            field={field}
            operator={node.operator}
            value={node.value}
            onChange={handleValueChange}
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
  );
}

export const QueryCondition = memo(QueryConditionImpl);
