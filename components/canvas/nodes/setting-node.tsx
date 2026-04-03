"use client";

import { Handle, type NodeProps, Position } from "@xyflow/react";
import { useFlowStore } from "@/lib/store";
import type { SettingNodeType } from "@/lib/types";

export function SettingNode({ data }: NodeProps<SettingNodeType>) {
  const setSettingDescription = useFlowStore((s) => s.setSettingDescription);

  return (
    <div className="w-72 rounded-lg border border-emerald-500/30 bg-zinc-900 p-4 shadow-lg">
      <div className="mb-3 font-semibold text-emerald-400 text-sm uppercase tracking-wide">
        Setting
      </div>
      <label
        className="mb-1 block text-xs text-zinc-400"
        htmlFor="setting-description"
      >
        World / era / atmosphere
      </label>
      <textarea
        className="nodrag w-full resize-y rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-none"
        id="setting-description"
        onChange={(e) => setSettingDescription({ description: e.target.value })}
        placeholder="Describe the world, era, or atmosphere..."
        rows={4}
        value={data.description}
      />
      <Handle
        className="!bg-emerald-500"
        position={Position.Bottom}
        type="source"
      />
    </div>
  );
}
