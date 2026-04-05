"use client";

import { Handle, type NodeProps, Position } from "@xyflow/react";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import { useCallback } from "react";
import { EditableNodeLabel } from "@/components/canvas/editable-node-label";
import { ImageOverlay } from "@/components/canvas/image-overlay";
import { RemoveNodeButton } from "@/components/canvas/remove-node-button";
import { useLiveTextDraft } from "@/components/canvas/use-live-text-draft";
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
  const descriptionDraft = useLiveTextDraft({
    value: data.description,
    onChange: (description) =>
      setCharacterDescription({ nodeId: id, description }),
  });
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
    <div className="relative w-80 overflow-hidden rounded-lg border border-[var(--node-input-border)] bg-[var(--node-surface)]">
      <Handle
        position={Position.Top}
        style={{ background: "var(--node-character)" }}
        type="target"
      />
      <div className="h-0.5" style={{ background: "var(--node-character)" }} />
      <div className="p-4">
        <RemoveNodeButton onClick={() => removeCharacterNode({ nodeId: id })} />
        <EditableNodeLabel
          className="text-[var(--node-character)]"
          name={data.name}
          onNameChange={(name) => setCharacterName({ nodeId: id, name })}
          placeholder="Character"
        />
        <label
          className="mb-1 block text-foreground/70 text-xs"
          htmlFor={`character-desc-${id}`}
        >
          Description
        </label>
        <textarea
          className="nodrag mb-3 w-full resize-y rounded-md border border-[var(--node-input-border)] bg-[var(--node-input-bg)] px-2.5 py-1.5 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none"
          id={`character-desc-${id}`}
          onBlur={descriptionDraft.onBlur}
          onChange={(e) => descriptionDraft.onChange(e.target.value)}
          onFocus={descriptionDraft.onFocus}
          placeholder="Describe a character for the story..."
          rows={3}
          value={descriptionDraft.value}
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
              <div className="mt-1 text-center text-muted-foreground text-xs">
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
              <div className="mt-1 text-center text-muted-foreground text-xs">
                Side
              </div>
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
      </div>
      <Handle
        position={Position.Bottom}
        style={{ background: "var(--node-character)" }}
        type="source"
      />
    </div>
  );
}
