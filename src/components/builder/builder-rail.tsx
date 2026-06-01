"use client";

import { PresetList } from "@/components/builder/preset-list";
import { RunHistoryList } from "@/components/builder/run-history-list";
import { SourcePicker } from "@/components/builder/source-picker";

export function BuilderRail({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex flex-col gap-6">
      <PanelSection label="Data source">
        <SourcePicker onNavigate={onNavigate} />
      </PanelSection>
      <PanelSection label="Saved presets">
        <PresetList onNavigate={onNavigate} />
      </PanelSection>
      <PanelSection label="History">
        <RunHistoryList onNavigate={onNavigate} />
      </PanelSection>
    </div>
  );
}

function PanelSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
        {label}
      </span>
      {children}
    </div>
  );
}
