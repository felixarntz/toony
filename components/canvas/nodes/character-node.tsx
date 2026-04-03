"use client";

import { Handle, type NodeProps, Position } from "@xyflow/react";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import { useCallback } from "react";
import { ImageOverlay } from "@/components/canvas/image-overlay";
import { RemoveNodeButton } from "@/components/canvas/remove-node-button";
import { Button } from "@/components/ui/button";
import { useFlowStore } from "@/lib/store";
import {
  getSettingDescription,
  getStyleDescription,
} from "@/lib/style-description";
import type { CharacterNodeType } from "@/lib/types";

export function CharacterNode({ id, data }: NodeProps<CharacterNodeType>) {
  const setCharacterName = useFlowStore((s) => s.setCharacterName);
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

  const styleDescription = getStyleDescription({ nodes });
  const settingDescription = getSettingDescription({ nodes });
  const hasDescription = data.description.trim().length > 0;
  const hasParentData =
    styleDescription.trim().length > 0 && settingDescription.trim().length > 0;
  const hasImages = data.frontalImage !== null || data.sideImage !== null;
  const canGenerate = hasDescription && hasParentData && !data.isGenerating;

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) {
      return;
    }

    setCharacterIsGenerating({ nodeId: id, isGenerating: true });

    try {
      const model = globalSettings.imageModel;

      const frontalResponse = await fetch("/api/generate-character-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterDescription: data.description,
          styleDescription,
          settingDescription,
          model,
        }),
      });
      const frontalResult = await frontalResponse.json();
      const frontalImage = frontalResult.image ?? null;

      if (!frontalImage) {
        setCharacterImages({ nodeId: id, frontalImage: null, sideImage: null });
        return;
      }

      setCharacterImages({ nodeId: id, frontalImage, sideImage: null });

      const sideResponse = await fetch("/api/generate-character-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterDescription: data.description,
          frontalImage,
          styleDescription,
          settingDescription,
          model,
        }),
      });
      const sideResult = await sideResponse.json();

      setCharacterImages({
        nodeId: id,
        frontalImage,
        sideImage: sideResult.image ?? null,
      });
    } finally {
      setCharacterIsGenerating({ nodeId: id, isGenerating: false });
    }
  }, [
    canGenerate,
    data.description,
    id,
    styleDescription,
    settingDescription,
    globalSettings.imageModel,
    setCharacterIsGenerating,
    setCharacterImages,
  ]);

  return (
    <div className="relative w-80 rounded-lg border border-teal-500/30 bg-zinc-900 p-4 shadow-lg">
      <Handle className="!bg-teal-500" position={Position.Top} type="target" />
      <RemoveNodeButton onClick={() => removeCharacterNode({ nodeId: id })} />
      <div className="mb-3 font-semibold text-sm text-teal-400 uppercase tracking-wide">
        Character
      </div>
      <label
        className="mb-1 block text-xs text-zinc-400"
        htmlFor={`character-name-${id}`}
      >
        Name
      </label>
      <input
        className="nodrag mb-3 w-full rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-teal-500 focus:outline-none"
        id={`character-name-${id}`}
        onChange={(e) => setCharacterName({ nodeId: id, name: e.target.value })}
        placeholder="e.g. Luna"
        value={data.name}
      />
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

      {hasImages && !data.isGenerating && (
        <div className="nodrag mb-3 grid grid-cols-2 gap-2 overflow-hidden rounded">
          <div>
            {data.frontalImage && (
              <ImageOverlay
                alt="Character frontal portrait"
                src={`data:image/png;base64,${data.frontalImage}`}
              />
            )}
            <div className="mt-1 text-center text-xs text-zinc-500">
              Frontal
            </div>
          </div>
          <div>
            {data.sideImage && (
              <ImageOverlay
                alt="Character side-view portrait"
                src={`data:image/png;base64,${data.sideImage}`}
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
            disabled={!canGenerate}
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
            disabled={!canGenerate}
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
