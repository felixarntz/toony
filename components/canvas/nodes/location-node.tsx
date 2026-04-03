"use client";

import { Handle, type NodeProps, Position } from "@xyflow/react";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import { useCallback } from "react";
import { EditableNodeLabel } from "@/components/canvas/editable-node-label";
import { ImageOverlay } from "@/components/canvas/image-overlay";
import { RemoveNodeButton } from "@/components/canvas/remove-node-button";
import { Button } from "@/components/ui/button";
import { useFlowStore } from "@/lib/store";
import {
  getSettingDescription,
  getStyleDescription,
} from "@/lib/style-description";
import type { LocationNodeType } from "@/lib/types";

export function LocationNode({ id, data }: NodeProps<LocationNodeType>) {
  const setLocationName = useFlowStore((s) => s.setLocationName);
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

  const styleDescription = getStyleDescription({ nodes });
  const settingDescription = getSettingDescription({ nodes });
  const hasDescription = data.description.trim().length > 0;
  const hasParentData =
    styleDescription.trim().length > 0 && settingDescription.trim().length > 0;
  const canGenerate = hasDescription && hasParentData && !data.isGenerating;

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) {
      return;
    }

    setLocationIsGenerating({ nodeId: id, isGenerating: true });

    try {
      const response = await fetch("/api/generate-location-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationDescription: data.description,
          styleDescription,
          settingDescription,
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
    canGenerate,
    data.description,
    id,
    styleDescription,
    settingDescription,
    globalSettings.imageModel,
    setLocationIsGenerating,
    setLocationGeneratedImage,
  ]);

  return (
    <div className="relative w-80 overflow-hidden rounded-lg border border-[var(--node-input-border)] bg-[var(--node-surface)]">
      <Handle
        position={Position.Top}
        style={{ background: "var(--node-location)" }}
        type="target"
      />
      <div className="h-0.5" style={{ background: "var(--node-location)" }} />
      <div className="p-4">
        <RemoveNodeButton onClick={() => removeLocationNode({ nodeId: id })} />
        <EditableNodeLabel
          className="text-[var(--node-location)]"
          name={data.name}
          onNameChange={(name) => setLocationName({ nodeId: id, name })}
          placeholder="Location"
        />
        <label
          className="mb-1 block text-foreground/70 text-xs"
          htmlFor={`location-desc-${id}`}
        >
          Description
        </label>
        <textarea
          className="nodrag mb-3 w-full resize-y rounded-md border border-[var(--node-input-border)] bg-[var(--node-input-bg)] px-2.5 py-1.5 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none"
          id={`location-desc-${id}`}
          onChange={(e) =>
            setLocationDescription({ nodeId: id, description: e.target.value })
          }
          placeholder="Describe this location..."
          rows={3}
          value={data.description}
        />

        {data.generatedImage && !data.isGenerating && (
          <div className="nodrag mb-3 overflow-hidden rounded">
            <ImageOverlay
              alt="Generated location"
              src={`data:image/png;base64,${data.generatedImage}`}
            />
          </div>
        )}

        <div className="flex gap-2">
          {data.generatedImage && !data.isGenerating ? (
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
      </div>
      <Handle
        position={Position.Bottom}
        style={{ background: "var(--node-location)" }}
        type="source"
      />
    </div>
  );
}
