"use client";

import { Handle, type NodeProps, Position } from "@xyflow/react";
import { Loader2, Sparkles } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { NodeErrorBanner } from "@/components/canvas/node-error-banner";
import { RemoveNodeButton } from "@/components/canvas/remove-node-button";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { parseApiErrorResponse, parseUnknownError } from "@/lib/api-error";
import { useFlowStore } from "@/lib/store";
import { getStoryImageAspectRatio } from "@/lib/story-image-aspect-ratio";
import type { MovieNodeType, StoryImageNodeData } from "@/lib/types";

interface FFmpegInstance {
  exec: (args: string[]) => Promise<number>;
  load: (opts: { coreURL: string; wasmURL: string }) => Promise<void>;
  loaded: boolean;
  readFile: (name: string) => Promise<Uint8Array>;
  writeFile: (name: string, data: string | Uint8Array) => Promise<void>;
}

const FFMPEG_CDN_BASE = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";

function getUsableStoryImage(opts: {
  storyImage: string | null | undefined;
}): string | null {
  if (typeof opts.storyImage !== "string" || opts.storyImage.length === 0) {
    return null;
  }
  return opts.storyImage;
}

async function prepareClipInput(opts: {
  imageModel: string;
  setStoryImageGeneratedImage16x9: (opts: {
    nodeId: string;
    image: string | null;
  }) => void;
  siData: StoryImageNodeData;
  siNodeId: string;
  storyImageIndex: number;
}): Promise<{ sceneDescription: string; storyImageData: string }> {
  const baseStoryImage = getUsableStoryImage({
    storyImage: opts.siData.generatedImage,
  });
  const storyImage16x9 = getUsableStoryImage({
    storyImage: opts.siData.generatedImage16x9,
  });
  const frameAspectRatio = getStoryImageAspectRatio({
    index: opts.storyImageIndex,
  });

  if (frameAspectRatio !== "1:1") {
    if (baseStoryImage) {
      return {
        sceneDescription: opts.siData.sceneDescription,
        storyImageData: baseStoryImage,
      };
    }
    if (storyImage16x9) {
      return {
        sceneDescription: opts.siData.sceneDescription,
        storyImageData: storyImage16x9,
      };
    }
    throw new Error("Story image data is required");
  }

  if (storyImage16x9) {
    return {
      sceneDescription: opts.siData.sceneDescription,
      storyImageData: storyImage16x9,
    };
  }

  if (!baseStoryImage) {
    throw new Error("Story image data is required");
  }

  const extendResponse = await fetch("/api/extend-story-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      storyImageData: baseStoryImage,
      sceneDescription: opts.siData.sceneDescription,
      model: opts.imageModel,
    }),
  });

  if (!extendResponse.ok) {
    throw await parseApiErrorResponse({ response: extendResponse });
  }

  const extendedResult = await extendResponse.json();
  const extendedImage = getUsableStoryImage({
    storyImage: extendedResult.image as string | null | undefined,
  });
  if (!extendedImage) {
    throw new Error("No 16:9 image was generated");
  }

  opts.setStoryImageGeneratedImage16x9({
    nodeId: opts.siNodeId,
    image: extendedImage,
  });

  return {
    sceneDescription: opts.siData.sceneDescription,
    storyImageData: extendedImage,
  };
}

export function MovieNode({ id, data }: NodeProps<MovieNodeType>) {
  const removeMovieNode = useFlowStore((s) => s.removeMovieNode);
  const setMovieGeneratedVideoUrl = useFlowStore(
    (s) => s.setMovieGeneratedVideoUrl
  );
  const setMovieError = useFlowStore((s) => s.setMovieError);
  const setMovieIsGenerating = useFlowStore((s) => s.setMovieIsGenerating);
  const setMoviePhase = useFlowStore((s) => s.setMoviePhase);
  const setStoryImageGeneratedImage16x9 = useFlowStore(
    (s) => s.setStoryImageGeneratedImage16x9
  );
  const nodes = useFlowStore((s) => s.nodes);
  const globalSettings = useFlowStore((s) => s.globalSettings);

  const ffmpegRef = useRef<FFmpegInstance | null>(null);
  const [ffmpegLoading, setFfmpegLoading] = useState(false);

  const completedStoryImages = nodes.filter((n) => {
    if (n.type !== "storyImage") {
      return false;
    }
    const storyImageData = n.data as StoryImageNodeData;
    return (
      typeof storyImageData.generatedImage === "string" &&
      storyImageData.generatedImage.length > 0
    );
  });

  const loadFfmpeg = useCallback(async (): Promise<FFmpegInstance> => {
    if (ffmpegRef.current?.loaded) {
      return ffmpegRef.current;
    }

    setFfmpegLoading(true);
    try {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const { toBlobURL } = await import("@ffmpeg/util");

      const ffmpeg = new FFmpeg() as unknown as FFmpegInstance;
      ffmpegRef.current = ffmpeg;

      const coreURL = await toBlobURL(
        `${FFMPEG_CDN_BASE}/ffmpeg-core.js`,
        "text/javascript"
      );
      const wasmURL = await toBlobURL(
        `${FFMPEG_CDN_BASE}/ffmpeg-core.wasm`,
        "application/wasm"
      );

      await ffmpeg.load({ coreURL, wasmURL });
      return ffmpeg;
    } finally {
      setFfmpegLoading(false);
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (completedStoryImages.length === 0 || data.isGenerating) {
      return;
    }

    setMovieError({ nodeId: id, error: null });
    setMovieIsGenerating({ nodeId: id, isGenerating: true });
    setMoviePhase({ nodeId: id, phase: "preparing-images" });

    try {
      const storyImageNodes = nodes.filter(
        (node) => node.type === "storyImage"
      );

      const clipInputs = await Promise.all(
        completedStoryImages.map(async (siNode) => {
          const siData = siNode.data as StoryImageNodeData;
          const storyImageIndex = storyImageNodes.findIndex(
            (node) => node.id === siNode.id
          );
          return await prepareClipInput({
            siData,
            siNodeId: siNode.id,
            storyImageIndex,
            imageModel: globalSettings.imageModel,
            setStoryImageGeneratedImage16x9,
          });
        })
      );

      setMoviePhase({ nodeId: id, phase: "generating-clips" });

      const clipPromises = clipInputs.map(async (clipInput) => {
        const response = await fetch("/api/generate-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storyImageData: clipInput.storyImageData,
            sceneDescription: clipInput.sceneDescription,
            model: globalSettings.videoModel,
          }),
        });

        if (!response.ok) {
          throw await parseApiErrorResponse({ response });
        }

        const buffer = await response.arrayBuffer();
        return new Uint8Array(buffer);
      });

      const clips = await Promise.all(clipPromises);

      if (clips.length === 1) {
        const blob = new Blob([clips[0].buffer as ArrayBuffer], {
          type: "video/mp4",
        });
        const url = URL.createObjectURL(blob);
        setMovieGeneratedVideoUrl({ nodeId: id, url });
        setMoviePhase({ nodeId: id, phase: "idle" });
        return;
      }

      setMoviePhase({ nodeId: id, phase: "concatenating" });

      const ffmpeg = await loadFfmpeg();

      for (const [i, clip] of clips.entries()) {
        await ffmpeg.writeFile(`clip${i}.mp4`, clip);
      }

      const listContent = clips.map((_, i) => `file clip${i}.mp4`).join("\n");
      await ffmpeg.writeFile("list.txt", listContent);

      await ffmpeg.exec([
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        "list.txt",
        "-c",
        "copy",
        "output.mp4",
      ]);

      const outputData = await ffmpeg.readFile("output.mp4");
      const blob = new Blob([outputData.buffer as ArrayBuffer], {
        type: "video/mp4",
      });
      const url = URL.createObjectURL(blob);
      setMovieGeneratedVideoUrl({ nodeId: id, url });
      setMovieError({ nodeId: id, error: null });
    } catch (error: unknown) {
      setMovieError({ nodeId: id, error: parseUnknownError({ error }) });
      setMovieGeneratedVideoUrl({ nodeId: id, url: null });
    } finally {
      setMovieIsGenerating({ nodeId: id, isGenerating: false });
      setMoviePhase({ nodeId: id, phase: "idle" });
    }
  }, [
    completedStoryImages,
    data.isGenerating,
    id,
    globalSettings.videoModel,
    globalSettings.imageModel,
    loadFfmpeg,
    setMovieError,
    setMovieGeneratedVideoUrl,
    setMovieIsGenerating,
    setMoviePhase,
    setStoryImageGeneratedImage16x9,
    nodes,
  ]);

  const getPhaseLabel = () => {
    if (data.phase === "preparing-images") {
      return "Preparing 16:9 story images...";
    }
    if (data.phase === "generating-clips") {
      return "Generating video clips...";
    }
    if (data.phase === "concatenating") {
      return "Concatenating clips...";
    }
    return "Processing...";
  };
  const phaseLabel = getPhaseLabel();

  return (
    <div className="relative w-96 overflow-hidden rounded-lg border border-[var(--node-input-border)] bg-[var(--node-surface)]">
      <Handle
        position={Position.Top}
        style={{ background: "var(--node-movie)" }}
        type="target"
      />
      <div className="h-0.5" style={{ background: "var(--node-movie)" }} />
      <div className="p-4">
        <RemoveNodeButton onClick={() => removeMovieNode({ nodeId: id })} />
        <div
          className="mb-3 font-medium text-xs uppercase tracking-widest"
          style={{ color: "var(--node-movie)" }}
        >
          Movie (experimental)
        </div>

        {data.isGenerating && (
          <div className="mb-3 overflow-hidden rounded">
            <Skeleton className="h-48 w-full" />
            <div className="flex items-center justify-center gap-2 py-2 text-muted-foreground text-xs">
              <Loader2 className="size-3 animate-spin" />
              {phaseLabel}
            </div>
          </div>
        )}

        {ffmpegLoading && !data.isGenerating && (
          <div className="mb-3 flex items-center justify-center gap-2 py-2 text-muted-foreground text-xs">
            <Loader2 className="size-3 animate-spin" />
            Loading FFmpeg...
          </div>
        )}

        {data.error && (
          <NodeErrorBanner
            error={data.error}
            onDismiss={() => setMovieError({ nodeId: id, error: null })}
          />
        )}

        {!data.isGenerating && data.generatedVideoUrl && (
          <div className="mb-3 overflow-hidden rounded">
            <video className="w-full" controls src={data.generatedVideoUrl}>
              <track kind="captions" />
            </video>
          </div>
        )}

        <div className="mb-2 text-muted-foreground text-xs">
          {completedStoryImages.length} completed story image
          {completedStoryImages.length === 1 ? "" : "s"} available
        </div>

        <Button
          className="nodrag w-full"
          disabled={completedStoryImages.length === 0 || data.isGenerating}
          onClick={handleGenerate}
          size="sm"
        >
          {data.isGenerating ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Sparkles className="size-3" />
          )}
          {data.isGenerating ? "Generating..." : "Generate Movie"}
        </Button>
      </div>
    </div>
  );
}
