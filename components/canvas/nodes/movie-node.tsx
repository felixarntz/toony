"use client";

import { Handle, type NodeProps, Position } from "@xyflow/react";
import { Loader2, Sparkles } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { RemoveNodeButton } from "@/components/canvas/remove-node-button";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFlowStore } from "@/lib/store";
import type { MovieNodeType, StoryImageNodeData } from "@/lib/types";

interface FFmpegInstance {
  exec: (args: string[]) => Promise<number>;
  load: (opts: { coreURL: string; wasmURL: string }) => Promise<void>;
  loaded: boolean;
  readFile: (name: string) => Promise<Uint8Array>;
  writeFile: (name: string, data: string | Uint8Array) => Promise<void>;
}

const FFMPEG_CDN_BASE = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";

export function MovieNode({ id, data }: NodeProps<MovieNodeType>) {
  const removeMovieNode = useFlowStore((s) => s.removeMovieNode);
  const setMovieGeneratedVideoUrl = useFlowStore(
    (s) => s.setMovieGeneratedVideoUrl
  );
  const setMovieIsGenerating = useFlowStore((s) => s.setMovieIsGenerating);
  const setMoviePhase = useFlowStore((s) => s.setMoviePhase);
  const nodes = useFlowStore((s) => s.nodes);
  const globalSettings = useFlowStore((s) => s.globalSettings);

  const ffmpegRef = useRef<FFmpegInstance | null>(null);
  const [ffmpegLoading, setFfmpegLoading] = useState(false);

  const completedStoryImages = nodes.filter(
    (n) =>
      n.type === "storyImage" &&
      (n.data as StoryImageNodeData).generatedImage !== null
  );

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

    setMovieIsGenerating({ nodeId: id, isGenerating: true });
    setMoviePhase({ nodeId: id, phase: "generating-clips" });

    try {
      const clipPromises = completedStoryImages.map(async (siNode) => {
        const siData = siNode.data as StoryImageNodeData;
        const response = await fetch("/api/generate-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storyImageData: siData.generatedImage,
            sceneDescription: siData.sceneDescription,
            model: globalSettings.videoModel,
          }),
        });

        if (!response.ok) {
          throw new Error(`Video generation failed for ${siNode.id}`);
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
    } catch {
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
    loadFfmpeg,
    setMovieGeneratedVideoUrl,
    setMovieIsGenerating,
    setMoviePhase,
  ]);

  const getPhaseLabel = () => {
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
    <div className="relative w-96 rounded-lg border border-pink-500/30 bg-zinc-900 p-4 shadow-lg">
      <Handle className="!bg-pink-500" position={Position.Top} type="target" />
      <RemoveNodeButton onClick={() => removeMovieNode({ nodeId: id })} />
      <div className="mb-3 font-semibold text-pink-400 text-sm uppercase tracking-wide">
        Movie
      </div>

      {data.isGenerating && (
        <div className="mb-3 overflow-hidden rounded">
          <Skeleton className="h-48 w-full" />
          <div className="flex items-center justify-center gap-2 py-2 text-xs text-zinc-400">
            <Loader2 className="size-3 animate-spin" />
            {phaseLabel}
          </div>
        </div>
      )}

      {ffmpegLoading && !data.isGenerating && (
        <div className="mb-3 flex items-center justify-center gap-2 py-2 text-xs text-zinc-400">
          <Loader2 className="size-3 animate-spin" />
          Loading FFmpeg...
        </div>
      )}

      {!data.isGenerating && data.generatedVideoUrl && (
        <div className="mb-3 overflow-hidden rounded">
          <video className="w-full" controls src={data.generatedVideoUrl}>
            <track kind="captions" />
          </video>
        </div>
      )}

      <div className="mb-2 text-xs text-zinc-500">
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
  );
}
