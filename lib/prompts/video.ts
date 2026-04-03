interface VideoPromptInput {
  sceneDescription: string;
  storyImageData: string;
}

interface VideoPromptOutput {
  prompt: {
    image: string;
    text: string;
  };
}

export function buildVideoPrompt({
  storyImageData,
  sceneDescription,
}: VideoPromptInput): VideoPromptOutput {
  return {
    prompt: {
      image: storyImageData,
      text: sceneDescription,
    },
  };
}

export type { VideoPromptInput, VideoPromptOutput };
