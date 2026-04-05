import type { GenerateVideoPrompt } from "ai";

interface VideoPromptInput {
  sceneDescription: string;
  storyImageData: string;
}

interface VideoPrompt {
  prompt: GenerateVideoPrompt;
}

export function buildVideoPrompt({
  storyImageData,
  sceneDescription,
}: VideoPromptInput): VideoPrompt {
  return {
    prompt: {
      image: storyImageData,
      text: sceneDescription,
    },
  };
}

export type { VideoPrompt, VideoPromptInput };
