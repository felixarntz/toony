"use client";

import { Handle, type NodeProps, Position } from "@xyflow/react";
import { useLiveTextDraft } from "@/components/canvas/use-live-text-draft";
import { useFlowStore } from "@/lib/store";
import {
  STYLE_PRESET_LABELS,
  STYLE_PRESETS,
  type StylePreset,
} from "@/lib/style-presets";
import type { StyleNodeType } from "@/lib/types";

export function StyleNode({ data }: NodeProps<StyleNodeType>) {
  const setStylePreset = useFlowStore((s) => s.setStylePreset);
  const setCustomStyleDescription = useFlowStore(
    (s) => s.setCustomStyleDescription
  );
  const customStyleDraft = useLiveTextDraft({
    value: data.customDescription,
    onChange: (description) => setCustomStyleDescription({ description }),
  });

  return (
    <div className="w-72 overflow-hidden rounded-lg border border-[var(--node-input-border)] bg-[var(--node-surface)]">
      <div className="h-0.5" style={{ background: "var(--node-style)" }} />
      <div className="p-4">
        <div
          className="mb-3 font-medium text-xs uppercase tracking-widest"
          style={{ color: "var(--node-style)" }}
        >
          Style
        </div>
        <label
          className="mb-1 block text-foreground/70 text-xs"
          htmlFor="style-preset"
        >
          Preset
        </label>
        <select
          className="nodrag mb-3 w-full rounded-md border border-[var(--node-input-border)] bg-[var(--node-input-bg)] px-2.5 py-1.5 text-foreground text-sm focus:outline-none"
          id="style-preset"
          onChange={(e) =>
            setStylePreset({
              preset: e.target.value as StylePreset,
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
              className="mb-1 block text-foreground/70 text-xs"
              htmlFor="style-custom"
            >
              Custom style description
            </label>
            <textarea
              className="nodrag w-full resize-y rounded-md border border-[var(--node-input-border)] bg-[var(--node-input-bg)] px-2.5 py-1.5 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none"
              id="style-custom"
              onBlur={customStyleDraft.onBlur}
              onChange={(e) => customStyleDraft.onChange(e.target.value)}
              onFocus={customStyleDraft.onFocus}
              placeholder="Describe your visual style..."
              rows={3}
              value={customStyleDraft.value}
            />
          </>
        )}
      </div>
      <Handle
        position={Position.Bottom}
        style={{ background: "var(--node-style)" }}
        type="source"
      />
    </div>
  );
}
