"use client";

import { Handle, type NodeProps, Position } from "@xyflow/react";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import Image from "next/image";
import { useCallback } from "react";
import { RemoveNodeButton } from "@/components/canvas/remove-node-button";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { STYLE_PRESET_DESCRIPTIONS } from "@/lib/constants";
import { useFlowStore } from "@/lib/store";
import type {
  LocationNodeType,
  SettingNodeData,
  StyleNodeData,
} from "@/lib/types";

export function LocationNode({ id, data }: NodeProps<LocationNodeType>) {
  const setLocationDescription = useFlowStore((s) => s.setLocationDescription);
  const setLocationGeneratedImage = useFlowStore(
    (s) => s.setLocationGeneratedImage
  );
  const setLocationIsGenerating = useFlowStore(
    (s) => s.setLocationIsGenerating
  );
  const removeLocationNode = useFlowStore((s) => s.removeLocationNode);
  const nodes = useFlowStore((s) => s.nodes);
  const globalSettings = useFlowStore((s) => s.globalSettings);

  const handleGenerate = useCallback(async () => {
    if (!data.description.trim() || data.isGenerating) {
      return;
    }

    setLocationIsGenerating({ nodeId: id, isGenerating: true });

    try {
      const styleNode = nodes.find((n) => n.type === "style");
      const settingNode = nodes.find((n) => n.type === "setting");

      const styleData = styleNode?.data as StyleNodeData | undefined;
      const settingData = settingNode?.data as SettingNodeData | undefined;

      let styleDescription = "";
      if (styleData) {
        styleDescription =
          styleData.preset === "custom"
            ? styleData.customDescription
            : (STYLE_PRESET_DESCRIPTIONS[
                styleData.preset as Exclude<typeof styleData.preset, "custom">
              ] ?? "");
      }

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "location",
          locationDescription: data.description,
          styleDescription,
          settingDescription: settingData?.description ?? "",
          model: globalSettings.imageModel,
        }),
      });

      const result = await response.json();

      if (result.image) {
        setLocationGeneratedImage({ nodeId: id, image: result.image });
      }
    } finally {
      setLocationIsGenerating({ nodeId: id, isGenerating: false });
    }
  }, [
    data.description,
    data.isGenerating,
    id,
    nodes,
    globalSettings.imageModel,
    setLocationIsGenerating,
    setLocationGeneratedImage,
  ]);

  const hasDescription = data.description.trim().length > 0;

  return (
    <div className="relative w-80 rounded-lg border border-amber-500/30 bg-zinc-900 p-4 shadow-lg">
      <Handle className="!bg-amber-500" position={Position.Top} type="target" />
      <RemoveNodeButton onClick={() => removeLocationNode({ nodeId: id })} />
      <div className="mb-3 font-semibold text-amber-400 text-sm uppercase tracking-wide">
        Location
      </div>
      <label
        className="mb-1 block text-xs text-zinc-400"
        htmlFor={`location-desc-${id}`}
      >
        Description
      </label>
      <textarea
        className="nodrag mb-3 w-full resize-y rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
        id={`location-desc-${id}`}
        onChange={(e) =>
          setLocationDescription({ nodeId: id, description: e.target.value })
        }
        placeholder="Describe this location..."
        rows={3}
        value={data.description}
      />

      {data.isGenerating && (
        <div className="mb-3 overflow-hidden rounded">
          <Skeleton className="h-44 w-full" />
          <div className="flex items-center justify-center gap-2 py-2 text-xs text-zinc-400">
            <Loader2 className="size-3 animate-spin" />
            Generating...
          </div>
        </div>
      )}

      {!data.isGenerating && data.generatedImage && (
        <div className="mb-3 overflow-hidden rounded">
          <Image
            alt="Generated location"
            className="w-full"
            height={288}
            src={`data:image/png;base64,${data.generatedImage}`}
            unoptimized
            width={288}
          />
        </div>
      )}

      <div className="flex gap-2">
        {data.generatedImage && !data.isGenerating ? (
          <Button
            className="nodrag flex-1"
            disabled={!hasDescription || data.isGenerating}
            onClick={handleGenerate}
            size="sm"
            variant="outline"
          >
            <RefreshCw className="size-3" />
            Regenerate
          </Button>
        ) : (
          <Button
            className="nodrag flex-1"
            disabled={!hasDescription || data.isGenerating}
            onClick={handleGenerate}
            size="sm"
          >
            {data.isGenerating ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Sparkles className="size-3" />
            )}
            {data.isGenerating ? "Generating..." : "Generate"}
          </Button>
        )}
      </div>
      <Handle
        className="!bg-amber-500"
        position={Position.Bottom}
        type="source"
      />
    </div>
  );
}
