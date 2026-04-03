import type { Node } from "@xyflow/react";

export const STYLE_PRESETS = [
  "ghibli-anime",
  "pixar-3d",
  "comic-book",
  "watercolor",
  "retro-cartoon",
  "manga",
  "oil-painting",
  "pixel-art",
  "paper-cutout",
  "claymation",
  "wes-anderson-film",
  "zack-snyder-film",
  "sin-city-noir",
  "custom",
] as const;

export type StylePreset = (typeof STYLE_PRESETS)[number];

export interface StyleNodeData {
  customDescription: string;
  preset: StylePreset;
  [key: string]: unknown;
}

export interface SettingNodeData {
  description: string;
  [key: string]: unknown;
}

export interface LocationNodeData {
  description: string;
  generatedImage: string | null;
  isGenerating: boolean;
  [key: string]: unknown;
}

export interface CharacterNodeData {
  description: string;
  frontalImage: string | null;
  isGenerating: boolean;
  sideImage: string | null;
  [key: string]: unknown;
}

export type StyleNodeType = Node<StyleNodeData, "style">;
export type SettingNodeType = Node<SettingNodeData, "setting">;
export type LocationNodeType = Node<LocationNodeData, "location">;
export type CharacterNodeType = Node<CharacterNodeData, "character">;
export type AppNode =
  | StyleNodeType
  | SettingNodeType
  | LocationNodeType
  | CharacterNodeType;
