"use client";

import { Handle, type NodeProps, Position } from "@xyflow/react";
import { STYLE_PRESET_LABELS } from "@/lib/constants";
import { useFlowStore } from "@/lib/store";
import { STYLE_PRESETS, type StyleNodeType } from "@/lib/types";

export function StyleNode({ data }: NodeProps<StyleNodeType>) {
  const setStylePreset = useFlowStore((s) => s.setStylePreset);
  const setCustomStyleDescription = useFlowStore(
    (s) => s.setCustomStyleDescription
  );

  return (
    <div className="w-72 rounded-lg border border-violet-500/30 bg-zinc-900 p-4 shadow-lg">
      <div className="mb-3 font-semibold text-sm text-violet-400 uppercase tracking-wide">
        Style
      </div>
      <label
        className="mb-1 block text-xs text-zinc-400"
        htmlFor="style-preset"
      >
        Preset
      </label>
      <select
        className="nodrag mb-3 w-full rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-sm text-zinc-200 focus:border-violet-500 focus:outline-none"
        id="style-preset"
        onChange={(e) =>
          setStylePreset({
            preset: e.target.value as StyleNodeType["data"]["preset"],
          })
        }
        value={data.preset}
      >
        {STYLE_PRESETS.map((preset) => (
          <option key={preset} value={preset}>
            {STYLE_PRESET_LABELS[preset]}
          </option>
        ))}
      </select>
      {data.preset === "custom" && (
        <>
          <label
            className="mb-1 block text-xs text-zinc-400"
            htmlFor="style-custom"
          >
            Custom style description
          </label>
          <textarea
            className="nodrag w-full resize-y rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
            id="style-custom"
            onChange={(e) =>
              setCustomStyleDescription({ description: e.target.value })
            }
            placeholder="Describe your visual style..."
            rows={3}
            value={data.customDescription}
          />
        </>
      )}
      <Handle
        className="!bg-violet-500"
        position={Position.Bottom}
        type="source"
      />
    </div>
  );
}
