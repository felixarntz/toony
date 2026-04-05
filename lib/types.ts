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

export interface NodeError {
  message: string;
  statusCode: number;
}

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
  error: NodeError | null;
  generatedImage: string | null;
  isGenerating: boolean;
  name: string;
  [key: string]: unknown;
}

export interface CharacterNodeData {
  description: string;
  error: NodeError | null;
  frontalImage: string | null;
  isGenerating: boolean;
  name: string;
  sideImage: string | null;
  [key: string]: unknown;
}

export interface StoryImageNodeData {
  characterIds: string[];
  error: NodeError | null;
  generatedImage: string | null;
  generatedImage16x9: string | null;
  isGenerating: boolean;
  locationId: string | null;
  sceneDescription: string;
  [key: string]: unknown;
}

export type StyleNodeType = Node<StyleNodeData, "style">;
export type SettingNodeType = Node<SettingNodeData, "setting">;
export type LocationNodeType = Node<LocationNodeData, "location">;
export type CharacterNodeType = Node<CharacterNodeData, "character">;
export interface MovieNodeData {
  error: NodeError | null;
  generatedVideoUrl: string | null;
  isGenerating: boolean;
  phase: "idle" | "preparing-images" | "generating-clips" | "concatenating";
  [key: string]: unknown;
}

export interface ComicStripNodeData {
  generatedPdfUrl: string | null;
  generatedPngUrl: string | null;
  isGenerating: boolean;
  [key: string]: unknown;
}

export type StoryImageNodeType = Node<StoryImageNodeData, "storyImage">;
export type MovieNodeType = Node<MovieNodeData, "movie">;
export type ComicStripNodeType = Node<ComicStripNodeData, "comicStrip">;
export type AppNode =
  | StyleNodeType
  | SettingNodeType
  | LocationNodeType
  | CharacterNodeType
  | StoryImageNodeType
  | MovieNodeType
  | ComicStripNodeType;
