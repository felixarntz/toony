"use client";

import { Handle, type NodeProps, Position } from "@xyflow/react";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import { useCallback } from "react";
import { ImageOverlay } from "@/components/canvas/image-overlay";
import { RemoveNodeButton } from "@/components/canvas/remove-node-button";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFlowStore } from "@/lib/store";
import {
  getSettingDescription,
  getStyleDescription,
} from "@/lib/style-description";
import type {
  CharacterNodeData,
  LocationNodeData,
  StoryImageNodeData,
  StoryImageNodeType,
} from "@/lib/types";

export function StoryImageNode({ id, data }: NodeProps<StoryImageNodeType>) {
  const setStoryImageLocationId = useFlowStore(
    (s) => s.setStoryImageLocationId
  );
  const setStoryImageCharacterIds = useFlowStore(
    (s) => s.setStoryImageCharacterIds
  );
  const setStoryImageSceneDescription = useFlowStore(
    (s) => s.setStoryImageSceneDescription
  );
  const setStoryImageGeneratedImage = useFlowStore(
    (s) => s.setStoryImageGeneratedImage
  );
  const setStoryImageIsGenerating = useFlowStore(
    (s) => s.setStoryImageIsGenerating
  );
  const removeStoryImageNode = useFlowStore((s) => s.removeStoryImageNode);
  const nodes = useFlowStore((s) => s.nodes);
  const globalSettings = useFlowStore((s) => s.globalSettings);

  const completedLocations = nodes.filter(
    (n) =>
      n.type === "location" &&
      (n.data as LocationNodeData).generatedImage !== null
  );

  const completedCharacters = nodes.filter(
    (n) =>
      n.type === "character" &&
      (n.data as CharacterNodeData).frontalImage !== null &&
      (n.data as CharacterNodeData).sideImage !== null
  );

  const storyImageNodes = nodes.filter((n) => n.type === "storyImage");
  const myIndex = storyImageNodes.findIndex((n) => n.id === id);

  const previousStoryImage =
    myIndex > 0
      ? (storyImageNodes[myIndex - 1].data as StoryImageNodeData)
      : null;

  const styleDescription = getStyleDescription({ nodes });
  const settingDescription = getSettingDescription({ nodes });

  const canGenerate =
    data.sceneDescription.trim().length > 0 &&
    data.locationId !== null &&
    data.characterIds.length > 0 &&
    styleDescription.trim().length > 0 &&
    settingDescription.trim().length > 0 &&
    !data.isGenerating;

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) {
      return;
    }

    setStoryImageIsGenerating({ nodeId: id, isGenerating: true });

    try {
      const locationNode = nodes.find((n) => n.id === data.locationId);
      const locationData = locationNode?.data as LocationNodeData | undefined;

      const characters = data.characterIds
        .map((charId) => {
          const charNode = nodes.find((n) => n.id === charId);
          if (!charNode) {
            return null;
          }
          const charData = charNode.data as CharacterNodeData;
          return {
            name: charData.name || "Character",
            description: charData.description,
            frontalImage: charData.frontalImage ?? "",
            sideImage: charData.sideImage ?? "",
          };
        })
        .filter((c): c is NonNullable<typeof c> => c !== null);

      const response = await fetch("/api/generate-story-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          styleDescription,
          settingDescription,
          locationName: locationData?.name || "Location",
          locationDescription: locationData?.description ?? "",
          locationImage: locationData?.generatedImage ?? "",
          characters,
          sceneDescription: data.sceneDescription,
          previousFrameImage: previousStoryImage?.generatedImage ?? null,
          model: globalSettings.imageModel,
        }),
      });

      const result = await response.json();

      if (result.image) {
        setStoryImageGeneratedImage({ nodeId: id, image: result.image });
      }
    } finally {
      setStoryImageIsGenerating({ nodeId: id, isGenerating: false });
    }
  }, [
    canGenerate,
    data.sceneDescription,
    data.locationId,
    data.characterIds,
    id,
    nodes,
    styleDescription,
    settingDescription,
    globalSettings.imageModel,
    previousStoryImage?.generatedImage,
    setStoryImageIsGenerating,
    setStoryImageGeneratedImage,
  ]);

  const handleCharacterToggle = useCallback(
    (characterId: string) => {
      const current = data.characterIds;
      const next = current.includes(characterId)
        ? current.filter((cId) => cId !== characterId)
        : [...current, characterId];
      setStoryImageCharacterIds({ nodeId: id, characterIds: next });
    },
    [data.characterIds, id, setStoryImageCharacterIds]
  );

  return (
    <div className="relative w-96 rounded-lg border border-purple-500/30 bg-zinc-900 p-4 shadow-lg">
      <Handle
        className="!bg-purple-500"
        position={Position.Top}
        type="target"
      />
      <RemoveNodeButton onClick={() => removeStoryImageNode({ nodeId: id })} />
      <div className="mb-3 font-semibold text-purple-400 text-sm uppercase tracking-wide">
        Story Image {myIndex >= 0 ? `#${myIndex + 1}` : ""}
      </div>

      <label
        className="mb-1 block text-xs text-zinc-400"
        htmlFor={`story-location-${id}`}
      >
        Location
      </label>
      <div className="nodrag mb-3">
        <Select
          onValueChange={(value) =>
            setStoryImageLocationId({ nodeId: id, locationId: value })
          }
          value={data.locationId ?? ""}
        >
          <SelectTrigger className="w-full border-zinc-700 bg-zinc-800 text-zinc-200">
            <SelectValue placeholder="Select a location..." />
          </SelectTrigger>
          <SelectContent>
            {completedLocations.map((loc) => (
              <SelectItem key={loc.id} value={loc.id}>
                {(loc.data as LocationNodeData).name || loc.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <fieldset className="mb-3">
        <legend className="mb-1 block text-xs text-zinc-400">Characters</legend>
        <div className="nodrag space-y-1.5">
          {completedCharacters.map((char) => {
            const charData = char.data as CharacterNodeData;
            const isSelected = data.characterIds.includes(char.id);
            return (
              <label
                className="flex cursor-pointer items-center gap-2 rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-sm text-zinc-200 transition-colors hover:border-zinc-600"
                htmlFor={`story-char-${id}-${char.id}`}
                key={char.id}
              >
                <Checkbox
                  checked={isSelected}
                  id={`story-char-${id}-${char.id}`}
                  onCheckedChange={() => handleCharacterToggle(char.id)}
                />
                <span className="truncate">{charData.name || char.id}</span>
              </label>
            );
          })}
          {completedCharacters.length === 0 && (
            <div className="text-xs text-zinc-500">
              No completed characters available
            </div>
          )}
        </div>
      </fieldset>

      <label
        className="mb-1 block text-xs text-zinc-400"
        htmlFor={`story-desc-${id}`}
      >
        Scene Description
      </label>
      <textarea
        className="nodrag mb-3 w-full resize-y rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-purple-500 focus:outline-none"
        id={`story-desc-${id}`}
        onChange={(e) =>
          setStoryImageSceneDescription({
            nodeId: id,
            sceneDescription: e.target.value,
          })
        }
        placeholder="Describe what happens in this scene..."
        rows={3}
        value={data.sceneDescription}
      />

      {data.generatedImage && !data.isGenerating && (
        <div className="nodrag mb-3 overflow-hidden rounded">
          <ImageOverlay
            alt="Generated story frame"
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
      <Handle
        className="!bg-purple-500"
        position={Position.Bottom}
        type="source"
      />
    </div>
  );
}
