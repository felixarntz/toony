"use client";

import { Panel } from "@xyflow/react";
import { ImageIcon, Video } from "lucide-react";
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
    <Panel position="top-right">
      <div className="flex flex-col gap-2 rounded-lg border border-[var(--node-input-border)] bg-[var(--node-surface)] p-2 backdrop-blur-sm">
        <div className="font-medium text-foreground/70 text-xs">Models</div>
        <div className="nodrag">
          <label className="sr-only" htmlFor="image-model-select">
            Image Model
          </label>
          <Select
            onValueChange={(value) => setImageModel({ model: value })}
            value={globalSettings.imageModel}
          >
            <SelectTrigger
              className="h-7 w-full border-[var(--node-input-border)] bg-[var(--node-input-bg)] text-foreground text-xs"
              id="image-model-select"
            >
              <ImageIcon className="size-3.5 shrink-0 text-muted-foreground" />
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
        <div className="nodrag">
          <label className="sr-only" htmlFor="video-model-select">
            Video Model
          </label>
          <Select
            onValueChange={(value) => setVideoModel({ model: value })}
            value={globalSettings.videoModel}
          >
            <SelectTrigger
              className="h-7 w-full border-[var(--node-input-border)] bg-[var(--node-input-bg)] text-foreground text-xs"
              id="video-model-select"
            >
              <Video className="size-3.5 shrink-0 text-muted-foreground" />
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
