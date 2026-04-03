"use client";

import { Panel } from "@xyflow/react";
import { Settings } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFlowStore } from "@/lib/store";

const IMAGE_MODELS = [
  { id: "google/gemini-3-pro-image", label: "Gemini 3 Pro Image" },
  {
    id: "google/gemini-3.1.flash-image-preview",
    label: "Gemini 3.1 Flash Image",
  },
] as const;

const VIDEO_MODELS = [
  { id: "google/veo-3.0-generate-001", label: "Veo 3.0" },
  { id: "google/veo-3.1-generate-001", label: "Veo 3.1" },
  { id: "xai/grok-imagine-video", label: "Grok Imagine Video" },
  { id: "klingai/kling-v3.0-i2v", label: "Kling v3.0 I2V" },
] as const;

export function ModelSettingsPanel() {
  const globalSettings = useFlowStore((s) => s.globalSettings);
  const setImageModel = useFlowStore((s) => s.setImageModel);
  const setVideoModel = useFlowStore((s) => s.setVideoModel);

  return (
    <Panel position="bottom-right">
      <div className="flex items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-900 p-2 shadow-lg">
        <Settings className="size-4 shrink-0 text-zinc-400" />
        <div className="nodrag flex items-center gap-1.5">
          <label
            className="whitespace-nowrap text-xs text-zinc-400"
            htmlFor="image-model-select"
          >
            Image
          </label>
          <Select
            onValueChange={(value) => setImageModel({ model: value })}
            value={globalSettings.imageModel}
          >
            <SelectTrigger
              className="h-7 w-44 border-zinc-700 bg-zinc-800 text-xs text-zinc-200"
              id="image-model-select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {IMAGE_MODELS.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="nodrag flex items-center gap-1.5">
          <label
            className="whitespace-nowrap text-xs text-zinc-400"
            htmlFor="video-model-select"
          >
            Video
          </label>
          <Select
            onValueChange={(value) => setVideoModel({ model: value })}
            value={globalSettings.videoModel}
          >
            <SelectTrigger
              className="h-7 w-44 border-zinc-700 bg-zinc-800 text-xs text-zinc-200"
              id="video-model-select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VIDEO_MODELS.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Panel>
  );
}
