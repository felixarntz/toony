"use client";

import { Handle, type NodeProps, Position } from "@xyflow/react";
import { useFlowStore } from "@/lib/store";
import type { SettingNodeType } from "@/lib/types";

export function SettingNode({ data }: NodeProps<SettingNodeType>) {
  const setSettingDescription = useFlowStore((s) => s.setSettingDescription);

  return (
    <div className="w-72 overflow-hidden rounded-lg border border-[var(--node-input-border)] bg-[var(--node-surface)]">
      <div className="h-0.5" style={{ background: "var(--node-setting)" }} />
      <div className="p-4">
        <div
          className="mb-3 font-medium text-xs uppercase tracking-widest"
          style={{ color: "var(--node-setting)" }}
        >
          Setting
        </div>
        <label
          className="mb-1 block text-foreground/70 text-xs"
          htmlFor="setting-description"
        >
          World / era / atmosphere
        </label>
        <textarea
          className="nodrag w-full resize-y rounded-md border border-[var(--node-input-border)] bg-[var(--node-input-bg)] px-2.5 py-1.5 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none"
          id="setting-description"
          onChange={(e) =>
            setSettingDescription({ description: e.target.value })
          }
          placeholder="Describe the world, era, or atmosphere..."
          rows={4}
          value={data.description}
        />
      </div>
      <Handle
        position={Position.Bottom}
        style={{ background: "var(--node-setting)" }}
        type="source"
      />
    </div>
  );
}
