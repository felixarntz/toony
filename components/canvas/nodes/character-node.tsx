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
  CharacterNodeType,
  SettingNodeData,
  StyleNodeData,
} from "@/lib/types";

export function CharacterNode({ id, data }: NodeProps<CharacterNodeType>) {
  const setCharacterDescription = useFlowStore(
    (s) => s.setCharacterDescription
  );
  const setCharacterImages = useFlowStore((s) => s.setCharacterImages);
  const setCharacterIsGenerating = useFlowStore(
    (s) => s.setCharacterIsGenerating
  );
  const removeCharacterNode = useFlowStore((s) => s.removeCharacterNode);
  const nodes = useFlowStore((s) => s.nodes);
  const globalSettings = useFlowStore((s) => s.globalSettings);

  const handleGenerate = useCallback(async () => {
    if (!data.description.trim() || data.isGenerating) {
      return;
    }

    setCharacterIsGenerating({ nodeId: id, isGenerating: true });

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

      const settingDescription = settingData?.description ?? "";
      const model = globalSettings.imageModel;

      const [frontalResponse, sideResponse] = await Promise.all([
        fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "character",
            characterDescription: data.description,
            angle: "frontal",
            styleDescription,
            settingDescription,
            model,
          }),
        }),
        fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "character",
            characterDescription: data.description,
            angle: "side",
            styleDescription,
            settingDescription,
            model,
          }),
        }),
      ]);

      const frontalResult = await frontalResponse.json();
      const sideResult = await sideResponse.json();

      setCharacterImages({
        nodeId: id,
        frontalImage: frontalResult.image ?? null,
        sideImage: sideResult.image ?? null,
      });
    } finally {
      setCharacterIsGenerating({ nodeId: id, isGenerating: false });
    }
  }, [
    data.description,
    data.isGenerating,
    id,
    nodes,
    globalSettings.imageModel,
    setCharacterIsGenerating,
    setCharacterImages,
  ]);

  const hasDescription = data.description.trim().length > 0;
  const hasImages = data.frontalImage !== null || data.sideImage !== null;

  return (
    <div className="relative w-80 rounded-lg border border-teal-500/30 bg-zinc-900 p-4 shadow-lg">
      <Handle className="!bg-teal-500" position={Position.Top} type="target" />
      <RemoveNodeButton onClick={() => removeCharacterNode({ nodeId: id })} />
      <div className="mb-3 font-semibold text-sm text-teal-400 uppercase tracking-wide">
        Character
      </div>
      <label
        className="mb-1 block text-xs text-zinc-400"
        htmlFor={`character-desc-${id}`}
      >
        Description
      </label>
      <textarea
        className="nodrag mb-3 w-full resize-y rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-teal-500 focus:outline-none"
        id={`character-desc-${id}`}
        onChange={(e) =>
          setCharacterDescription({ nodeId: id, description: e.target.value })
        }
        placeholder="Describe this character..."
        rows={3}
        value={data.description}
      />

      {data.isGenerating && (
        <div className="mb-3 overflow-hidden rounded">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Skeleton className="h-36 w-full" />
              <div className="mt-1 text-center text-xs text-zinc-500">
                Frontal
              </div>
            </div>
            <div>
              <Skeleton className="h-36 w-full" />
              <div className="mt-1 text-center text-xs text-zinc-500">Side</div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 py-2 text-xs text-zinc-400">
            <Loader2 className="size-3 animate-spin" />
            Generating portraits...
          </div>
        </div>
      )}

      {!data.isGenerating && hasImages && (
        <div className="mb-3 grid grid-cols-2 gap-2 overflow-hidden rounded">
          <div>
            {data.frontalImage && (
              <Image
                alt="Character frontal portrait"
                className="w-full rounded"
                height={288}
                src={`data:image/png;base64,${data.frontalImage}`}
                unoptimized
                width={144}
              />
            )}
            <div className="mt-1 text-center text-xs text-zinc-500">
              Frontal
            </div>
          </div>
          <div>
            {data.sideImage && (
              <Image
                alt="Character side-view portrait"
                className="w-full rounded"
                height={288}
                src={`data:image/png;base64,${data.sideImage}`}
                unoptimized
                width={144}
              />
            )}
            <div className="mt-1 text-center text-xs text-zinc-500">Side</div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {hasImages && !data.isGenerating ? (
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
        className="!bg-teal-500"
        position={Position.Bottom}
        type="source"
      />
    </div>
  );
}
